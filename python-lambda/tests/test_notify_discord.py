from collections import namedtuple

from notify_discord import lambda_function

# from aws_lambda_powertools.utilities import parameters
import pytest


@pytest.fixture
def lambda_context():
    context = {
        "function_name": "notify_discord",
        "memory_limit_in_mb": 128,
        "invoked_function_arn": "arn:aws:lambda:ap-northeast-1:123456789012:function:notify_discord",
        "aws_request_id": "20b4014c-beb2-839ce70cb-470d-13b618e",
    }

    return namedtuple("LambdaContext", context.keys())(*context.values())


def test_positive(mocker, lambda_context):
    mocker.patch(
        "aws_lambda_powertools.utilities.parameters.get_parameter",
        return_value="https://mock.jp",
    )
    mocker.patch("post_message", return_value={"statusCode": 200, "body": "dummy"})
    event = {
        "Records": [
            {
                "message": {
                    "ssm_webhook_url": "arn:aws:ssm:us-east-2:111222333444:parameter/dummy",
                    "body": "hello world",
                }
            }
        ]
    }

    actual = lambda_function.lambda_handler(event, lambda_context)
    print(actual)
    assert "dummy" == actual
    # handler(event, lambda_context)
