FROM oven/bun:1

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    poppler-utils \
    poppler-data \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
COPY ../backend ./backend/
RUN rm -rf backend/node_modules
COPY ../frontend/dist ./frontend/dist

RUN cd backend && bun install --frozen-lockfile

WORKDIR /app/backend

CMD ["sh", "-c", "update-ca-certificates bun run db && bun run dev"]
