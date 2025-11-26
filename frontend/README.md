# .

src/
 ├─ api/                         ← comunicación con microservicios
 │    └─ axiosAuth.js                ← instancia de axios con interceptores para el login y registro
 │	   └─ axiosProducts.js   contiene la configuración HTTP (baseURL, interceptores) y funciones de alto nivel para las operaciones.
       └─ axiosInventory.js vacia por los momentos
 ├─ assets/                      ← imágenes, íconos y recursos estáticos, 
 │
 ├─ components/                  ← componentes reutilizables
 │    └─ Navbar.vue
 │
 ├─ pages/                       ← pantallas principales de la aplicación
 │    ├─ Login.vue               ← formulario de inicio de sesión
 │    ├─ Register.vue            ← formulario de registro
 │    ├─ Verify.vue              ← verificación del código enviado por correo
 │    ├─ Dashboard.vue           ← perfil básico del usuario autenticado
 │    ├─ Products.vue            ← sin funcionar aun
 │    └─ Inventory.vue           ← pantalla (por completar) para stock del inventario
 │
 ├─ router/
 │    └─ index.js                ← configuración de rutas y guards de autenticación
 │
 ├─ store/                       ← Pinia para el manejo global del estado
 │    └─ auth.js                 ← gestión del token JWT y logout
 │    └─  verify.js hecho para que se pueda guardar el correo y completarlo en verify.vue
 ├─ styles/                      ← estilos modulares organizados por vistas
 │    ├─ main.css
 │    ├─ auth.css
 │    ├─ dashboard.css
 │    ├─ navbar.css
 │    ├─ products.css ya lleno 
 │    └─ inventory.css
 │
 ├─ utils/                       ← espacio reservado para funciones auxiliares, sin usarse actualmente
 │
 ├─ App.vue                      ← componente raíz con Navbar condicional
 ├─ index.html                   ← punto de entrada del proyecto
 ├─ main.js                      ← inicialización de Vue, Router y Pinia
 ├─ .gitignore
 └─ README.md

Reporte detallado del progreso
Configuración inicial del proyecto

Se creó un proyecto Vue 3 mediante Vite y se organizó una estructura modular basada en buenas prácticas:

Páginas separadas para cada vista principal.

Componentes reutilizables en su propia carpeta.

Estilos separados en archivos independientes dentro de styles/.

Router y Store configurados desde el inicio.

Axios centralizado para todas las peticiones a los microservicios.

Esta estructura permite escalabilidad, claridad y soporte para múltiples microservicios.

2. Configuración de Pinia para autenticación

Se implementó un store de autenticación ubicado en src/store/auth.js.
Este store maneja:

Almacenamiento del token JWT.

Persistencia del token en localStorage mientras que luego lo edito a la base de datos
esto era mientras tanto

Funcionalidad de logout.

Base para futuras acciones relacionadas con usuario autenticado.

El store está correctamente integrado en main.js con app.use(createPinia()) aunque debe cambiarse

3. Implementación del Router con protección de rutas

Se configuró Vue Router con:

Rutas para login, registro, verificación, dashboard, productos e inventario.

Un “guard” global beforeEach que verifica el token.

Redirección automática a /login si el usuario no está autenticado.

Redirección por defecto a /dashboard aunque el dashboard solo se redirige, no esta funcional

4. Navbar dinámico

El componente Navbar.vue esta creado pero aun no esta funcional

Enlaces hacia las secciones principales.

Función de cierre de sesión.


5. Implementación del login real contra FastAPI

Se creó el archivo api/axios.js, el cual:

Incluye baseURL apuntando al microservicio FastAPI.

Agrega automáticamente el token Authorization mediante interceptores.


En Login.vue se integró el endpoint real /api/login.
El usuario inicia sesión solo si cumple los requisitos del backend (estar verificado y usar credenciales correctas).

6. Registro con validación desde el backend

Register.vue quedó conectado a /api/registro.
Se agregó redirección automática hacia la pantalla de verificación después del registro.

7. Implementación completa de la verificación de correo

Se creó la pantalla Verify.vue, que permite:

Enviar el código recibido por correo al endpoint /api/verificar.

Reenviar el código mediante /api/reenviar.

Notificar al usuario si el código es incorrecto, expirado o si ya ha sido verificado.

Con esto, se completó el flujo de autenticación completo.
http://localhost:8025/ para poder ir a mailhog para obtener el codigo de verificacion
8. Visualización del usuario autenticado

En Dashboard.vue se integró el endpoint /api/me para mostrar:

ID del usuario

Nombre

Correo

Estado de verificación

Esto permite confirmar que el token es válido y que los interceptores funcionan correctamente.

Estado del microservicio FastAPI (Auth)

pero falta por revisar
Se analizaron y confirmaron los siguientes puntos:

El proyecto se ejecuta mediante Docker usando uvicorn.


Funcionalidades implementadas:

Registro con validación de contraseña.

Generación de código de verificación.

Envío de correo a través de Mailhog.

Reenvío de código.

Verificación de cuenta.

Login con JWT mediante python-jose.

Endpoint /me autenticado con JWT.



Próximos pasos 
Implementar el CRUD de productos cuando se tenga disponible la API en Laravel.

Implementar la vista de inventario una vez que esté disponible la API en Rust.

Revisar y mejorar los estilos del frontend cuando toda la funcionalidad esté estable.


Ampliación del sistema de APIs del frontend

La carpeta src/api/ fue ampliada para manejar múltiples microservicios:

axiosAuth.js → FastAPI (autenticación)

axiosProducts.js → Laravel (CRUD de productos)

axiosInventory.js → Rust (gestión de inventario)

index.js → Punto central que unifica todos los microservicios

Esto crea una capa de comunicación más limpia y profesional, facilitando el mantenimiento y la escalabilidad del sistema distribuido.


4. Mejoras funcionales en la experiencia del usuario

Se añadieron elementos que mejoran significativamente la UX:

Animación de transición entre pantallas (fade + slide up)

Labels flotantes listas para integrarse si se desea

Indicadores visuales de interacción

Páginas coherentes entre sí en cuanto a diseño y estructura

Gracias a estas mejoras, las pantallas se sienten fluidas y de aplicación real.

5. Flujo de autenticación completo implementado

El frontend ya soporta todo el flujo del microservicio FastAPI:

Registro con validación de datos

Almacenamiento del usuario en JSON (manejando ID incremental) mientras tanto

Envío y reenvío de código de verificación vía Mailhog

Verificación del código con expiración de seguridad

Login real con JWT

Persistencia del token mediante Pinia + LocalStorage

Protección de rutas privadas mediante guard en Vue Router

Obtención del usuario autenticado vía /api/me

Aunque aún falta conectar FastAPI para pruebas reales, el frontend ya está preparado y funcional a nivel de lógica.



7. Integración futura pendiente (cuando los microservicios estén listos)

El proyecto ya tiene preparada la estructura para integrar:


Actualmente solo esta conectado con FastApi


requerimientos que hasta los momentos he usado 
npm install vue-router
npm install pinia
npm install axios

This template should help get you started developing with Vue 3 in Vite.

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
