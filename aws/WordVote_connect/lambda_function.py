import json
import os
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
connections = dynamodb.Table('WordVote')

def lambda_handler(event, context):
    connection_id = event.get('requestContext',{}).get('connectionId')

    ttl = int((datetime.now() + timedelta(days=1)).timestamp())
    result = connections.put_item(Item={
        'id': connection_id,
        'del': ttl,
        'voteid': event.get('queryStringParameters')['voteid']  # WSのURLにクエリパラメータを付与する
        })
        
    return { 'statusCode': 200,'body': 'ok' }
