FROM docker.io/grafana/xk6:latest@sha256:478eee4ccab9909bbd3fec223a20d6a1a2c2e1177f5972f9db6a4448077e7cf2 AS builder

# Build the xk6 binary with the required extensions
RUN xk6 build --with github.com/grafana/xk6-faker@latest

FROM docker.io/library/debian:12-slim@sha256:99c0b25c46d0214d5a2091092e7908907dcaecd6a962cde0ac700acee222b6f3

COPY --from=builder /xk6/k6 /usr/bin/k6

COPY script.js .

ENTRYPOINT ["k6", "run", "script.js"]
