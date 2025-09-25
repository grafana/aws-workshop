#!/usr/bin/env bash

xk6 build --with github.com/grafana/xk6-faker@latest

K6_VUS=30 K6_DURATION=5s ./k6 run script.js

