import os
import logging
import boto3


# ログの設定
logger = logging.getLogger(__name__)
logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))


def lambda_handler(event, context):
    # ssm = boto3.client('ssm')
    # response = ssm.get_parameters(
    #     Names=[Parameter Store Key],
    #     WithDecryption=True
    # )
    # リクエストをログ
    logger.debug(event)
    logger.debug(context)
    # POST以外のメソッドに対するエラーレスポンス
    return {"statusCode": 200, "body": "test"}
