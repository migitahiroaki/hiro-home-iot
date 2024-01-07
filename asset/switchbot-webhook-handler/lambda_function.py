import os
import logging
import boto3
import json
import post_webhook


# ログの設定
logger = logging.getLogger(__name__)
logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))

LOW_BATTERY_THRESHOLD = 20


def lambda_handler(event, context):
    # リクエストをログ
    logger.debug(event)
    logger.debug(context)

    body: dict = json.loads(event["body"])
    # ロックの場合
    if not "deviceType" in body and "lockState" in body["context"]:
        battery_int = int(body["context"]["battery"])
        battery_text = (
            f":low_battery: {battery_int}%"
            if battery_int < LOW_BATTERY_THRESHOLD
            else f":battery:{battery_int}%"
        )
        lock_state_text = ""
        lock_state = body["context"]["lockState"]
        match lock_state:
            case "LOCKED":
                lock_state_text = ":lock:LOCKED"
            case "UNLOCKED":
                lock_state_text = ":unlock:UNLOCKED"
            case _:
                logger.warning(f"illigal lockState {body}")
                raise ValueError("IlligalLockStateError")
        load_ssm_and_post(f"{lock_state_text}, {battery_text}")

    return {"statusCode": 200, "body": "test"}


def load_ssm_and_post(message: str):
    ssm = boto3.client("ssm")
    response: dict = ssm.get_parameter(
        Name=os.environ["SSM_WEBHOOK_URL"], WithDecryption=True
    )
    webhook_url: str = response["Parameter"]["Value"]
    logger.debug(webhook_url)

    post_webhook.post_message(logger=logger, webhook_url=webhook_url, message=message)
