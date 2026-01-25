# Distributed E-Commerce System

[![Microservices](https://img.shields.io/badge/architecture-microservices-blue.svg)](https://microservices.io/) [![Docker](https://img.shields.io/badge/docker-ready-green.svg)](https://www.docker.com/) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive distributed e-commerce system built with microservices architecture, featuring multiple independent services that communicate through REST APIs and handle authentication, product management, orders, payments, notifications, and inventory control.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
  - [Architecture Diagram](#architecture-diagram)
  - [Services Overview](#services-overview)
  - [Communication Flow](#communication-flow)
- [Technologies Stack](#technologies-stack)
- [Prerequisites](#prerequisites)
- [Installation and Configuration](#installation-and-configuration)
  - [Clone Repository](#clone-repository)
  - [Environment Variables](#environment-variables)
  - [Build Docker Images](#build-docker-images)
- [Deployment with Docker](#deployment-with-docker)
  - [Using Docker Compose](#using-docker-compose)
  - [Individual Service Deployment](#individual-service-deployment)
  - [Deployment Verification](#deployment-verification)
- [Development](#development)
  - [Local Development Environment](#local-development-environment)
  - [Hot Reload for Development](#hot-reload-for-development)
  - [Debugging Services](#debugging-services)
- [Complete Workflow](#complete-workflow)
  - [End-to-End Purchase Flow](#end-to-end-purchase-flow)
  - [API Endpoints Summary](#api-endpoints-summary)
- [Monitoring and Logs](#monitoring-and-logs)
  - [Accessing Service Logs](#accessing-service-logs)
  - [Health Checks](#health-checks)
- [Scalability](#scalability)
- [Troubleshooting](#troubleshooting)
  - [Common Problems](#common-problems)
  - [Failure Diagnosis](#failure-diagnosis)
  - [Restart and Recovery](#restart-and-recovery)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)

---

## Overview

This distributed system implements a full-featured e-commerce platform using microservices architecture. Each service is independently deployable, scalable, and maintainable, following industry best practices and modern development patterns.

**Key Features:**
- 🔐 Centralized JWT authentication
- 📦 Product catalog management
- 🛒 Order processing and tracking
- 💳 Payment processing integration
- 📧 Real-time notifications
- 📊 Inventory management
- 🎨 Modern responsive frontend
- 🐳 Fully containerized with Docker

**System Ports:**
- Frontend: `5173`
- Auth Service: `8000`
- Products Service: `8001`
- Inventory API: `8002`
- Orders Service: `8003`
- Payments Service: `8004`
- Notifications Service: `8005`

---

## System Architecture

### Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Frontend[Frontend<br/>Vue.js<br/>Port: 5173]
    end
    
    subgraph "API Gateway / Load Balancer"
        Gateway[API Gateway<br/>Future Implementation]
    end
    
    subgraph "Microservices Layer"
        Auth[Auth Service<br/>Python/FastAPI<br/>Port: 8000]
        Products[Products Service<br/>PHP/Laravel<br/>Port: 8001]
        Inventory[Inventory API<br/>Rust<br/>Port: 8002]
        Orders[Orders Service<br/>Java/Spring Boot<br/>Port: 8003]
        Payments[Payments Service<br/>Node.js<br/>Port: 8004]
        Notifications[Notifications Service<br/>Node.js<br/>Port: 8005]
    end
    
    subgraph "Data Layer"
        AuthDB[(Auth DB<br/>PostgreSQL)]
        ProductsDB[(Products DB<br/>PostgreSQL)]
        InventoryDB[(Inventory DB<br/>PostgreSQL)]
        OrdersDB[(Orders DB<br/>PostgreSQL)]
        PaymentsDB[(Payments DB<br/>PostgreSQL)]
        NotifDB[(Notifications DB<br/>PostgreSQL)]
    end
    
    Frontend -->|HTTP/REST| Auth
    Frontend -->|HTTP/REST| Products
    Frontend -->|HTTP/REST| Inventory
    Frontend -->|HTTP/REST| Orders
    Frontend -->|HTTP/REST| Payments
    Frontend -->|HTTP/REST| Notifications
    
    Orders -->|Validate Stock| Products
    Orders -->|Update Stock| Inventory
    Payments -->|Payment Callback| Orders
    Orders -->|Order Created| Notifications
    Payments -->|Payment Status| Notifications
    
    Auth --> AuthDB
    Products --> ProductsDB
    Inventory --> InventoryDB
    Orders --> OrdersDB
    Payments --> PaymentsDB
    Notifications --> NotifDB
    
    style Frontend fill:#42b883,stroke:#333,color:#fff
    style Auth fill:#4a90e2,stroke:#333,color:#fff
    style Products fill:#e74c3c,stroke:#333,color:#fff
    style Inventory fill:#f39c12,stroke:#333,color:#fff
    style Orders fill:#27ae60,stroke:#333,color:#fff
    style Payments fill:#8e44ad,stroke:#333,color:#fff
    style Notifications fill:#16a085,stroke:#333,color:#fff
```

### Services Overview

#### 🔐 Auth Service (Port 8000)
**Technology:** Python 3.11 + FastAPI  
**Database:** PostgreSQL  
**Purpose:** Centralized authentication and authorization service

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- User session management
- Role-based access control (RBAC)
- Token refresh and revocation

**Key Features:**
- BCrypt password hashing
- JWT with configurable expiration
- CORS support for frontend integration

---

#### 📦 Products Service (Port 8001)
**Technology:** PHP 8.2 + Laravel 11  
**Database:** PostgreSQL  
**Purpose:** Product catalog management

**Responsibilities:**
- CRUD operations for products
- SKU management
- Product search and filtering
- Stock availability queries
- Product metadata management

**Key Features:**
- Input validation with Laravel validators
- JWT authentication integration
- RESTful API design
- Product image handling

---

#### 📊 Inventory API (Port 8002)
**Technology:** Rust + Actix-web  
**Database:** PostgreSQL  
**Purpose:** Real-time inventory control

**Responsibilities:**
- Stock level tracking
- Inventory updates and adjustments
- Stock reservation for orders
- Low stock alerts
- Inventory history and auditing

**Key Features:**
- High-performance stock operations
- Concurrent transaction handling
- Real-time inventory synchronization

---

#### 🛒 Orders Service (Port 8003)
**Technology:** Java 17 + Spring Boot 3.2  
**Database:** PostgreSQL  
**Purpose:** Order lifecycle management

**Responsibilities:**
- Order creation and validation
- Order status tracking (CREATED, PAID, SHIPPED, COMPLETED, CANCELLED)
- Order history and queries
- Product validation via Products Service
- Payment status updates via callback
- Inventory updates on order placement

**Key Features:**
- Pagination and sorting
- Order state machine
- Product snapshot for historical accuracy
- Admin-only status updates

---

#### 💳 Payments Service (Port 8004)
**Technology:** Node.js + Express  
**Database:** PostgreSQL  
**Purpose:** Payment processing and transaction management

**Responsibilities:**
- Payment intent creation
- Payment method handling
- Transaction recording
- Payment status callbacks to Orders Service
- Refund processing

**Key Features:**
- Integration with Orders Service via `payments-ordenSvc-actual.js`
- Asynchronous payment status notifications
- Payment method abstraction

---

#### 📧 Notifications Service (Port 8005)
**Technology:** Node.js + Express  
**Database:** PostgreSQL  
**Purpose:** Multi-channel notification delivery

**Responsibilities:**
- Email notifications
- In-app notifications
- Order status notifications
- Payment confirmations
- User account notifications

**Key Features:**
- Template-based notifications
- Notification history
- Multiple delivery channels

---

#### 🎨 Frontend (Port 5173)
**Technology:** Vue.js 3 + Vite  
**Purpose:** User interface for the e-commerce platform

**Responsibilities:**
- Product browsing and search
- Shopping cart management
- User authentication UI
- Order placement and tracking
- Account management
- Admin dashboard

**Key Features:**
- Responsive design
- Real-time updates
- JWT token management
- Axios for API communication
- Vue Router for navigation

---

### Communication Flow

The services communicate using **synchronous REST APIs** with JSON payloads. All inter-service communication requires JWT authentication, except for service-to-service calls using service tokens.

**Authentication Pattern:**
1. User authenticates via Auth Service
2. JWT token is returned and stored in frontend
3. All subsequent API calls include `Authorization: Bearer <token>` header
4. Each service validates the JWT using the shared secret

**Service-to-Service Pattern:**
- Products Service ← Orders Service: Product validation and pricing
- Inventory API ← Orders Service: Stock reservation and updates
- Orders Service ← Payments Service: Payment status callbacks
- Notifications Service ← Orders/Payments: Event notifications

---

## Technologies Stack

| Service | Technology | Framework | Database |
|---------|-----------|-----------|----------|
| **Frontend** | JavaScript | Vue.js 3 + Vite | - |
| **Auth Service** | Python 3.11 | FastAPI | PostgreSQL |
| **Products Service** | PHP 8.2 | Laravel 11 | PostgreSQL |
| **Inventory API** | Rust | Actix-web | PostgreSQL |
| **Orders Service** | Java 17 | Spring Boot 3.2 | PostgreSQL |
| **Payments Service** | Node.js | Express | PostgreSQL |
| **Notifications Service** | Node.js | Express | PostgreSQL |

**Common Tools:**
- Docker & Docker Compose
- PostgreSQL 15
- Git
- JWT for authentication

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Docker Desktop** (v20.10 or higher)
  - [Download for Windows](https://www.docker.com/products/docker-desktop)
  - [Download for macOS](https://www.docker.com/products/docker-desktop)
  - [Download for Linux](https://docs.docker.com/engine/install/)

- **Docker Compose** (v2.0 or higher)
  - Included with Docker Desktop
  - Linux users: [Install Compose](https://docs.docker.com/compose/install/)

- **Git** (v2.30 or higher)
  - [Download Git](https://git-scm.com/downloads)

### System Requirements

- **RAM:** Minimum 8GB (16GB recommended)
- **Disk Space:** At least 10GB free
- **CPU:** 4 cores recommended
- **OS:** Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)

### Port Availability

Ensure the following ports are available on your system:
- `5173` - Frontend
- `8000` - Auth Service
- `8001` - Products Service
- `8002` - Inventory API
- `8003` - Orders Service
- `8004` - Payments Service
- `8005` - Notifications Service
- `5432` - PostgreSQL (if running externally)

---

## Installation and Configuration

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/namoruso/distributed-system.git

# Navigate to project directory
cd distributed-system
```

### Environment Variables

Each service requires its own environment configuration. Create `.env` files for each service based on the `.env.example` templates provided.

#### 1. Auth Service (.env)

```bash
cd auth-service
cp .env.example .env
```

**auth-service/.env:**
```env
# Database
DATABASE_URL=postgresql://auth_user:auth_pass@postgres:5432/auth_db

# JWT Configuration
SECRET_KEY=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Server
PORT=8000
```

#### 2. Products Service (.env)

```bash
cd ../products-service
cp .env.example .env
```

**products-service/.env:**
```env
APP_NAME="Products Service"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8001

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=products_db
DB_USERNAME=products_user
DB_PASSWORD=products_pass

JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
JWT_TTL=60

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### 3. Inventory API (.env)

```bash
cd ../inventario_api
cp .env.example .env
```

**inventario_api/.env:**
```env
DATABASE_URL=postgresql://inventory_user:inventory_pass@postgres:5432/inventory_db
JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
SERVER_PORT=8002
```

#### 4. Orders Service (.env)

```bash
cd ../orders-service
```

**Set environment variables in docker-compose.yml or use:**
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=orders_db
DB_USER=orders_user
DB_PASSWORD=orders_pass

JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm

PRODUCTS_SERVICE_URL=http://products-service:8001
INVENTORY_SERVICE_URL=http://inventory-api:8002

CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### 5. Payments Service (.env)

```bash
cd ../payments-service
cp .env.example .env
```

**payments-service/.env:**
```env
PORT=8004
DATABASE_URL=postgresql://payments_user:payments_pass@postgres:5432/payments_db

JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm

ORDERS_SERVICE_URL=http://orders-service:8003
ORDERS_SERVICE_TOKEN=optional-service-token

CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### 6. Notifications Service (.env)

```bash
cd ../notifications-service
cp .env.example .env
```

**notifications-service/.env:**
```env
PORT=8005
DATABASE_URL=postgresql://notif_user:notif_pass@postgres:5432/notifications_db

JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

#### 7. Frontend (.env)

```bash
cd ../frontend
cp .env.example .env
```

**frontend/.env:**
```env
VITE_AUTH_SERVICE_URL=http://localhost:8000/api
VITE_PRODUCTS_SERVICE_URL=http://localhost:8001/api
VITE_INVENTORY_SERVICE_URL=http://localhost:8002/api
VITE_ORDERS_SERVICE_URL=http://localhost:8003/api
VITE_PAYMENTS_SERVICE_URL=http://localhost:8004/api
VITE_NOTIFICATIONS_SERVICE_URL=http://localhost:8005/api
```

> **⚠️ IMPORTANT:** The `JWT_SECRET` must be **identical** across all services for proper token validation. Use a secure, randomly generated string of at least 32 characters.

### Build Docker Images

After configuring environment variables, build the Docker images for all services:

```bash
# Return to root directory
cd ..

# Build all services
docker compose build --no-cache

# Or build specific service
docker compose build auth-service
```

---

## Deployment with Docker

### Using Docker Compose

The recommended way to deploy the entire system is using Docker Compose, which orchestrates all services and databases.

#### Complete docker-compose.yml

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: distributed-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_MULTIPLE_DATABASES: auth_db,products_db,inventory_db,orders_db,payments_db,notifications_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-databases.sh:/docker-entrypoint-initdb.d/init-databases.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - distributed-network

  # Auth Service
  auth-service:
    build:
      context: ./auth-service
      dockerfile: Dockerfile
    container_name: auth-service
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_db
      - SECRET_KEY=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
      - CORS_ORIGINS=http://localhost:5173
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - distributed-network
    restart: unless-stopped

  # Products Service
  products-service:
    build:
      context: ./products-service
      dockerfile: Dockerfile
    container_name: products-service
    ports:
      - "8001:8001"
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=products_db
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
      - APP_URL=http://localhost:8001
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - distributed-network
    restart: unless-stopped

  # Inventory API
  inventory-api:
    build:
      context: ./inventario_api
      dockerfile: Dockerfile
    container_name: inventory-api
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/inventory_db
      - JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
      - SERVER_PORT=8002
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - distributed-network
    restart: unless-stopped

  # Orders Service
  orders-service:
    build:
      context: ./orders-service
      dockerfile: Dockerfile
    container_name: orders-service
    ports:
      - "8003:8003"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=orders_db
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
      - PRODUCTS_SERVICE_URL=http://products-service:8001
      - INVENTORY_SERVICE_URL=http://inventory-api:8002
    depends_on:
      postgres:
        condition: service_healthy
      products-service:
        condition: service_started
      inventory-api:
        condition: service_started
    networks:
      - distributed-network
    restart: unless-stopped

  # Payments Service
  payments-service:
    build:
      context: ./payments-service
      dockerfile: Dockerfile
    container_name: payments-service
    ports:
      - "8004:8004"
    environment:
      - PORT=8004
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/payments_db
      - JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
      - ORDERS_SERVICE_URL=http://orders-service:8003
    depends_on:
      postgres:
        condition: service_healthy
      orders-service:
        condition: service_started
    networks:
      - distributed-network
    restart: unless-stopped

  # Notifications Service
  notifications-service:
    build:
      context: ./notifications-service
      dockerfile: Dockerfile
    container_name: notifications-service
    ports:
      - "8005:8005"
    environment:
      - PORT=8005
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/notifications_db
      - JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - distributed-network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: dockerfile
    container_name: frontend
    ports:
      - "5173:80"
    environment:
      - VITE_AUTH_SERVICE_URL=http://localhost:8000/api
      - VITE_PRODUCTS_SERVICE_URL=http://localhost:8001/api
      - VITE_INVENTORY_SERVICE_URL=http://localhost:8002/api
      - VITE_ORDERS_SERVICE_URL=http://localhost:8003/api
      - VITE_PAYMENTS_SERVICE_URL=http://localhost:8004/api
      - VITE_NOTIFICATIONS_SERVICE_URL=http://localhost:8005/api
    depends_on:
      - auth-service
      - products-service
      - orders-service
      - payments-service
      - notifications-service
    networks:
      - distributed-network
    restart: unless-stopped

networks:
  distributed-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

#### Database Initialization Script

Create `init-databases.sh` in the root directory to initialize multiple databases:

```bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE products_db;
    CREATE DATABASE inventory_db;
    CREATE DATABASE orders_db;
    CREATE DATABASE payments_db;
    CREATE DATABASE notifications_db;
EOSQL
```

Make it executable:
```bash
chmod +x init-databases.sh
```

#### Deploy All Services

```bash
# Start all services with build
docker compose up -d --build

# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f auth-service

# Check service status
docker compose ps
```

#### Stop Services

```bash
# Stop all services (preserves data)
docker compose stop

# Stop and remove containers (preserves data in volumes)
docker compose down

# Stop and remove everything including volumes (⚠️ deletes all data)
docker compose down -v
```

### Individual Service Deployment

Each service can be deployed individually using its own `docker-compose.yml` file located in the service directory.

```bash
# Deploy Auth Service only
cd auth-service
docker compose up -d --build

# Deploy Products Service only
cd ../products-service
docker compose up -d --build

# Deploy Orders Service only
cd ../orders-service
docker compose up -d --build
```

### Deployment Verification

After deployment, verify that all services are running correctly:

#### 1. Check Container Status

```bash
# List all running containers
docker compose ps

# Expected output: All services should show "Up" status
```

#### 2. Health Check Endpoints

Test each service's health endpoint:

```bash
# Auth Service
curl http://localhost:8000/health

# Products Service
curl http://localhost:8001/api/health

# Inventory API
curl http://localhost:8002/health

# Orders Service
curl http://localhost:8003/api/health

# Payments Service
curl http://localhost:8004/health

# Notifications Service
curl http://localhost:8005/health

# Frontend
curl http://localhost:5173
```

#### 3. Database Connectivity

```bash
# Connect to PostgreSQL
docker exec -it distributed-postgres psql -U postgres

# List databases
\l

# Expected databases: auth_db, products_db, inventory_db, orders_db, payments_db, notifications_db
```

#### 4. Service Logs

```bash
# Check for errors in logs
docker compose logs --tail=50

# Check specific service
docker compose logs auth-service --tail=20
```

---

## Development

### Local Development Environment

For development, you may want to run services locally outside of Docker for faster iteration and debugging.

#### Auth Service (Python/FastAPI)

```bash
cd auth-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (if applicable)
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

#### Products Service (PHP/Laravel)

```bash
cd products-service

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate

# Start development server
php artisan serve --host=0.0.0.0 --port=8001
```

#### Inventory API (Rust)

```bash
cd inventario_api

# Build project
cargo build

# Run migrations
sqlx migrate run

# Run development server
cargo run

# Or with auto-reload (install cargo-watch)
cargo install cargo-watch
cargo watch -x run
```

#### Orders Service (Java/Spring Boot)

```bash
cd orders-service

# Build project
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Or with custom profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Payments Service (Node.js)

```bash
cd payments-service

# Install dependencies
npm install

# Run development server with nodemon
npm run dev

# Or production mode
npm start
```

#### Notifications Service (Node.js)

```bash
cd notifications-service

# Install dependencies
npm install

# Run development server
npm run dev
```

#### Frontend (Vue.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Hot Reload for Development

Most services support hot reload during development:

- **Auth Service (FastAPI):** `--reload` flag enables auto-restart
- **Products Service (Laravel):** Native hot reload with `php artisan serve`
- **Inventory API (Rust):** Use `cargo-watch` for auto-reload
- **Orders Service (Spring Boot):** Spring DevTools enables hot reload
- **Payments/Notifications (Node.js):** `nodemon` watches file changes
- **Frontend (Vue.js):** Vite HMR (Hot Module Replacement)

### Debugging Services

#### Enable Debug Mode

**Auth Service:**
```env
# .env
DEBUG=True
LOG_LEVEL=DEBUG
```

**Products Service:**
```env
# .env
APP_DEBUG=true
LOG_LEVEL=debug
```

**Orders Service:**
```bash
# application.properties
logging.level.com.distributedsystem.orders=DEBUG
```

**Node.js Services:**
```bash
# Run with debug flag
node --inspect=0.0.0.0:9229 index.js
```

#### Attach Debugger

- **VSCode:** Use provided `.vscode/launch.json` configurations
- **IntelliJ IDEA:** Remote debug for Java service on port 5005
- **Chrome DevTools:** For Node.js services on port 9229

---

## Complete Workflow

### End-to-End Purchase Flow

This diagram shows the complete flow from user browsing products to receiving order confirmation:

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Auth
    participant Products
    participant Inventory
    participant Orders
    participant Payments
    participant Notifications

    User->>Frontend: Browse products
    Frontend->>Products: GET /api/products
    Products-->>Frontend: Product list

    User->>Frontend: Click "Register/Login"
    Frontend->>Auth: POST /api/auth/login
    Auth-->>Frontend: JWT Token
    Frontend->>Frontend: Store token

    User->>Frontend: Add products to cart
    Frontend->>Products: GET /api/products/{id}
    Products-->>Frontend: Product details

    User->>Frontend: Proceed to checkout
    Frontend->>Orders: POST /api/orders<br/>(with JWT)
    
    Orders->>Products: GET /api/products/{id}<br/>(validate products)
    Products-->>Orders: Product data + price
    
    Orders->>Inventory: POST /api/inventory/reserve<br/>(check stock)
    Inventory-->>Orders: Stock confirmed
    
    Orders->>Orders: Create order<br/>(status: CREATED)
    Orders-->>Frontend: Order created
    
    Orders->>Notifications: POST /api/notifications<br/>(order created event)
    Notifications-->>User: Email: Order confirmation

    User->>Frontend: Enter payment details
    Frontend->>Payments: POST /api/payments/process
    
    Payments->>Payments: Process payment
    Payments->>Orders: POST /api/orders/{id}/payment-callback<br/>(payment status)
    
    Orders->>Orders: Update status to PAID
    Orders->>Inventory: POST /api/inventory/update<br/>(reduce stock)
    
    Payments-->>Frontend: Payment successful
    
    Orders->>Notifications: POST /api/notifications<br/>(payment confirmed)
    Notifications-->>User: Email: Payment confirmed

    Frontend-->>User: Order complete!
```

**Flow Steps:**

1. **User Authentication**
   - User registers or logs in via Auth Service
   - JWT token is generated and stored in frontend (localStorage/sessionStorage)

2. **Product Browsing**
   - Frontend fetches products from Products Service
   - Products are displayed with current pricing and availability

3. **Order Creation**
   - User adds items to cart and initiates checkout
   - Frontend sends order request to Orders Service
   - Orders Service validates each product with Products Service
   - Orders Service checks stock availability with Inventory API
   - Order is created with status `CREATED`

4. **Payment Processing**
   - User provides payment information
   - Frontend sends payment request to Payments Service
   - Payments Service processes the transaction
   - Payment callback is sent to Orders Service

5. **Order Fulfillment**
   - Orders Service updates status to `PAID`
   - Inventory API reduces stock levels
   - Notifications Service sends confirmation emails

6. **Admin Order Management** (Optional)
   - Admin updates order status to `SHIPPED` or `COMPLETED`
   - Notifications are sent for each status change

### API Endpoints Summary

#### Auth Service (Port 8000)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/logout` | Yes | User logout |
| POST | `/api/auth/refresh` | Yes | Refresh JWT token |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/health` | No | Health check |

#### Products Service (Port 8001)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/products` | Yes | List all products |
| GET | `/api/products/{id}` | Yes | Get product details |
| POST | `/api/products` | Yes | Create product |
| PUT | `/api/products/{id}` | Yes | Update product |
| DELETE | `/api/products/{id}` | Yes | Delete product |
| GET | `/api/health` | No | Health check |

#### Inventory API (Port 8002)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/inventory` | Yes | List inventory |
| GET | `/api/inventory/{productId}` | Yes | Get stock level |
| POST | `/api/inventory/reserve` | Yes | Reserve stock |
| PUT | `/api/inventory/{productId}` | Yes | Update stock |
| POST | `/api/inventory/adjust` | Yes | Adjust inventory |
| GET | `/health` | No | Health check |

#### Orders Service (Port 8003)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/orders` | Yes | List user orders |
| GET | `/api/orders/{id}` | Yes | Get order details |
| POST | `/api/orders` | Yes | Create new order |
| PUT | `/api/orders/{id}/status` | Yes (Admin) | Update order status |
| POST | `/api/orders/{id}/payment-callback` | Internal | Payment status callback |
| GET | `/api/health` | No | Health check |

#### Payments Service (Port 8004)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/payments/process` | Yes | Process payment |
| GET | `/api/payments/{id}` | Yes | Get payment details |
| GET | `/api/payments/order/{orderId}` | Yes | Get payments by order |
| POST | `/api/payments/refund` | Yes (Admin) | Process refund |
| GET | `/health` | No | Health check |

#### Notifications Service (Port 8005)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/notifications` | Yes | List user notifications |
| POST | `/api/notifications/send` | Internal | Send notification |
| PUT | `/api/notifications/{id}/read` | Yes | Mark as read |
| DELETE | `/api/notifications/{id}` | Yes | Delete notification |
| GET | `/health` | No | Health check |

---

## Monitoring and Logs

### Accessing Service Logs

#### View Logs for All Services

```bash
# Follow logs for all services
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100

# View logs since specific time
docker compose logs --since 2024-01-25T10:00:00
```

#### View Logs for Specific Service

```bash
# Auth Service
docker compose logs -f auth-service

# Products Service
docker compose logs -f products-service

# Orders Service
docker compose logs -f orders-service

# Payments Service
docker compose logs -f payments-service
```

#### Export Logs to File

```bash
# Export all logs
docker compose logs > system-logs.txt

# Export specific service logs
docker compose logs auth-service > auth-logs.txt
```

### Health Checks

Each service exposes a `/health` endpoint for monitoring:

#### Manual Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash

services=(
  "Auth Service:http://localhost:8000/health"
  "Products Service:http://localhost:8001/api/health"
  "Inventory API:http://localhost:8002/health"
  "Orders Service:http://localhost:8003/api/health"
  "Payments Service:http://localhost:8004/health"
  "Notifications Service:http://localhost:8005/health"
  "Frontend:http://localhost:5173"
)

echo "=== Distributed System Health Check ==="
echo ""

for service in "${services[@]}"; do
  IFS=':' read -r name url remainder <<< "$service"
  url="${url}:${remainder}"
  
  echo -n "Checking $name... "
  
  if curl -f -s -o /dev/null "$url"; then
    echo "✅ OK"
  else
    echo "❌ FAILED"
  fi
done

echo ""
echo "=== Check Complete ==="
```

Run health checks:
```bash
chmod +x health-check.sh
./health-check.sh
```

### Monitoring Dashboard (Future Enhancement)

**Recommended Tools:**
- **Prometheus:** Metrics collection
- **Grafana:** Metrics visualization
- **ELK Stack:** Log aggregation and analysis
- **Jaeger:** Distributed tracing

---

## Scalability

### Horizontal Scaling with Docker Compose

Scale individual services based on load:

```bash
# Scale payments service to 3 instances
docker compose up -d --scale payments-service=3

# Scale multiple services
docker compose up -d --scale orders-service=2 --scale payments-service=3
```

### Load Balancing Considerations

For production deployments, consider:

1. **API Gateway:** Implement NGINX or Kong for request routing
2. **Service Mesh:** Use Istio or Linkerd for advanced traffic management
3. **Database Replication:** Set up PostgreSQL read replicas
4. **Caching Layer:** Add Redis for frequently accessed data
5. **Message Queue:** Implement RabbitMQ or Kafka for async communication

### Production Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[NGINX / Kong]
    end
    
    subgraph "Application Tier - Auto-scaled"
        Auth1[Auth Service 1]
        Auth2[Auth Service 2]
        Products1[Products Service 1]
        Products2[Products Service 2]
        Orders1[Orders Service 1]
        Orders2[Orders Service 2]
    end
    
    subgraph "Data Tier"
        Master[(PostgreSQL<br/>Primary)]
        Replica1[(PostgreSQL<br/>Replica 1)]
        Replica2[(PostgreSQL<br/>Replica 2)]
        Cache[(Redis Cache)]
    end
    
    subgraph "Message Queue"
        MQ[RabbitMQ]
    end
    
    LB --> Auth1
    LB --> Auth2
    LB --> Products1
    LB --> Products2
    LB --> Orders1
    LB --> Orders2
    
    Auth1 --> Master
    Auth2 --> Master
    Products1 --> Master
    Products2 --> Replica1
    Orders1 --> Master
    Orders2 --> Replica2
    
    Orders1 --> MQ
    Orders2 --> MQ
    
    Auth1 --> Cache
    Auth2 --> Cache
    Products1 --> Cache
    Products2 --> Cache
    
    Master --> Replica1
    Master --> Replica2
```

---

## Troubleshooting

### Common Problems

#### Problem 1: Port Already in Use

**Symptom:**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Find process using port (Windows)
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F

# Find process using port (Linux/macOS)
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

#### Problem 2: JWT Token Validation Failed

**Symptom:**
```
401 Unauthorized: Invalid or expired token
```

**Solution:**
```bash
# Verify all services use the same JWT_SECRET
# Check .env files in each service

# Auth Service
grep JWT_SECRET auth-service/.env

# Products Service  
grep JWT_SECRET products-service/.env

# Ensure they match!
```

#### Problem 3: Database Connection Failed

**Symptom:**
```
Error: could not connect to server: Connection refused
```

**Solution:**
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Verify connection string
docker exec -it distributed-postgres psql -U postgres -l

# Restart database
docker compose restart postgres
```

#### Problem 4: Service Cannot Communicate

**Symptom:**
```
Error: connect ECONNREFUSED
```

**Solution:**
```bash
# Verify all services are on the same network
docker network inspect distributed-system_distributed-network

# Check service names in docker-compose.yml match URLs
# Use service name (e.g., "products-service") NOT "localhost"

# Verify environment variables
docker compose config
```

#### Problem 5: CORS Errors in Frontend

**Symptom:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
```bash
# Add frontend origin to CORS_ORIGINS in each service
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Restart services after updating
docker compose restart
```

### Failure Diagnosis

#### Service Fails to Start

```bash
# Check service logs
docker compose logs <service-name>

# Check container status
docker compose ps

# Inspect container
docker inspect <container-name>

# Check environment variables
docker compose exec <service-name> env

# Verify Dockerfile
docker compose config
```

#### Database Migration Issues

```bash
# For Laravel (Products Service)
docker compose exec products-service php artisan migrate:status
docker compose exec products-service php artisan migrate

# For Spring Boot (Orders Service)
# Migrations run automatically via Hibernate

# For FastAPI (Auth Service)
docker compose exec auth-service alembic current
docker compose exec auth-service alembic upgrade head

# For Rust (Inventory API)
docker compose exec inventory-api sqlx migrate run
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# Increase container resources in docker-compose.yml
services:
  orders-service:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Restart and Recovery

#### Restart Single Service

```bash
# Soft restart (maintains state)
docker compose restart auth-service

# Hard restart (rebuild)
docker compose up -d --force-recreate --build auth-service
```

#### Restart All Services

```bash
# Restart all without rebuilding
docker compose restart

# Rebuild and restart all
docker compose up -d --force-recreate --build
```

#### Complete System Reset

```bash
# ⚠️ WARNING: This will delete all data!

# Stop all services
docker compose down

# Remove all volumes (deletes databases)
docker compose down -v

# Remove all images
docker compose down --rmi all

# Clean build cache
docker builder prune -a

# Rebuild from scratch
docker compose up -d --build
```

#### Database Backup and Restore

**Backup:**
```bash
# Backup all databases
docker exec distributed-postgres pg_dumpall -U postgres > backup.sql

# Backup specific database
docker exec distributed-postgres pg_dump -U postgres orders_db > orders_backup.sql
```

**Restore:**
```bash
# Restore all databases
cat backup.sql | docker exec -i distributed-postgres psql -U postgres

# Restore specific database
cat orders_backup.sql | docker exec -i distributed-postgres psql -U postgres -d orders_db
```

---

## Project Structure

```
distributed-system/
│
├── auth-service/                 # Authentication Service (Python/FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utilities (JWT, hashing)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── products-service/            # Products Service (PHP/Laravel)
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/     # API controllers
│   │   └── Models/              # Eloquent models
│   ├── database/
│   │   └── migrations/          # Database migrations
│   ├── routes/
│   │   └── api.php              # API routes
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── composer.json
│   ├── .env.example
│   └── README.md
│
├── inventario_api/              # Inventory API (Rust/Actix)
│   ├── src/
│   │   ├── main.rs              # Application entry
│   │   ├── models.rs            # Data models
│   │   ├── handlers.rs          # Request handlers
│   │   ├── db.rs                # Database connection
│   │   └── middleware/          # Auth middleware
│   ├── migrations/              # SQL migrations
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Cargo.toml
│   ├── .env.example
│   └── readme.md
│
├── orders-service/              # Orders Service (Java/Spring Boot)
│   ├── src/
│   │   └── main/
│   │       └── java/com/distributedsystem/orders/
│   │           ├── OrdersApplication.java
│   │           ├── config/      # Configuration classes
│   │           ├── controller/  # REST controllers
│   │           ├── service/     # Business logic
│   │           ├── repository/  # JPA repositories
│   │           ├── model/       # JPA entities
│   │           ├── dto/         # DTOs
│   │           ├── security/    # JWT security
│   │           └── exception/   # Exception handlers
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml                  # Maven dependencies
│   └── README.md
│
├── payments-service/            # Payments Service (Node.js/Express)
│   ├── src/
│   │   ├── index.js            # Express app entry
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Database models
│   │   ├── services/           # Business logic
│   │   └── middleware/         # Auth middleware
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env.example
│
├── notifications-service/       # Notifications Service (Node.js/Express)
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── email.service.js  # Email notifications
│   │   │   └── notification.service.js
│   │   └── templates/            # Email templates
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env.example
│
├── frontend/                    # Frontend Application (Vue.js)
│   ├── src/
│   │   ├── main.js             # Application entry
│   │   ├── App.vue             # Root component
│   │   ├── router/             # Vue Router
│   │   ├── views/              # Page components
│   │   │   ├── Home.vue
│   │   │   ├── Products.vue
│   │   │   ├── Cart.vue
│   │   │   ├── Checkout.vue
│   │   │   ├── Orders.vue
│   │   │   └── Admin/
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API service layer
│   │   │   ├── api.js          # Axios configuration
│   │   │   ├── auth.service.js
│   │   │   ├── products.service.js
│   │   │   └── orders.service.js
│   │   ├── store/              # State management (Vuex/Pinia)
│   │   └── assets/             # Static assets
│   ├── dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── payments-ordenSvc-actual.js  # Payments-Orders Integration Module
│   # Service-to-service communication helper
│   # Used by Payments Service to notify Orders Service
│   # Contains functions: notifPago, obtenerOrden, listarOrdenes
│
├── docker-compose.yml           # Root Docker Compose configuration
├── init-databases.sh            # Database initialization script
├── health-check.sh              # Health check script
├── .gitignore
└── README.md                    # This file
```

### Special Files

#### payments-ordenSvc-actual.js

This JavaScript module facilitates communication between the Payments Service and Orders Service. It provides:

- **`notifPago(idPedido, estado)`**: Notifies Orders Service about payment status changes
- **`obtenerOrden(idPedido)`**: Retrieves order details from Orders Service
- **`listarOrdenes(idUs)`**: Lists all orders for a specific user

**Usage in Payments Service:**
```javascript
import { notifPago, obtenerOrden } from '../payments-ordenSvc-actual.js';

// After payment processing
await notifPago(orderId, 'completado');
```

This pattern demonstrates service-to-service communication in the microservices architecture.

---

## Contributing

We welcome contributions to improve the distributed system! Follow these guidelines:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/distributed-system.git
   cd distributed-system
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style for each service
   - Add tests for new features
   - Update documentation

4. **Test your changes**
   ```bash
   # Run tests for modified service
   cd <service-name>
   npm test  # or mvn test, cargo test, etc.
   
   # Test integration
   docker compose up -d --build
   ./health-check.sh
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   **Commit Message Convention:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Test additions or modifications
   - `chore:` Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all CI checks pass

### Code Standards

#### Python (Auth Service)
- Follow PEP 8 style guide
- Use type hints
- Document functions with docstrings

#### PHP (Products Service)
- Follow PSR-12 coding standard
- Use Laravel best practices
- Write PHPDoc comments

#### Rust (Inventory API)
- Run `cargo fmt` before committing
- Pass `cargo clippy` checks
- Follow Rust naming conventions

#### Java (Orders Service)
- Follow Google Java Style Guide
- Use Spring Boot best practices
- Write comprehensive JavaDoc

#### JavaScript/Node.js (Payments, Notifications, Frontend)
- Use ESLint with recommended rules
- Follow Airbnb JavaScript Style Guide
- Use JSDoc for complex functions

### Pull Request Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No merge conflicts
- [ ] Commit messages follow convention

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Distributed System Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Roadmap


## Support and Contact

For questions, issues, or contributions:

- **GitHub Issues:** [Report a bug or request a feature](https://github.com/namoruso/distributed-system/issues)
- **Documentation:** See individual service READMEs for detailed documentation


---

## Acknowledgments

This distributed system was built as an educational project to demonstrate microservices architecture patterns and best practices.

**Technologies Used:**
- [FastAPI](https://fastapi.tiangolo.com/) - Auth Service
- [Laravel](https://laravel.com/) - Products Service
- [Actix-web](https://actix.rs/) - Inventory API
- [Spring Boot](https://spring.io/projects/spring-boot) - Orders Service
- [Express.js](https://expressjs.com/) - Payments & Notifications Services
- [Vue.js](https://vuejs.org/) - Frontend
- [Docker](https://www.docker.com/) - Containerization
- [PostgreSQL](https://www.postgresql.org/) - Database

**Inspired By:**
- [Microservices.io](https://microservices.io/) - Microservices patterns
- [The Twelve-Factor App](https://12factor.net/) - Application design methodology

---

**Built with ❤️ by the Distributed System Team**

Last Updated: January 2026
