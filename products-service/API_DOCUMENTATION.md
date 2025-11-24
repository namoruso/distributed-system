# Products Service API

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/products-service) ![License](https://img.shields.io/badge/license-MIT-green.svg) [![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com) [![PHP](https://img.shields.io/badge/PHP-8.2-purple.svg)](https://php.net)

A RESTful microservice for product management built with Laravel and PostgreSQL. Part of a distributed system architecture with JWT authentication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Product Endpoints](#product-endpoints)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Products Service is a microservice designed to handle all product-related operations in a distributed system. It provides a complete CRUD API with JWT authentication, built following REST principles and best practices.

**Base URL:** `http://localhost:8001/api`

**Current Version:** v1.0.0

---

## Features

- ✅ **Complete CRUD operations** for products
- 🔐 **JWT Authentication** with token refresh
- 🐘 **PostgreSQL database** with optimized queries
- 🐳 **Docker containerized** for easy deployment
- 📝 **Input validation** and error handling
- 🌐 **CORS enabled** for frontend integration
- 🔄 **RESTful API design** following industry standards
- 📊 **Structured JSON responses** with consistent format
- 🚀 **High performance** with Laravel optimization

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
git clone https://github.com/yourusername/products-service.git
cd products-service
```

2. **Start Docker containers**

```bash
docker-compose up -d --build
```

3. **Install dependencies**

```bash
docker-compose exec php composer install
```

4. **Generate application key**

```bash
docker-compose exec php php artisan key:generate
```

5. **Generate JWT secret**

```bash
docker-compose exec php php artisan jwt:secret
```

6. **Run database migrations**

```bash
docker-compose exec php php artisan migrate
```

7. **Verify installation**

Visit `http://localhost:8001` - you should see the Laravel welcome page.

### Configuration

The service uses environment variables for configuration. Key settings in `.env`:

```env
# Application
APP_NAME="Products Service"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8001

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=products_db
DB_USERNAME=products_user
DB_PASSWORD=products_pass

# JWT
JWT_SECRET=your-secret-key
JWT_TTL=60
```

---

## Authentication

This API uses **JWT (JSON Web Tokens)** for authentication. Tokens must be included in the `Authorization` header for protected endpoints.

### Authentication Flow

```mermaid
sequenceDiagram
    Client->>API: POST /auth/register or /auth/login
    API->>Database: Validate credentials
    Database-->>API: User data
    API-->>Client: JWT Token
    Client->>API: Request with Authorization header
    API->>API: Validate token
    API-->>Client: Protected resource
```

### Getting a Token

1. **Register** a new user or **login** with existing credentials
2. Store the returned `token`
3. Include it in subsequent requests:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Token Expiration

- Tokens expire after **60 minutes** by default
- Use the `/auth/refresh` endpoint to get a new token
- The `expires_in` field in the response indicates seconds until expiration

---

## API Reference

### Authentication Endpoints

#### Register User

Creates a new user account and returns a JWT token.

```http
POST /api/auth/register
```

**Request Body**

| Parameter               | Type   | Required | Description                            |
| ----------------------- | ------ | -------- | -------------------------------------- |
| `name`                  | string | Yes      | User's full name (max: 255 characters) |
| `email`                 | string | Yes      | Valid email address (must be unique)   |
| `password`              | string | Yes      | Password (min: 6 characters)           |
| `password_confirmation` | string | Yes      | Must match password                    |

**Example Request**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "secure123",
  "password_confirmation": "secure123"
}
```

**Example Response** - `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "created_at": "2025-11-24T03:19:03.000000Z",
    "updated_at": "2025-11-24T03:19:03.000000Z"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

#### Login

Authenticates a user and returns a JWT token.

```http
POST /api/auth/login
```

**Request Body**

| Parameter  | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| `email`    | string | Yes      | User's email address |
| `password` | string | Yes      | User's password      |

**Example Request**

```json
{
  "email": "john.doe@example.com",
  "password": "secure123"
}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

#### Get Current User

Returns information about the authenticated user.

```http
GET /api/auth/me
```

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "created_at": "2025-11-24T03:19:03.000000Z",
    "updated_at": "2025-11-24T03:19:03.000000Z"
  }
}
```

