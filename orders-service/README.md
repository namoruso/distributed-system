# Orders Service

Microservicio para gestión de pedidos desarrollado con **Java 17** y **Spring Boot 3.2**.

## 🚀 Características

- ✅ Creación de pedidos con validación de productos
- ✅ Consulta de pedidos por usuario
- ✅ Actualización de estados de pedidos (solo admin)
- ✅ Validación de stock con Products Service
- ✅ Autenticación JWT compartida con Auth Service
- ✅ Paginación y ordenamiento
- ✅ Docker ready

## 📋 Requisitos

- Java 17 o superior
- Maven 3.8+
- Docker & Docker Compose
- PostgreSQL 15 (o usar el contenedor incluido)

## 🔧 Configuración

### Variables de Entorno

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orders_db
DB_USER=orders_user
DB_PASSWORD=orders_pass

# JWT (debe coincidir con Auth Service)
JWT_SECRET=a-string-secret-at-least-256-bits-long-for-HS256-algorithm

# Products Service
PRODUCTS_SERVICE_URL=http://localhost:8001

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

## 🐳 Ejecutar con Docker

```bash
# Construir y levantar servicios
docker compose up -d --build

# Ver logs
docker compose logs -f orders

# Detener servicios
docker compose down

# Detener SIN borrar datos
docker compose stop
```

El servicio estará disponible en: `http://localhost:8003`

## 💻 Ejecutar en Desarrollo

```bash
# Instalar dependencias
./mvnw clean install

# Ejecutar aplicación
./mvnw spring-boot:run

# O con variables de entorno personalizadas
JWT_SECRET=your-secret ./mvnw spring-boot:run
```

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

### Create Order

```http
POST /api/orders
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "notes": "Entregar por la mañana"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "1",
    "userEmail": "user@example.com",
    "totalAmount": 199.98,
    "status": "CREADO",
    "items": [...],
    "createdAt": "2026-01-06T21:00:00",
    "notes": "Entregar por la mañana"
  },
  "message": "Order created successfully",
  "timestamp": "2026-01-06T21:00:00"
}
```

### List User Orders

```http
GET /api/orders?status=CREADO&page=0&size=10&sortBy=createdAt&sortDir=DESC
Authorization: Bearer {jwt_token}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 5,
    "totalPages": 1,
    "size": 10,
    "number": 0
  },
  "timestamp": "2026-01-06T21:00:00"
}
```

### Get Order Details

```http
GET /api/orders/{id}
Authorization: Bearer {jwt_token}
```

### Update Order Status (Admin Only)

```http
PUT /api/orders/{id}/status
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "PAGADO"
}
```

## 📊 Estados de Pedido

| Estado        | Descripción                         |
| ------------- | ----------------------------------- |
| `CREADO`      | Orden creada, pendiente de pago     |
| `PAGADO`      | Pago confirmado, pendiente de envío |
| `ENVIADO`     | Orden enviada al cliente            |
| ` COMPLETADO` | Orden completada y entregada        |
| `CANCELADO`   | Orden cancelada                     |

## 🔐 Autenticación

Este servicio valida tokens JWT emitidos por el **Auth Service**. El token debe incluir:

```json
{
  "sub": "user_id",
  "correo": "user@example.com",
  "rol": "admin|user"
}
```

**Permisos:**

- `user`: Puede crear pedidos y ver sus propios pedidos
- `admin`: Puede ver todos los pedidos y actualizar estados

## 🔗 Integración con Products Service

Al crear un pedido, el servicio:

1. Consulta el Products Service para validar cada producto
2. Verifica que haya stock suficiente
3. Calcula el total usando los precios actuales
4. Guarda una instantánea de la información del producto

## 🗄️ Base de Datos

### Esquema

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CREADO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🏗️ Arquitectura

```
orders-service/
├── config/          # Configuración (Security, CORS, RestTemplate)
├── controller/      # REST Controllers
├── service/         # Lógica de negocio
├── repository/      # Data access layer (JPA)
├── model/           # Entidades JPA
├── dto/             # Data Transfer Objects
├── security/        # JWT authentication
└── exception/       # Exception handling
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
./mvnw test

# Ejecutar tests de integración
./mvnw verify

# Con coverage
./mvnw test jacoco:report
```

## 🐛 Troubleshooting

### Error: "Could not autowire. No beans of 'OrderRepository' type found"

Asegúrate de que el paquete base en `@SpringBootApplication` sea `com.distributedsystem.orders`

### Error: "Invalid or expired JWT token"

Verifica que `JWT_SECRET` sea exactamente el mismo que en Auth Service

### Error: "Error communicating with Products Service"

Verifica que `PRODUCTS_SERVICE_URL` apunte correctamente al servicio y que esté corriendo

## 📝 Notas

- Las migraciones de base de datos se ejecutan automáticamente con Hibernate (`ddl-auto: update`)
- Los pedidos almacenan una instantánea del producto para mantener histórico preciso
- Solo los administradores pueden cambiar el estado de los pedidos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del sistema distribuido educativo.
