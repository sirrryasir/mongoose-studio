# Contributing to Mongoose Studio

We welcome contributions! Mongoose Studio is a monorepo-style project with a backend (Hono) and a frontend (Next.js).

## Setup

1.  **Clone**:
    ```bash
    git clone https://github.com/sirrryasir/mongoose-studio
    cd mongoose-studio
    ```

2.  **Install**:
    ```bash
    bun install
    ```

3.  **Run Development Mode**:
    ```bash
    bun run dev
    ```
    This runs `bin/index.ts` which starts the Hono server.
    *Note*: In development, we currently don't support hot-reloading the UI served by Hono perfectly unless you run `cd ui && bun dev` separately and point it to the API.
    A better workflow is:
    - Run `bun run dev` (API on 5555)
    - In another terminal: `cd ui && bun dev` (UI on 3000, proxied to 5555)

## Architecture

- **bin/index.ts**: CLI entry point.
- **src/**: Backend logic (Mongoose loader, schema inspector, server).
- **ui/**: Next.js Frontend (SPA style using query params).
- **dist/**: Build output (published to npm).

## Building for Production

```bash
bun run build
```
This compiles the UI to static files and bundles the CLI to `dist/index.js`.
