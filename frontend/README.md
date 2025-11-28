# Frontend Vue.js - Distributed Microservices System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/namoruso/distributed-system/frontend) 
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)
[![Vue Router](https://img.shields.io/badge/Vue_Router-4.x-red.svg)](https://router.vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-2.x-yellow.svg)](https://pinia.vuejs.org/)
[![Axios](https://img.shields.io/badge/Axios-1.x-lightgrey.svg)](https://axios-http.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A modern Vue.js frontend application that consumes three independent microservices (Auth, Products, Inventory) in a distributed system architecture with JWT authentication.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Microservices Integration](#microservices-integration)
- [API Communication](#api-communication)
- [Authentication Flow](#authentication-flow)
- [Components Documentation](#components-documentation)
- [State Management](#state-management)
- [Routing](#routing)
- [Styling](#styling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

**Distributed System Frontend** is a Vue.js single-page application that serves as the user interface for a microservices-based distributed system. It provides seamless integration with three independent backend services through a unified and responsive interface.

**Key Capabilities:**
- **JWT Authentication** with persistent sessions
- **Product Management** with full CRUD operations
- **Inventory Control** with real-time stock updates
- **Microservices Communication** via dedicated API clients
- **Route Protection** with authentication guards
- **State Management** with Pinia stores

**Base URL:** `http://localhost:5173`

---

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer - Vue.js Application"
        A[Vue 3 SPA] --> B[Vue Router]
        A --> C[Pinia Store]
        A --> D[Components]
    end

    subgraph "API Communication Layer"
        B --> E[Axios Instances]
        E --> F[Auth Service]
        E --> G[Products Service]
        E --> H[Inventory Service]
    end

    subgraph "Backend Microservices"
        F[FastAPI Auth<br/>localhost:8000]
        G[Laravel Products<br/>localhost:8001]
        H[Rust Inventory<br/>localhost:5002]
    end

    subgraph "Data Storage"
        F --> I[(PostgreSQL)]
        G --> J[(PostgreSQL)]
        H --> K[(PostgreSQL)]
    end

    style A fill:#4CAF50
    style F fill:#2196F3
    style G fill:#FF9800
    style H fill:#F44336
```
#  Features

###  **Authentication**
- Login
- Registration
- Email verification code (from Auth Service)
- Persistent session using `localStorage`
- Automatic logout on invalid/expired tokens

###  **Products Module**
- List all products
- View details
- Create, update, delete products
- Protected via JWT

###  **Inventory Module**
- View inventory for all products
- Update stock levels (increment / decrement)
- Protected via JWT

### **Microservice Integration**
- Independent Axios instance per backend
- Automatic token injection
- Error handling and redirection

###  **User Interface**
- Responsive layout
- Modular CSS scoped per view
- Reusable components (Navbar, Footer)

---

# 🛠 Technologies

| Category | Technology |
|---------|------------|
| Framework | Vue 3 |
| Routing | Vue Router |
| Global State | Pinia |
| HTTP Client | Axios |
| Styling | Modular CSS |
| Authentication | JWT (via microservices) |

---

# Requirements

Before running the project, install:

- **Node.js** (v16+ recommended)
- **NPM**
- The 3 backend microservices running locally:  
  - FastAPI Auth (`http://localhost:8000/api`)  
  - Laravel Products (`http://localhost:8001/api`)  
  - Rust Inventory (`http://localhost:5002/api`)

---

#  Installation

Follow these steps:

```bash
# Clone repository
git clone https://github.com/yourusername/distributed-system-frontend.git
cd distributed-system-frontend

# Install dependencies
npm install

# Required libraries
npm install vue-router
npm install pinia
npm install axios

# Run development server
npm run dev
```



The application will be available at:

http://localhost:5173

This template should help get you started developing with Vue 3 in Vite.

# Microservices Integration
Service	Base URL	Axios File
Auth Service	http://localhost:8000/api	axiosAuth.js
Products Service	http://localhost:8001/api	axiosProducts.js
Inventory Service	http://localhost:5002/api	axiosInventory.js

All protected endpoints require:

Authorization: Bearer <token>

API Client Architecture
Each microservice has a dedicated Axios instance with:

``` javascript
// Example: axiosAuth.js
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
 ```

Authentication Headers
All protected endpoints require JWT tokens:

http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
API Communication
Request Interceptors
Automatic token injection for authenticated requests:

``` javascript
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
    
  return config
})
```
Response Interceptors
Centralized error handling and token management:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

High-Level API Functions
Each service exports convenient functions:

```javascript
// Products service functions
export async function listProducts(params = {}) {
  return productsApi.get('/products', { params })
}

export async function createProduct(payload) {
  return productsApi.post('/products', payload)
}

// Inventory service functions  
export async function updateStock(id, mode, payload) {
  return inventoryApi.put(`/inventory/update/${id}/${mode}`, payload)
}
```


# Styling Architecture
## CSS Module Structure
### main.css: 
Global styles and CSS variables

### auth.css: 
Authentication page styles

### 
dashboard.css: Dashboard layout and components

### navbar.css:
 Navigation component styles

### products.css: 
Product management interfaces

### inventory.css: 
Inventory control styles

### Design Principles
Modularity: Scoped styles per feature

### Consistency: 
CSS variables for theming


### Accessibility:
 Semantic HTML and ARIA labels

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant R as Router
    participant S as Store

    U->>F: Access protected route
    F->>S: Check authentication state
    S-->>F: Token exists?
    
    alt Token exists
        F->>A: Validate token (implicit via interceptor)
        A-->>F: Valid token
        F-->>U: Grant access to route
    else No token or invalid
        F->>R: Redirect to /login
        R-->>U: Show login page
        U->>F: Submit credentials
        F->>A: POST /api/login
        A-->>F: JWT Token
        F->>S: Store token
        F->>R: Redirect to original route
    end
```

Built with ❤️ using Vue and Docker