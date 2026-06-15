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
    && rm -rf /var/lib/apt/lists/*

ENV MALLOC_ARENA_MAX=2
ENV OMP_PROC_BIND=true
ENV OMP_PLACES=cores
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

COPY package.json bun.lock ./
COPY ../backend ./backend/
RUN rm -rf backend/node_modules

RUN cd backend && bun install --frozen-lockfile

RUN cat > /tmp/warmup.ts << 'EOF'
import { batchExtractFilesSync } from "@kreuzberg/node";
import sharp from "sharp";
import { unlinkSync } from "fs";
const p = "/tmp/_w.jpg";
await sharp({ create: { width: 8, height: 8, channels: 3, background: { r: 255, g: 255, b: 255 } } }).jpeg().toFile(p);
try {
  batchExtractFilesSync([p], {
    outputFormat: "plain",
    ocr: {
      backend: "paddle-ocr",
      elementConfig: { includeElements: false, minLevel: "line", minConfidence: 0.5, buildHierarchy: false },
      paddleOcrConfig: { recBatchNum: 1, detLimitSideLen: 960 },
    },
  });
} catch {}
unlinkSync(p);
console.log("PaddleOCR models cached.");
EOF

RUN cd /app/backend && bun run /tmp/warmup.ts && rm /tmp/warmup.ts

WORKDIR /app/backend

CMD ["bun", "run", "./start_ocr.ts"]
