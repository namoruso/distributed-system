# Notifications Service API

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)]
[![Gin](https://img.shields.io/badge/gin-1.11-yellow.svg)]
[![Go](https://img.shields.io/badge/Golang-1167b1?logo=go&logoColor=white)]

A RESTful microservice for notifications management built with Golang-Gin. Part of a distributed system architecture with JWT authentication.

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

The Notifications Service is a microservice designed to handle all notifications

**Base URL:** `http://localhost:5040/notifications`

**Current Version:** v0.2.0

---

## Features


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
cd notifications-service
```

2. **Start Docker containers**

```bash
docker-compose up -d --build
```

3. **Verify installation**

Visit `http://localhost:5040`

### Configuration

The service uses environment variables for configuration. Key settings in `.env`:

JWT_SECRET_KEY=Token
PORT=5040

SMTP_PORT=587
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
SMTP_HOST=smtp.gmail.com

## API Reference

### inventory Endpoints

#### List All Products

Retrieves a list of all products and stock.

```http
GET /api/notifications/all
```

**Headers**

```http
Authorization: Bearer {token}
```

**Example Response** - `200 OK`

```json
{
  "data": {
    "1": {
      "id":1,
      "state":"Created",
      "userEmail":"email",
      "createdAt":"2026-01-15T14:50:00Z",
      "updateAt":"2026-01-15T14:50:00Z"
    }
  },
  "message":"Here are all the current orders",
  "success":true
}

```

---

#### Get Single Notification

Retrieves details of a specific product by ID.

```http
GET /notifications/{id}
```

**Headers**

```http
Authorization: Bearer {token}
```

**Path Parameters**

|Parameter|Type|Description|
|---|---|---|
|`id`|integer|The notification ID|


**Example Response** - `200 OK`

```json
{
  "data": {
            "id": 1,
            "state":"Created",
            "userEmail":"email",
            "createdAt":"2026-01-15T14:50:00Z",
            "updateAt":"2026-01-15T14:50:00Z"
    },
    "message":"Your order has been created",
    "success":true
}
```

**Error Response** - `404 Not Found`

```json
{
    "message": "Notification not found"
}
```

---

#### Create notification

```http
POST /notifications
```

**Headers**

```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**

|Parameter|Type|Required|Description|
|---|---|---|---|
|`id`|integer|Yes|ID|
|`userEmail`|string|Yes|Email from user|
|`createdAt`|time|No|creation date|
|`updateAt`|time|No|creation date|
|`state`|string|Yes|State from order|

**Example Request**

```json
{
  "id": 1,
  "state": "Created",
  "createdAt": "2026-01-15T14:50:00Z",
  "userEmail": "email",
  "updateAt": "2026-01-15T14:50:00Z"
}

```

**Example Response** - `201 Created`

```json
{
    "data": {
        "id": 1,
        "state": "Created",
        "userEmail": "email",
        "createdAt": "2026-01-15T14:50:00Z",
        "updateAt": "2026-01-15T14:50:00Z"
    },
    "message": "Notification created",
    "success": true
}
```

---

