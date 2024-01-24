#/usr/bin/sh
docker run -v $(pwd):/app public.ecr.aws/sam/build-python3.10:1.107.0-20240110200815 pip install -r /app/requirements.txt -t /app/python
