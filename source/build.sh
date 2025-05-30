#!/usr/bin/env bash

set -euo pipefail

aws ecr get-login-password --region us-east-1 | podman login --username AWS --password-stdin 008971678742.dkr.ecr.us-east-1.amazonaws.com

podman build --build-arg SERVICE=mythical-beasts-requester -f ./docker/Dockerfile -t 008971678742.dkr.ecr.us-east-1.amazonaws.com/mythical/mythical-requester .
podman build --build-arg SERVICE=mythical-beasts-server -f ./docker/Dockerfile -t 008971678742.dkr.ecr.us-east-1.amazonaws.com/mythical/mythical-server .

podman build -t 008971678742.dkr.ecr.us-east-1.amazonaws.com/mythical/mythical-load-tester mythical-load-tester/

podman push 008971678742.dkr.ecr.us-east-1.amazonaws.com/mythical/mythical-requester
podman push 008971678742.dkr.ecr.us-east-1.amazonaws.com/mythical/mythical-server
podman push 008971678742.dkr.ecr.us-east-1.amazonaws.com/mythical/mythical-load-tester
