# Usar la misma versión base para build y runtime
FROM rustlang/rust:nightly-bullseye AS builder

# Instalar dependencias necesarias para build
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de proyecto
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY .sqlx .sqlx

# Build de la aplicación
RUN cargo build --release

# Runtime image - usar la misma base que el builder
FROM debian:bullseye-slim AS runtime

RUN apt-get update && apt-get install -y \
    libssl1.1 \
    libpq5 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r app && useradd -r -g app app

WORKDIR /app

COPY --from=builder /app/target/release/inventario_api /app/

RUN chown -R app:app /app

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["./inventario_api"]