FROM docker.io/grafana/xk6:latest@sha256:2bf2f319554253656a00fa9224bc7b40bc401e45b9f04041074d62e39561c084 AS builder

# Build the xk6 binary with the required extensions
RUN xk6 build --with github.com/grafana/xk6-faker@latest

FROM docker.io/library/debian:12-slim@sha256:3783cc01769c7b2b1b83a5c5ad96c815348e28ed7da68e2e3687004faa906251

COPY --from=builder /xk6/k6 /usr/bin/k6

COPY script.js .

ENTRYPOINT ["k6", "run", "script.js"]
