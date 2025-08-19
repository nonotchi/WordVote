import json
import os
import boto3
import uuid
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
votes = dynamodb.Table('WordVote_votes')
connections = dynamodb.Table('WordVote')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
       if isinstance(obj, Decimal):
           return int(obj)
       return json.JSONEncoder.default(self, obj)

def lambda_handler(event, context):
    print(event)
    body = event

    data_type = body.get('type')
    ttl = int((datetime.now() + timedelta(days=7)).timestamp())

    vote_id = body.get('voteid')
    apigateway = boto3.client('apigatewaymanagementapi',
                                    endpoint_url="https://\{URL\}.execute-api.ap-northeast-1.amazonaws.com/v1?voteid=" + vote_id)

    if vote_id is None:
        return { 'statusCode': 400,'body': 'bad request' }

    if data_type == 'start':    # 投票の作成
        vote_name = body.get('name')

        result = votes.put_item(Item={
            'voteid': vote_id,
            'wordid': '-',
            'word': vote_name,
            'votes': 0,
            'del': ttl
            })

    elif data_type == 'get':    # 投票の取得
        response = votes.query(
            KeyConditionExpression=Key('voteid').eq(vote_id)
        )

        items = connections.scan(ProjectionExpression='id,voteid').get('Items')
        for item in items:
            connection_id = item.get('id')
            if item.get('voteid') != vote_id:
                continue

            if response is None:
                apigateway.post_to_connection(ConnectionId=connection_id, Data='Not found')
            else:
                apigateway.post_to_connection(ConnectionId=connection_id, Data=json.dumps(response['Items'], cls=DecimalEncoder))

    elif data_type == 'add':    # 新規ワードの追加
        word_str = body.get('word')
        word_id = uuid.uuid4().hex
        
        result = votes.put_item(Item={
            'voteid': vote_id,
            'wordid': word_id,
            'word': word_str,
            'votes': 0,
            'del': ttl
            })

        response = votes.query(
            KeyConditionExpression=Key('voteid').eq(vote_id)
        )

        items = connections.scan(ProjectionExpression='id,voteid').get('Items')
        for item in items:
            if item.get('voteid') != vote_id:
                continue

            connection_id = item.get('id')
            apigateway.post_to_connection(ConnectionId=connection_id, Data=json.dumps(response['Items'], cls=DecimalEncoder))

    elif data_type == 'vote':   # ワードに対して投票する
        word_id = body.get('wordid')

        result = votes.update_item(
            Key={
                'voteid': vote_id,
                'wordid': word_id
            },
            UpdateExpression='SET votes = votes + :val',
            ExpressionAttributeValues={
                ':val': 1
            }
        )

        response = votes.query(
            KeyConditionExpression=Key('voteid').eq(vote_id)
        )
        
        items = connections.scan(ProjectionExpression='id,voteid').get('Items')
        for item in items:
            if item.get('voteid') != vote_id:
                continue

            connection_id = item.get('id')
            apigateway.post_to_connection(ConnectionId=connection_id, Data=json.dumps(response['Items'], cls=DecimalEncoder))
        
    return { 'statusCode': 200,'body': 'ok' }
