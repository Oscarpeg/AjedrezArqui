# ♟️ Ajedrez Pro - Documentación Técnica del Proyecto

Este documento detalla la arquitectura, componentes y procedimientos de ejecución del ecosistema de microservicios para la aplicación de ajedrez.

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura de **Microservicios** desacoplados, organizados por capas de responsabilidad para facilitar la escalabilidad y el mantenimiento.

### Capas de la Aplicación
1.  **Controladores (Controllers):** Gestionan las peticiones HTTP y las respuestas. No contienen lógica de negocio.
2.  **Servicios (Services):** Contienen la lógica de negocio (validación de ajedrez, cálculo de ELO, orquestación de partidas).
3.  **Modelos/Repositorios (Models/Repositories):** Gestionan el acceso a los datos. Actualmente utilizan **Prisma ORM** con una base de datos **SQLite** local.
4.  **Rutas (Routes):** Definen los puntos de entrada (endpoints) para cada servicio.

---

## 🛠️ Microservicios

### 1. `users-service` (Puerto 3001)
Gestiona la información de los jugadores y sus estadísticas.
*   **Endpoints clave:**
    *   `POST /register`: Registro de nuevos usuarios.
    *   `GET /ranking`: Top 10 jugadores por ELO.
    *   `GET /players/:id/stats`: Estadísticas detalladas de un jugador.

### 2. `auth-service` (Puerto 3002)
Se encarga de la seguridad y autenticación.
*   **Tecnología:** JWT (JSON Web Tokens) y Bcrypt para el hash de contraseñas.
*   **Endpoints clave:**
    *   `POST /login`: Valida credenciales y entrega un token.

### 3. `games-service` (Puerto 3004)
El núcleo del juego. Maneja tanto la API REST como la comunicación en tiempo real.
*   **Tecnologías:** `chess.js` para validación, WebSockets nativos (`ws`).
*   **Funcionalidades:**
    *   **WebSocket (`/ws`):** Maneja movimientos, creación de salas y chat.
    *   **Validación:** Cada jugada se verifica con las reglas oficiales del ajedrez.
    *   **Sistema ELO:** Actualiza el ranking al finalizar la partida.

### 4. `matchmaking-service` (Puerto 3006)
Gestiona el emparejamiento de jugadores y la creación de salas privadas por código.

---

## 💾 Persistencia de Datos
*   **Motor:** SQLite (Archivo local `prisma/dev.db`).
*   **ORM:** Prisma.
*   **Ventaja:** No requiere configuración de servidores en la nube. Todo el progreso se guarda localmente en un solo archivo.

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos Previos
1.  Tener instalado **Node.js** (v16 o superior).
2.  Tener instalado un cliente de base de datos SQLite (opcional, para visualizar).

### Paso 1: Instalación de Dependencias
Ejecuta el siguiente comando en la **raíz** del proyecto y también dentro de la carpeta `client`:
```bash
# En la raíz
npm install

# En la carpeta client
cd client
npm install
cd ..
```

### Paso 2: Configuración de la Base de Datos
Prepara la base de datos y los datos iniciales (jugadores maestros):
```bash
npx prisma db push
npm run seed
```

### Paso 3: Ejecución de los Servicios
Puedes levantar todos los servicios (backend y frontend) simultáneamente:
```bash
npm run start:all
```

*Los servicios se iniciarán en los siguientes puertos:*
*   **Frontend:** http://localhost:5173
*   **Users:** http://localhost:3001
*   **Auth:** http://localhost:3002
*   **Games:** http://localhost:3004

---

## 🛠️ Scripts Útiles
-   `npm run seed`: Restablece los jugadores predeterminados (Magnus, Hikaru, etc.).
-   `npm run backup`: Crea una copia de seguridad de la base de datos.
-   `npm run restore`: Restaura la base de datos desde el último backup.

---

## ♟️ Lógica de Juego (WebSockets)
Cuando un jugador envía un mensaje `action: "move"`, el servidor:
1.  Recupera el estado de la partida desde el `GameManagerService`.
2.  Valida la legalidad del movimiento con `chess.js`.
3.  Si es válido, lo retransmite al oponente y actualiza el tablero.
4.  Si detecta **Jaque Mate**, finaliza la partida y recalcula los ELOs de ambos jugadores.
