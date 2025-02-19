import urllib.request
import urllib.parse
import urllib.error
import json
import logging


def post_message(logger: logging.Logger, webhook_url: str, message: str):
    logger.info(message)
    logger.debug(webhook_url)
    data = {"content": message}

    # データをJSON形式に変換 + エンコード
    data = json.dumps(data).encode()

    # POSTリクエストの作成
    request = urllib.request.Request(
        webhook_url,
        data,
        headers={"Content-Type": "application/json", "User-Agent": "PythonScript"},
        method="POST",
    )

    # POSTリクエストを送信して、レスポンスを取得
    try:
        with urllib.request.urlopen(request) as response:
            response: bytes = response.read()
            logger.info(response.decode())
    except urllib.error.HTTPError as e:
        logger.error(e)
