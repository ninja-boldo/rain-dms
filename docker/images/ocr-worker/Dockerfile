FROM oven/bun:1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    unzip \
    poppler-utils \
    poppler-data \
    libexpat1 \
    libglib2.0-0 \
    libgl1 \
    libx11-6 \
    libxext6 \
    libsm6 \
    libxrender1 \
    libgomp1 \
    libjemalloc2 \
    python3 \
    make \
    python-is-python3 \
    g++ \
    build-essential \
    pkg-config \
    libx11-dev \
    libxi-dev \
    libxext-dev \
    libgl1-mesa-dev \
    && rm -rf /var/lib/apt/lists/*


COPY package.json bun.lock ./
COPY ../backend ./backend/
RUN rm -rf backend/node_modules

RUN cd backend && bun install --frozen-lockfile

RUN cat > /tmp/warmup.ts << 'EOF'
import { PaddleOcrService, V6_MEDIUM_MODEL, V6_SMALL_MODEL, V6_TINY_MODEL } from "ppu-paddle-ocr";

const tinyService = new PaddleOcrService({
    model: V6_TINY_MODEL,
});
await tinyService.initialize();
const smallService = new PaddleOcrService({
    model: V6_SMALL_MODEL,
});
await smallService.initialize();
const mediumService = new PaddleOcrService({
    model: V6_MEDIUM_MODEL,
});
await smallService.initialize();
console.log("PaddleOCR models (Small & Tiny) cached.");
EOF

RUN cd /app/backend && bun run /tmp/warmup.ts && rm /tmp/warmup.ts

WORKDIR /app/backend

CMD ["bun", "run", "./start_ocr.ts"]