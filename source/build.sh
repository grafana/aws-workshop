#!/usr/bin/env bash

set -euo pipefail

aws ecr get-login-password --region us-east-1 | podman login --username AWS --password-stdin 008971678742.dkr.ecr.us-east-1.amazonaws.com

podman build --build-arg SERVICE=tickets-requester -f ./docker/Dockerfile -t 008971678742.dkr.ecr.us-east-1.amazonaws.com/aws-workshop/tickets-requester .
podman build --build-arg SERVICE=tickets-server -f ./docker/Dockerfile -t 008971678742.dkr.ecr.us-east-1.amazonaws.com/aws-workshop/tickets-server .
podman build -t 008971678742.dkr.ecr.us-east-1.amazonaws.com/aws-workshop/tickets-load-tester tickets-load-tester/

podman push 008971678742.dkr.ecr.us-east-1.amazonaws.com/aws-workshop/tickets-requester
podman push 008971678742.dkr.ecr.us-east-1.amazonaws.com/aws-workshop/tickets-server
podman push 008971678742.dkr.ecr.us-east-1.amazonaws.com/aws-workshop/tickets-load-tester
