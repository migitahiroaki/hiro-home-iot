import urllib.request
import urllib.parse
import os
import json


def get_parameter(ssm_param_name: str, param_type="SSM_SECURE") -> str:
    URL_BASE = "http://localhost:2773"
    end_point = ""
    if param_type == "SSM_PLAINE" or "SSM_SECURE":
        with_decryption = str(param_type == "SSM_SECURE").lower()
        params = {"name": ssm_param_name, "withDecryption": with_decryption}
        end_point = f"{URL_BASE}/systemsmanager/parameters/get/?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url=end_point,
        headers={"X-Aws-Parameters-Secrets-Token": os.environ["AWS_SESSION_TOKEN"]},
    )
    with urllib.request.urlopen(request) as response:
        body: bytes = response.read()
        value = json.loads(body.decode("utf-8"))["Parameter"]["Value"]
        return value
