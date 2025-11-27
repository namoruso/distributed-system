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
``` ## Authentication Flow
┌─────────────────────────────────────────────────────────┐
│ User Interface │
│ (Vue.js Frontend Application) │
└────────────────────┬────────────────────────────────────┘
│
│ User Actions & HTTP Requests
│
┌────────────────────▼────────────────────────────────────┐
│ Vue Router Layer │
│ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Route Guards │ │
│ │ • Check authentication state │ │
│ │ • Redirect unprotected routes │ │
│ │ • Handle navigation events │ │
│ └──────────────┬───────────────────────────────────┘ │
│ │ │
│ ┌──────────────▼───────────────────────────────────┐ │
│ │ Pinia Store │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Auth Store │ │ │
│ │ │ • Token management │ │ │
│ │ │ • User state │ │ │
│ │ │ • Persistence (localStorage) │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Verify Store │ │ │
│ │ │ • Email verification state │ │ │
│ │ │ • Temporary data storage │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └──────────────┬───────────────────────────────────┘ │
└─────────────────┼───────────────────────────────────────┘
│
│ Axios HTTP Requests with JWT
│
┌─────────────────▼────────────────────────────────────┐
│ API Communication Layer │
│ │
│ ┌──────────────────────────────────────────────────┐│
│ │ Axios Interceptors ││
│ │ ││
│ │ Request Interceptors: ││
│ │ • Automatic token injection ││
│ │ • Content-type headers ││
│ │ ││
│ │ Response Interceptors: ││
│ │ • 401 error handling ││
│ │ • Automatic logout ││
│ │ • Token refresh logic ││
│ └──────────────┬───────────────────────────────────┘│
│ │ │
│ ┌──────────────▼───────────────────────────────────┐│
│ │ Service Instances ││
│ │ ││
│ │ ┌─────────────────────────────────────────────┐ ││
│ │ │ Auth API Client │ ││
│ │ │ • BaseURL: localhost:8000/api │ ││
│ │ │ • Login/Register/Verify endpoints │ ││
│ │ └─────────────────────────────────────────────┘ ││
│ │ ││
│ │ ┌─────────────────────────────────────────────┐ ││
│ │ │ Products API Client │ ││
│ │ │ • BaseURL: localhost:8001/api │ ││
│ │ │ • CRUD operations │ ││
│ │ └─────────────────────────────────────────────┘ ││
│ │ ││
│ │ ┌─────────────────────────────────────────────┐ ││
│ │ │ Inventory API Client │ ││
│ │ │ • BaseURL: localhost:5002/api │ ││
│ │ │ • Stock management │ ││
│ │ └─────────────────────────────────────────────┘ ││
│ └──────────────┬───────────────────────────────────┘│
└─────────────────┼────────────────────────────────────┘
│
│ HTTP/HTTPS + JWT Tokens
│
┌─────────────────▼────────────────────────────────────┐
│ Backend Microservices │
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────┐│
│ │ Auth Service │ │ Products Service│ │Inventory││
│ │ (FastAPI) │ │ (Laravel) │ │ Service ││
│ │ Port: 8000 │ │ Port: 8001 │ │(Rust) ││
│ │ │ │ │ │Port:5002││
│ │ • User reg │ │ • Product CRUD │ │• Stock ││
│ │ • JWT generation│ │ • Validation │ │ control ││
│ │ • Email verify │ │ • Business logic│ │• Levels ││
│ └─────────────────┘ └─────────────────┘ └─────────┘│
└───────────────────────────────────────────────────────┘
```

# Diagrama de Casos de Uso - Sistema Distribuido de Microservicios

```mermaid
graph TB
    %% Actores del sistema
    A[Usuario del Sistema] --> UC
    B[Administrador] --> UC
    C[Sistema Externo] --> UC
    
    %% Agrupación de casos de uso por microservicio
    subgraph MS1 [Microservicio 1: Auth Service (Python + FastAPI)]
        UC1[Registrar Usuario]
        UC2[Iniciar Sesión]
        UC3[Cerrar Sesión]
        UC4[Validar Token JWT]
        UC5[Refrescar Token]
        UC6[Verificar Email]
        UC7[Reenviar Código Verificación]
    end
    
    subgraph MS2 [Microservicio 2: Products Service (PHP + Laravel)]
        UC8[Crear Producto]
        UC9[Consultar Productos]
        UC10[Obtener Producto por ID]
        UC11[Actualizar Producto]
        UC12[Eliminar Producto]
        UC13[Buscar Productos]
        UC14[Validar Datos Producto]
    end
    
    subgraph MS3 [Microservicio 3: Inventory Service (Rust + Axum)]
        UC15[Consultar Inventario]
        UC16[Obtener Item por ID]
        UC17[Aumentar Stock]
        UC18[Disminuir Stock]
        UC19[Actualizar Nivales Stock]
        UC20[Consultar Nivel Inventario]
        UC21[Gestionar Estado Producto]
        UC22[Generar Alertas Stock]
    end
    
    subgraph MS4 [Frontend Vue.js]
        UC23[Navegar entre Vistas]
        UC24[Gestionar Sesión Usuario]
        UC25[Manejar Estado Global]
        UC26[Consumir APIs Microservicios]
        UC27[Manejar Errores y Carga]
        UC28[Validar Formularios Cliente]
    end
    
    %% Relaciones entre actores y casos de uso
    A --> UC1
    A --> UC2
    A --> UC3
    A --> UC6
    A --> UC7
    A --> UC8
    A --> UC9
    A --> UC10
    A --> UC11
    A --> UC12
    A --> UC13
    A --> UC15
    A --> UC16
    A --> UC17
    A --> UC18
    A --> UC19
    A --> UC21
    A --> UC23
    A --> UC24
    
    B --> UC8
    B --> UC11
    B --> UC12
    B --> UC17
    B --> UC18
    B --> UC19
    B --> UC21
    
    C --> UC4
    C --> UC9
    C --> UC15
    C --> UC20
    
    %% Dependencias entre casos de uso
    UC2 -.->|requiere| UC4
    UC8 -.->|requiere| UC4
    UC11 -.->|requiere| UC4
    UC12 -.->|requiere| UC4
    UC17 -.->|requiere| UC4
    UC18 -.->|requiere| UC4
    UC19 -.->|requiere| UC4
    
    UC17 -.->|afecta| UC20
    UC18 -.->|afecta| UC20
    UC19 -.->|afecta| UC20
    
    UC8 -.->|crea| UC16
    UC12 -.->|elimina| UC16
    
    UC26 -.->|consume| UC1
    UC26 -.->|consume| UC2
    UC26 -.->|consume| UC8
    UC26 -.->|consume| UC9
    UC26 -.->|consume| UC15
    UC26 -.->|consume| UC17
    UC26 -.->|consume| UC18

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style MS1 fill:#fff3e0
    style MS2 fill:#e8eaf6
    style MS3 fill:#e0f2f1
    style MS4 fill:#fce4ec
```

Built with ❤️ using Vue and Docker