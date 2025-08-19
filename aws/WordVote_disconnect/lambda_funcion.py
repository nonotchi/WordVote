import json
import os
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
connections = dynamodb.Table('WordVote')

def lambda_handler(event, context):
    connection_id = event.get('requestContext',{}).get('connectionId')

    result = connections.delete_item(Key={ 'id': connection_id })
    
    return { 'statusCode': 200,'body': 'ok' }
