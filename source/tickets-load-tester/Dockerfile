FROM docker.io/grafana/xk6:latest@sha256:905af13917e617ec946c694a3bc8eddfe8c26afa7a6b52470d02259d9dcbdb3a AS builder

# Build the xk6 binary with the required extensions
RUN xk6 build --with github.com/grafana/xk6-faker@latest

FROM docker.io/library/debian:12-slim@sha256:88200866dfff7ea7f5cbcb6ec7c8a701889efe6fe859fe64d6990e4b07ea4171

COPY --from=builder /xk6/k6 /usr/bin/k6

COPY script.js .

ENTRYPOINT ["k6", "run", "script.js"]
