FROM oven/bun:1-slim AS encore-fetch
ARG ENCORE_CLI_VERSION=1.56.5
ENTRYPOINT []
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       -o Dpkg::Options::="--force-confold" \
       ca-certificates curl tar \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /out/.encore \
    && curl -fsSL "https://d2f391esomvqpi.cloudfront.net/encore-${ENCORE_CLI_VERSION}-linux_amd64.tar.gz" | tar -xz -C /out/.encore \
    && chmod +x /out/.encore/bin/encore

FROM oven/bun:1-slim
ENTRYPOINT []

COPY --from=encore-fetch /out/.encore /root/.encore

ENV PATH="/root/.encore/bin:${PATH}"
ENV DISABLE_ENCORE_TELEMETRY=1
ENV CI=1

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
RUN encore check

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["encore", "run", "--watch=false", "--browser=never", "--listen", "0.0.0.0", "-p", "8080"]
