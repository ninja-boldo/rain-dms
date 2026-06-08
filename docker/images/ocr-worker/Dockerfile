FROM oven/bun:slim
WORKDIR /app

ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libtcmalloc.so.4"
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV ONNXRUNTIME_NUM_THREADS=1

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
    poppler-data \
    poppler-utils \
    libgoogle-perftools4 \
    libopenblas-dev \
    libopenblas0 \
    libonnxruntime-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY ../backend/ ./backend/

RUN cd backend && bun install --frozen-lockfile

WORKDIR /app/backend
CMD ["bun", "run", "./start_ocr.ts"]