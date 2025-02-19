import json
import os
from aws_lambda_powertools.utilities import parameters
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools import Logger
import urllib.request
import urllib.parse
import urllib.error

logger = Logger(child=True)


def post_message(webhook_url: str, message: str):
    data = {"content": message}

    # データをJSON形式に変換 + エンコード
    encoded_data: bytes = json.dumps(data).encode()

    # POSTリクエストの作成
    request = urllib.request.Request(
        webhook_url,
        encoded_data,
        headers={"Content-Type": "application/json", "User-Agent": "PythonScript"},
        method="POST",
    )

    # POSTリクエストを送信して、レスポンスを取得
    try:
        with urllib.request.urlopen(request) as response:
            content: bytes = response.read()
            return content
    except urllib.error.HTTPError as e:
        logger.error(e)


# @logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict, context: LambdaContext):

    parameter_ttl_seconds_raw = os.getenv("PARAMETER_TTL_SECONDS", None)
    parameter_ttl_seconds = (
        int(parameter_ttl_seconds_raw)
        if parameter_ttl_seconds_raw is not None
        else None
    )
    records: list[dict] = event["Records"]
    logger.info(records)
    for r in records:
        message: dict = r["message"]
        ssm_webhook_url = message["ssm_webhook_url"]
        webhook_url = parameters.get_parameter(
            name=ssm_webhook_url, decrypt=True, max_age=parameter_ttl_seconds
        )
        body: str = message["body"]
    response = post_message(webhook_url, body)

    return {"statusCode": 200, "body": response}
