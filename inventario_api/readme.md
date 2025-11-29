# Products Service API

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)]
[![Laravel](https://img.shields.io/badge/Axum-0.7-yellow.svg)]
[![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)]

A RESTful microservice for inventory management built with Rust-Axum and PostgreSQL. Part of a distributed system architecture with JWT authentication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Reference](#api-reference)
    - [Authentication Endpoints](#authentication-endpoints)
    - [Product Endpoints](#product-endpoints)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

The Products Service is a microservice designed to handle all product-related operations in a distributed system. It provides a complete CRUD API with JWT authentication, built following REST principles and best practices.

**Base URL:** `http://localhost:5002/api`

**Current Version:** v0.1.0

---

## Features

- ✅ **Complete CRUD operations** for products
- 🐘 **PostgreSQL database** with optimized queries
- 🔐 **JWT Authentication**
- 🐳 **Docker containerized** for easy deployment
- 📝 **Input validation** and error handling
- 🌐 **CORS enabled** for frontend integration
- 🔄 **RESTful API design** following industry standards
- 📊 **Structured JSON responses** with consistent format

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0+)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/namoruso/distributed-system
cd inventario_api
```

2. **Start Docker containers**

```bash
docker-compose up -d --build
```

3. **Verify installation**

Visit `http://localhost:5002`

### Configuration

The service uses environment variables for configuration. Key settings in `.env`:

DB_URL=postgresql://user:password@host:port/db

PORT=5002

JWT_SECRET_KEY=token

## API Reference

### inventory Endpoints

#### List All Products

Retrieves a list of all products and stock.

```http
GET /api/inventory/all
```

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
[
    {
        "created_at": "2025-11-25T16:38:57.326855Z",
        "id": 1,
        "sku": "unique_value",
        "maximun": 20,
        "minimun": 19,
        "name": "jabon",
        "status": true,
        "stock": 20,
        "updated_at": "2025-11-25T16:38:57.326855Z"
    },
    {
        "created_at": "2025-11-25T16:51:06.467151Z",
        "id": 2,
        "sku": "unique_value",
        "maximun": 100,
        "minimun": 10,
        "name": "queso",
        "status": true,
        "stock": 25,
        "updated_at": "2025-11-25T16:51:06.467151Z"
    }
]
```

---

#### Get Single Product

Retrieves details of a specific product by ID.

```http
GET /api/inventory/{id}
```

**Headers**

```http
Authorization: Bearer {token}
```

**Path Parameters**

|Parameter|Type|Description|
|---|---|---|
|`id`|integer|The product ID|


**Example Response** - `200 OK`

```json
{
    "created_at": "2025-11-25T19:16:23.771108Z",
    "id": 5,
    "sku": "unique_value",
    "maximun": 100,
    "minimun": 19,
    "name": "ventiladores",
    "status": true,
    "stock": 27,
    "updated_at": "2025-11-25T20:42:33.112252Z"
}
```

**Error Response** - `404 Not Found`

```json
{
    "message": "Error al obtener los datos o producto inexistente"
}
```

---

#### Create Product

Creates a new product.

```http
POST /api/inventory/add
```

**Headers**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**

|Parameter|Type|Required|Description|
|---|---|---|---|
|`name`|string|Yes|Product name (max: 255 characters)|
|`minimun`|integer|No|Minimum stock quantity (min: 0)|
|`sku`|string|Yes|Unique Sku (max: 255 characters)|
|`stock`|integer|No|Actual stock (minimun <= stock <= maximun) (min: minimun)|
|`maximun`|integer|No|Maximun stock (min: minimun + 1)|
|`status`|boolean|No|Product status (default: true)|

**Example Request**

```json
{
    "name": "laptop",
    "minimun": 12,
    "stock": 20,
    "maximun": 80,
    "status": false
}

```

**Example Response** - `201 Created`

```json
{
    "id": 8,
    "message": "Se ha creado el producto exitosamente",
    "name": "laptop",
    "sku": "unique value"
}
```

---

#### Update Product

Updates an existing product.

```http
PUT /api/inventory/update/{id}
```

**Headers**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters**

|Parameter|Type|Description|
|---|---|---|
|`id`|integer|The product ID|


**Request Body**

All fields are optional. Only include fields you want to update.

|Parameter|Type|Description|
|---|---|---|
|`name`|string|Product name (max: 255 characters)|
|`minimun`|integer|No|Minimum stock quantity (min: 0)|
|`stock`|integer|No|Actual stock (minimun <= stock <= maximun) (min: minimun)|
|`maximun`|integer|No|Maximun stock (min: minimun + 1)|
|`status`|boolean|No|Product status (default: true)|

**Example Request**

```json
{
    "name": "cable",
    "minimun": 12,
    "maximun": 80,
    "stock": 30,
    "status": true
}
```

**Example Response** - `200 OK`

```json
{
    "id": 2,
    "maximun": 80,
    "message": "Se ha actualizado el producto exitosamente",
    "minimun": 12,
    "name": "cable",
    "status": true,
    "stock": 30,
    "updated_at": "2025-11-27T06:44:45.046226Z"
}
```

**Error Response** - `404 Not Found`

```json
{
    "message": "Error al obtener los datos o producto inexistente"
}
```

---

update actual stock of a product

```http
PUT /api/inventory/update/{id}/{mode}
```

**Headers**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters**

|Parameter|Type|Description|
|---|---|---|
|`id`|integer|The product ID|
|`mode`|string|increase or decrease stock|

**Request Body**

All fields are optional. Only include fields you want to update.

|Parameter|Type|Description|
|---|---|---|
|`update`|integer|current stock change|

**Example Request**

```json
{
    "update": 5
}

```

**Example Response** - `200 OK`

```json
{
    "id": 2,
    "message": "Se ha actualizado el stock exitosamente",
    "name": "cable"
}
```

**Error Response** - `404 Not Found`

```json
{
    "message": "Error al obtener los datos o producto inexistente"
}
```

---

### HTTP Status Codes

|Code|Description|
|---|---|
|`200`|**OK** - Request succeeded|
|`201`|**Created** - Resource created successfully|
|`400`|**Bad Request** - Invalid request format|
|`401`|**Unauthorized** - Invalid or missing authentication token|
|`404`|**Not Found** - Resource not found|
|`500`|**Internal Server Error** - Server error|

## Technology Stack

|Component|Technology|Version|
|---|---|---|
|**Backend Framework**|Axum|0.7|
|**Language**|Rust|1.91|
|**Database**|PostgreSQL|16|
|**Containerization**|Docker & Docker Compose|Latest|

---

## Changelog

### [1.0.2] - 2025-11-28

#### Added

- Complete CRUD operations for products
- Input validation
- JWT authentication system
- Error handling
- Docker containerization
- PostgreSQL database integration
- CORS support
- RESTful API structure

## Links

- [Documentation](https://github.com/namoruso/distributed-system/products-service/wiki)
- [Report Bug](https://github.com/namoruso/distributed-system/products-service/issues)
- [Request Feature](https://github.com/namoruso/distributed-system/products-service/issues)

---
Built with ❤️ using Axum and sqlx
