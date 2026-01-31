# <img src="https://mongoose-studio.yaasir.dev/logo.png" width="40" valign="middle" alt="Mongoose Studio Logo" /> Mongoose Studio

**Your Mongoose Data, Visualized.**

![Mongoose Studio Banner](https://mongoose-studio.yaasir.dev/hero-screenshot.png)

[![npm version](https://img.shields.io/npm/v/mongoose-studio.svg?style=flat-square)](https://www.npmjs.org/package/mongoose-studio)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=mongoose-studio&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=mongoose-studio)
[![downloads](https://img.shields.io/npm/dm/mongoose-studio.svg?style=flat-square)](https://npm-stat.com/charts.html?package=mongoose-studio)

Mongoose Studio is a **zero-config CLI tool** that provides an instant Graphical User Interface (GUI) for your Mongoose models. It bridges the gap between your code definitions and your actual database.

👉 **[Launch Documentation Website](https://mongoose-studio.yaasir.dev)**

---

## Features

-   **Zero Configuration**: No config files, no route setup. It reads your code.
-   **Schema-Aware**: Visualizes data respecting your Mongoose schema types, defaults, and validations.
-   **Read-Only Safe**: Defaults to read-only mode to prevent accidental production edits.
-   **Instant Launch**: Runs directly from your terminal using `npx` or `bunx`.
-   **Hot Reload**: (Coming Soon) Updates the UI as you change your schemas.

## Quick Start

Go to your project directory (where your `models/` folder lives) and run:

```bash
npx mongoose-studio
```

or with Bun:

```bash
bunx mongoose-studio
```

That's it! 
1.  It automatically finds your models.
2.  It connects using your `.env` string.
3.  It opens **http://localhost:5555**.

## Configuration

While it works out of the box, you can customize it via flags:

| Flag       | Default                      | Description                                      |
| :--------- | :--------------------------- | :----------------------------------------------- |
| `--port`   | `5555`                       | The port to run the Studio server on.            |
| `--uri`    | `process.env.MONGO_URI`      | Custom MongoDB connection string.                |
| `--models` | Auto-detected (`./models`, etc) | Path to your models folder if not found automatically. |

**Example:**
```bash
npx mongoose-studio --port=8080 --models=src/database/schemas
```

## Troubleshooting

**"Mongoose not found"**
Ensure you are running the command in the root of a project that has `mongoose` installed (`npm install mongoose`).

**"No models found"**
Mongoose Studio looks in common folders (`models`, `src/models`, `lib/models`). If you store them elsewhere, use the `--models` flag:
`npx mongoose-studio --models=src/entities`

**"Port in use"**
If port 5555 is taken, the tool connects to the next available port automatically (e.g., 5556).

> For deeper troubleshooting, check the [Documentation Site](https://mongoose-studio.yaasir.dev/docs).

## Contributing

We love contributions! Mongoose Studio is a monorepo built with **Bun**, **Hono** (Server), and **Next.js** (UI).

1.  Clone the repository.
2.  Run `bun install`.
3.  Run `bun run dev` to start both the CLI logic and the Next.js UI in development mode.

## License

MIT © [Yasir](https://github.com/sirrryasir)
