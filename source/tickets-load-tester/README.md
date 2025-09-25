# load testing script

This k6 script is designed to simulate a load test for a booking service. It uses the `xk6-faker` extension to generate random data for the booking requests.

If you want to run this load testing script locally, you can use:

```
xk6 build --with github.com/grafana/xk6-faker@latest

K6_VUS=30 K6_DURATION=5s URL=http://url-to-the-service/booking ./k6 run script.js
```
