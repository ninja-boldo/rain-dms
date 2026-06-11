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

# Better allocator for many inference workloads
ENV MALLOC_ARENA_MAX=2

# Better CPU affinity behavior for OpenMP-based libraries
ENV OMP_PROC_BIND=true
ENV OMP_PLACES=cores

# Use jemalloc on x86 systems
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

COPY package.json bun.lock ./
COPY ../backend ./backend/

RUN cd backend && bun install --frozen-lockfile

WORKDIR /app/backend

CMD ["bun", "run", "./start_ocr.ts"]