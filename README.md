# AjedrezArqui — Ajedrez multijugador con arquitectura de microservicios

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?logo=node.js) ![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?logo=prisma) ![WebSockets](https://img.shields.io/badge/WebSockets-ws-black)

> Plataforma de ajedrez online construida sobre una arquitectura de microservicios desacoplados. Permite jugar partidas multijugador en tiempo real, enfrentarse a una IA con niveles de dificultad, autenticarse mediante código QR (estilo WhatsApp Web) y llevar un historial de partidas con sistema de ranking ELO.

## Features

- **Multijugador en tiempo real** via WebSockets — movimientos validados con `chess.js`
- **Login por QR** — escaneas el QR desde el movil y la sesion de escritorio se autentica automaticamente
- **IA con niveles de dificultad** — oponente artificial configurable
- **Sistema ELO** — el ranking se recalcula automaticamente al terminar cada partida
- **Salas privadas** — crea una sala con codigo e invita a un amigo
- **Historial de partidas** — registro de todas las partidas jugadas con resultados
- **Registro y login clasico** — email + contrasena con hashing bcrypt y JWT

## Stack

| Capa | Tecnologia |
|------|------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS v4 + Radix UI (shadcn/ui) |
| Backend | Node.js + Express 5 + TypeScript (microservicios) |
| Tiempo real | WebSockets nativos (`ws`) |
| Logica de ajedrez | `chess.js` |
| Autenticacion | JWT + bcrypt + QR code |
| Base de datos | SQLite via Prisma ORM |

## Microservicios

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| `users-service` | 3001 | Registro, estadisticas y ranking de jugadores |
| `auth-service` | 3002 | Login clasico, login por QR, JWT |
| `profile-service` | 3003 | Perfil de usuario |
| `games-service` | 3004 | Logica de partidas, WebSocket, IA, ELO |
| `guest-service` | 3005 | Sesiones de invitado |
| `matchmaking-service` | 3006 | Emparejamiento automatico y salas por codigo |

## Correr en local

### Requisitos

- Node.js v16 o superior
- npm v8 o superior

### Instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd AjedrezArqui

# 2. Instalar dependencias del backend
npm install

# 3. Instalar dependencias del frontend
cd client && npm install && cd ..

# 4. Preparar la base de datos
npx prisma db push

# 5. Cargar jugadores iniciales (Magnus, Hikaru, etc.)
npm run seed
```

### Variables de entorno (opcional)

Crea un archivo `.env` en la raiz del proyecto:

```env
JWT_SECRET=tu_secreto_seguro_aqui
```

Sin este archivo el sistema usa un secreto por defecto (solo para desarrollo local).

### Ejecucion

```bash
# Levanta todos los servicios + frontend en paralelo
npm run start:all
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Users API | http://localhost:3001 |
| Auth API | http://localhost:3002 |
| Games API + WS | http://localhost:3004 |
| Matchmaking | http://localhost:3006 |

### Scripts utiles

```bash
npm run seed      # Restablece jugadores predeterminados
npm run backup    # Copia de seguridad de la base de datos
npm run restore   # Restaura la base de datos desde el ultimo backup
```

## Estructura del proyecto

```
AjedrezArqui/
├── src/
│   ├── auth-service/          # Autenticacion y sesiones QR
│   ├── users-service/         # Gestion de jugadores
│   ├── games-service/         # Logica de juego, WebSocket, IA, ELO
│   ├── matchmaking-service/   # Emparejamiento y salas privadas
│   ├── profile-service/       # Perfiles de usuario
│   └── guest-service/         # Sesiones de invitado
├── client/
│   └── src/
│       ├── components/        # UI: tablero, menus, login, historial
│       ├── controllers/       # Logica de UI desacoplada (MVC)
│       ├── models/            # Entidades y acceso a datos en cliente
│       └── styles/            # Tailwind, tema y fuentes
├── prisma/
│   ├── schema.prisma          # Modelos User y Game
│   └── seed.ts                # Jugadores iniciales
└── package.json               # Scripts raiz (concurrently)
```

## Flujo de login por QR

1. El frontend genera una sesion y muestra un codigo QR.
2. El usuario escanea el QR con el movil (ruta `/mobile-confirm`).
3. El movil confirma la identidad y el `auth-service` notifica al `games-service`.
4. El `games-service` envia un mensaje WebSocket al navegador de escritorio con el JWT.
5. La sesion queda autenticada sin que el usuario escriba la contrasena en el PC.

## Logica de partida (WebSocket)

Cuando un jugador envia `action: "move"`, el servidor:
1. Recupera el estado de la partida desde `GameManagerService`.
2. Valida la legalidad del movimiento con `chess.js`.
3. Retransmite el movimiento al oponente y actualiza el tablero.
4. Si detecta jaque mate, finaliza la partida y recalcula los ELOs de ambos jugadores.

## Screenshots

> Pendiente — proxima actualizacion

## Autor

**Oscarpeg**