---

#### Refresh Token

Generates a new JWT token using the current valid token.

```http
POST /api/auth/refresh
```

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

#### Logout

Invalidates the current JWT token.

```http
POST /api/auth/logout
```

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### Product Endpoints

All product endpoints require authentication via JWT token.

#### List All Products

Retrieves a list of all products.

```http
GET /api/products
```

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Dell XPS 15",
      "description": "High-performance laptop with Intel i7 processor",
      "price": "1299.99",
      "stock": 25,
      "sku": "LAPTOP-DELL-001",
      "active": true,
      "created_at": "2025-11-24T03:19:03.000000Z",
      "updated_at": "2025-11-24T03:19:03.000000Z"
    },
    {
      "id": 2,
      "name": "Mouse Logitech MX Master 3",
      "description": "Wireless mouse with ergonomic design",
      "price": "99.99",
      "stock": 50,
      "sku": "MOUSE-LOG-001",
      "active": true,
      "created_at": "2025-11-24T03:20:15.000000Z",
      "updated_at": "2025-11-24T03:20:15.000000Z"
    }
  ]
}
```

---

#### Get Single Product

Retrieves details of a specific product by ID.

```http
GET /api/products/{id}
```

**Path Parameters**

| Parameter | Type    | Description    |
| --------- | ------- | -------------- |
| `id`      | integer | The product ID |

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop with Intel i7 processor",
    "price": "1299.99",
    "stock": 25,
    "sku": "LAPTOP-DELL-001",
    "active": true,
    "created_at": "2025-11-24T03:19:03.000000Z",
    "updated_at": "2025-11-24T03:19:03.000000Z"
  }
}
```

**Error Response** - `404 Not Found`

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

#### Create Product

Creates a new product.

```http
POST /api/products
```

**Headers**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**

| Parameter     | Type    | Required | Description                                   |
| ------------- | ------- | -------- | --------------------------------------------- |
| `name`        | string  | Yes      | Product name (max: 255 characters)            |
| `description` | string  | No       | Product description                           |
| `price`       | number  | Yes      | Product price (min: 0, decimal with 2 places) |
| `stock`       | integer | Yes      | Available quantity (min: 0)                   |
| `sku`         | string  | Yes      | Stock Keeping Unit (must be unique)           |
| `active`      | boolean | No       | Product status (default: true)                |

**Example Request**

```json
{
  "name": "Laptop Dell XPS 15",
  "description": "High-performance laptop with Intel i7 processor",
  "price": 1299.99,
  "stock": 25,
  "sku": "LAPTOP-DELL-001",
  "active": true
}
```

**Example Response** - `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop with Intel i7 processor",
    "price": "1299.99",
    "stock": 25,
    "sku": "LAPTOP-DELL-001",
    "active": true,
    "created_at": "2025-11-24T03:19:03.000000Z",
    "updated_at": "2025-11-24T03:19:03.000000Z"
  }
}
```

**Validation Error Response** - `422 Unprocessable Entity`

```json
{
  "success": false,
  "errors": {
    "sku": ["The sku has already been taken."],
    "price": ["The price must be at least 0."]
  }
}
```

---

#### Update Product

Updates an existing product.

```http
PUT /api/products/{id}
```

**Path Parameters**

| Parameter | Type    | Description    |
| --------- | ------- | -------------- |
| `id`      | integer | The product ID |

**Headers**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**

All fields are optional. Only include fields you want to update.

| Parameter     | Type    | Description                         |
| ------------- | ------- | ----------------------------------- |
| `name`        | string  | Product name (max: 255 characters)  |
| `description` | string  | Product description                 |
| `price`       | number  | Product price (min: 0)              |
| `stock`       | integer | Available quantity (min: 0)         |
| `sku`         | string  | Stock Keeping Unit (must be unique) |
| `active`      | boolean | Product status                      |

**Example Request**

