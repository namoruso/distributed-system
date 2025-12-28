-- Add migration script here

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL UNIQUE,
    stock INTEGER NOT NULL,
    minimun INTEGER NOT NULL,
    maximun BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status boolean DEFAULT TRUE NOT NULL
);