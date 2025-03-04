#!/bin/bin
poetry run uwsgi  --http :8888 --wsgi-file main.py --callable app --processes 1 --threads 10