```json
{
  "name": "Laptop Dell XPS 15 - Updated",
  "price": 1199.99,
  "stock": 30
}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Laptop Dell XPS 15 - Updated",
    "description": "High-performance laptop with Intel i7 processor",
    "price": "1199.99",
    "stock": 30,
    "sku": "LAPTOP-DELL-001",
    "active": true,
    "created_at": "2025-11-24T03:19:03.000000Z",
    "updated_at": "2025-11-24T03:25:10.000000Z"
  }
}
```

---

#### Delete Product

Deletes a product permanently.

```http
DELETE /api/products/{id}
```

**Path Parameters**

| Parameter | Type    | Description    |
| --------- | ------- | -------------- |
| `id`      | integer | The product ID |

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Response** - `404 Not Found`

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

---

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure.

### HTTP Status Codes

| Code  | Description                                                |
| ----- | ---------------------------------------------------------- |
| `200` | **OK** - Request succeeded                                 |
| `201` | **Created** - Resource created successfully                |
| `400` | **Bad Request** - Invalid request format                   |
| `401` | **Unauthorized** - Invalid or missing authentication token |
| `404` | **Not Found** - Resource not found                         |
| `422` | **Unprocessable Entity** - Validation errors               |
| `500` | **Internal Server Error** - Server error                   |

### Authentication Errors

**Invalid Token**

```json
{
  "success": false,
  "message": "Token is invalid or expired"
}
```

**Missing Token**

```json
{
  "success": false,
  "message": "Token not provided"
}
```

**User Not Found**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. This will be added in future versions.

**Planned limits:**

- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Examples

### Complete Authentication Flow

```javascript
// 1. Login
const loginResponse = await fetch("http://localhost:8001/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    email: "john.doe@example.com",
    password: "secure123",
  }),
});

const { token } = await loginResponse.json();

// 2. Use token to access protected endpoint
const productsResponse = await fetch("http://localhost:8001/api/products", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
});

const products = await productsResponse.json();
console.log(products);
```

### Create and Update Product

```javascript
// Create product
const createResponse = await fetch("http://localhost:8001/api/products", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    name: "Wireless Keyboard",
    description: "Bluetooth mechanical keyboard",
    price: 79.99,
    stock: 100,
    sku: "KEYB-WL-001",
    active: true,
  }),
});

const { data: newProduct } = await createResponse.json();

// Update product
const updateResponse = await fetch(
  `http://localhost:8001/api/products/${newProduct.id}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      price: 69.99,
      stock: 150,
    }),
  }
);

const { data: updatedProduct } = await updateResponse.json();
```

### Using Axios (Recommended)

```javascript
import axios from "axios";

// Configure axios instance
const api = axios.create({
  baseURL: "http://localhost:8001/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Usage
try {
  const { data } = await api.get("/products");
  console.log(data);
} catch (error) {
  console.error("Error:", error.response?.data);
}
```

### Python Integration Example

```python
import requests

# Base configuration
BASE_URL = "http://localhost:8001/api"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Login
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "john.doe@example.com",
        "password": "secure123"
    },
    headers=headers
)

token = login_response.json()["token"]

# Add token to headers
headers["Authorization"] = f"Bearer {token}"

# Get products
products_response = requests.get(
    f"{BASE_URL}/products",
    headers=headers
)

products = products_response.json()
print(products)
```

---

## Testing

### Run Tests

```bash
docker-compose exec php php artisan test
```

### Manual Testing with cURL

**Register User**

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456",
    "password_confirmation": "123456"
  }'
```

**Login**

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Get Products** (replace TOKEN with your JWT)

```bash
curl -X GET http://localhost:8001/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json"
```

**Create Product**

```bash
curl -X POST http://localhost:8001/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "stock": 10,
    "sku": "TEST-001",
    "active": true
  }'
```

---

## Deployment

### Docker Compose (Production)

For production deployment, update your `docker-compose.yml`:

```yaml
version: "3.8"

services:
  php:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    restart: always
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    # ... rest of configuration

  postgres:
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # ... rest of configuration
```

### Environment Variables

Set these for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_PASSWORD=strong-random-password
JWT_SECRET=very-strong-random-secret
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set `APP_DEBUG=false`
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review file permissions
- [ ] Use environment variables for secrets

