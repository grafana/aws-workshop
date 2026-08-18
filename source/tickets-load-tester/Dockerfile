FROM docker.io/grafana/xk6:latest@sha256:d37da6ad333621260d969a12438e5e762d4a0a41849d85082a81c34b93fbdc2f AS builder

# Build the xk6 binary with the required extensions
RUN xk6 build --with github.com/grafana/xk6-faker@latest

FROM docker.io/library/debian:12-slim@sha256:abd67ffcfa541b485a3dff59865ab629aa048a6c613e639d36e7456b0b229241

COPY --from=builder /xk6/k6 /usr/bin/k6

COPY script.js .

ENTRYPOINT ["k6", "run", "script.js"]
