# Architecture

Mongoose Studio is a monorepo-style interface that runs entirely within the user's environment.

## High-Level Overview

```mermaid
graph TD
    CLI[CLI Entry] -->|Run| Server[Hono Server]
    Server -->|Serve| API[/api/* endpoints]
    Server -->|Serve| UI[Static UI Assets]
    
    API -->|Connect| UserDB[(User MongoDB)]
    API -->|Load| UserModels[User Mongoose Models]
    
    UI -->|Fetch| API
```

## 📦 Components

### 1. The CLI (`bin/index.ts` -> `dist/index.js`)
- **Runtime**: Bun (or Node via compiled JS).
- **Role**: Bootstraps the application.
- **Tasks**:
  - Detects `models/` directory in CWD.
  - Loads environment variables (`.env`).
  - Starts the Hono server.
  - Opens the browser.

### 2. The Server (`src/server.ts`)
- **Framework**: Hono (running on Bun).
- **Role**: Unified HTTP server.
- **Routes**:
  - `/api/models`: List models.
  - `/api/models/:name`: Introspect schema.
  - `/api/models/:name/data`: Fetch documents.
  - `/*`: Serves the static UI (Single Page App).

### 3. The UI (`ui/`)
- **Framework**: Next.js (exported as static SPA).
- **Routing**: Client-side query parameters (`/?model=User`).
- **Data**: Fetches from relative `/api` path using `swr`.
- **Build**: Compiles to `dist/ui` HTML/JS/CSS assets.

## 🔄 Data Flow
1. User runs `bunx mongoose-studio`.
2. Server starts at `http://localhost:5555`.
3. Browser opens `http://localhost:5555`.
4. UI loads `index.html` + JS.
5. UI fetches `/api/models`.
6. User selects a model -> UI updates URL to `/?model=User`.
7. UI fetches `/api/models/User` and `/api/models/User/data`.
8. Server queries the *actual* MongoDB using the user's connection string.
