FROM debian:bookworm-slim AS base

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    libexpat1 \
    libglib2.0-0 \
    libgl1 \
    libx11-6 \
    libxext6 \
    libsm6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# install bun
ENV BUN_INSTALL=/usr/local/bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN curl -fsSL https://bun.sh/install | bash

WORKDIR /app

# =========================
# Install dependencies stage
# =========================
FROM base AS installer
WORKDIR /app

COPY package.json ./

RUN bun install 

COPY backend/ ./backend


# =========================
# Runtime stage
# =========================
FROM base
WORKDIR /app

COPY --from=installer /app ./

USER root

CMD ["bun", "run", "backend/workers/FileProcessor.ts"]