---

## Microservices Integration

### Shared JWT Authentication

To integrate with other microservices (Python, Node.js), ensure all services:

1. **Use the same JWT_SECRET**
2. **Use the same algorithm** (HS256)
3. **Have the same token expiration time**

**Get your JWT_SECRET:**

```bash
docker-compose exec php cat .env | grep JWT_SECRET
```

**Use this secret in your Python microservice:**

```python
import jwt
from datetime import datetime, timedelta

JWT_SECRET = "your-jwt-secret-here"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 1

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
```

---

## Useful Commands

### Docker Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f php
docker-compose logs -f postgres

# Restart a service
docker-compose restart php

# Execute commands in container
docker-compose exec php php artisan [command]
```

### Laravel Artisan

```bash
# Clear all caches
docker-compose exec php php artisan optimize:clear

# Run migrations
docker-compose exec php php artisan migrate

# Rollback last migration
docker-compose exec php php artisan migrate:rollback

# Create new migration
docker-compose exec php php artisan make:migration create_table_name

# List all routes
docker-compose exec php php artisan route:list
```

### Database

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U products_user -d products_db

# List tables
docker-compose exec postgres psql -U products_user -d products_db -c "\dt"

# View table structure
docker-compose exec postgres psql -U products_user -d products_db -c "\d products"

# Query data
docker-compose exec postgres psql -U products_user -d products_db -c "SELECT * FROM products;"

# Backup database
docker-compose exec postgres pg_dump -U products_user products_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U products_user products_db < backup.sql
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project follows the [PSR-12](https://www.php-fig.org/psr/psr-12/) coding standard.

```bash
# Run code style fixer
docker-compose exec php ./vendor/bin/pint
```

---

## Troubleshooting

### Common Issues

**Problem:** Can't connect to database

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

**Problem:** Permission denied errors

```bash
# Fix storage permissions
docker-compose exec php chmod -R 775 storage bootstrap/cache
docker-compose exec php chown -R www-data:www-data storage bootstrap/cache
```

**Problem:** JWT token errors

```bash
# Regenerate JWT secret
docker-compose exec php php artisan jwt:secret --force

# Clear config cache
docker-compose exec php php artisan config:clear
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│         (Vue.js, React, Mobile Apps, etc.)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS + JWT
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Nginx (Port 8001)                     │
│              (Reverse Proxy / Web Server)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              PHP-FPM + Laravel 11                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Routes & Middleware                     │  │
│  │  • JWT Authentication                            │  │
│  │  • CORS                                          │  │
│  │  • Input Validation                              │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │           Controllers                             │  │
│  │  • AuthController                                │  │
│  │  • ProductController                             │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │            Models & ORM                           │  │
│  │  • User Model                                    │  │
│  │  • Product Model                                 │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│            PostgreSQL 15 (Port 5433)                 │
│                                                       │
│  Tables:                                             │
│  • users                                             │
│  • products                                          │
│  • migrations                                        │
└──────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component             | Technology              | Version |
| --------------------- | ----------------------- | ------- |
| **Backend Framework** | Laravel                 | 11.x    |
| **Language**          | PHP                     | 8.2     |
| **Web Server**        | Nginx                   | Alpine  |
| **Database**          | PostgreSQL              | 15      |
| **Authentication**    | JWT (tymon/jwt-auth)    | 2.x     |
| **Containerization**  | Docker & Docker Compose | Latest  |
| **Process Manager**   | PHP-FPM                 | 8.2     |

---

## Changelog

### [1.0.0] - 2025-11-24

#### Added

- Complete CRUD operations for products
- JWT authentication system
- User registration and login
- Token refresh mechanism
- Input validation
- Error handling
- Docker containerization
- PostgreSQL database integration
- CORS support
- RESTful API structure

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For support, email support@yourcompany.com or open an issue in the GitHub repository.

## Links

- [Documentation](https://github.com/yourusername/products-service/wiki)
- [Report Bug](https://github.com/yourusername/products-service/issues)
- [Request Feature](https://github.com/yourusername/products-service/issues)

---

**Built with ❤️ using Laravel and Docker**
