<div align="center">
  <a href="https://mongoose-studio.yaasir.dev">
    <img src="https://mongoose-studio.yaasir.dev/logo.png" alt="Mongoose Studio Logo" width="120" />
  </a>

  <h1 align="center">Mongoose Studio</h1>

  <p align="center">
    <strong>The Modern, Zero-Config GUI for Your Mongoose Models.</strong>
  </p>
  <p align="center">
    Inspect schemas, visualize data, and debug queries instantly without leaving your terminal.
  </p>

  <p align="center">
    <a href="https://www.npmjs.org/package/mongoose-studio">
      <img src="https://img.shields.io/npm/v/mongoose-studio.svg?style=flat-square&color=emerald" alt="npm version" />
    </a>
    <a href="https://packagephobia.now.sh/result?p=mongoose-studio">
      <img src="https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=mongoose-studio&query=$.install.pretty&label=install%20size&style=flat-square&color=blue" alt="install size" />
    </a>
    <a href="https://npm-stat.com/charts.html?package=mongoose-studio">
      <img src="https://img.shields.io/npm/dm/mongoose-studio.svg?style=flat-square&color=orange" alt="downloads" />
    </a>
    <a href="https://github.com/sirrryasir/mongoose-studio/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/mongoose-studio.svg?style=flat-square&color=red" alt="license" />
    </a>
  </p>

  <br />

  <img src="https://github.com/sirrryasir/mongoose-studio/raw/main/web/public/hero-screenshot.png" alt="Mongoose Studio Hero" width="100%" style="border-radius: 10px; border: 1px solid #333;" />
</div>

<br />

## What's New in v1.2

Mongoose Studio just got a major upgrade. We've refined every pixel to give you a premium developer experience.

-   **Premium UI Overhaul**: A completely redesigned, high-contrast dark mode interface.
-   **Smart Type Inference**: Automatically detects `Boolean`, `Date`, and `ObjectID` fields from your data.
-   **Deep Linking**: Navigate relationships (e.g., `author_id`) with a single click in a side panel.
-   **Visual Aggregation Builder**: Orchestrate complex pipelines visually.
-   **Tabs Workspace**: Keep multiple models and documents open simultaneously.

---

## Features

-   **Schema-Aware**: Visualizes data respecting your Mongoose schema types.
-   **Smart Grid**: Virtualized high-performance data grid capable of handling thousands of rows.
-   **CRUD Operations**: Create, Edit (with JSON/Form views), and Delete documents directly.
-   **Deep Linking**: Seamlessly navigate between related documents.
-   **Data Seeding**: Instantly generate fake data for testing (powered by **faker.js**).
-   **Read-Only Mode**: Use `--readonly` for safer production inspection.
-   **Instant Launch**: Runs directly from your terminal using `npx`.

---

## Quick Start

No config needed. Just go to your project directory and run:

```bash
npx mongoose-studio
```

### Seeding Data
Need dummy data? Click the **Seed Data** button in the toolbar to generate 10 random documents based on your schema.

### Read-Only Mode
To prevent accidental edits (e.g., in production), run with the `--readonly` flag:

```bash
npx mongoose-studio --readonly
```

---

## Configuration

| Flag         | Default                      | Description                                                  |
| :----------- | :--------------------------- | :----------------------------------------------------------- |
| `--port`     | `5555`                       | The port to run the Studio server on.                        |
| `--uri`      | `process.env.MONGO_URI`      | Custom MongoDB connection string.                            |
| `--models`   | Auto-detected                | Path to your models folder if not found automatically.       |
| `--readonly` | `false`                      | Disable all write operations (Create, Update, Delete, Seed). |

**Example:**
```bash
npx mongoose-studio --port=8080 --readonly
```

---

## Troubleshooting

<details>
<summary><strong>"Mongoose not found"</strong></summary>
Ensure you are running the command in the root of a project that has `mongoose` installed.
</details>

<details>
<summary><strong>"No models found"</strong></summary>
Mongoose Studio looks in common folders (`models`, `src/models`, `lib/models`). If you store them elsewhere, use the `--models` flag:

`npx mongoose-studio --models=src/entities`
</details>

<details>
<summary><strong>"Port in use"</strong></summary>
If port 5555 is taken, the tool connects to the next available port automatically (e.g., 5556).
</details>

> For deeper troubleshooting, check the [Documentation Site](https://mongoose-studio.yaasir.dev/docs).

---

## Contributing

We love contributions! Mongoose Studio is a monorepo built with **Bun**, **Hono** (Server), and **Next.js** (UI).

1.  Clone the repository.
2.  Run `bun install`.
3.  Run `bun run dev` to start both the CLI logic and the Next.js UI in development mode.

---

## License

MIT © [Yasir](https://github.com/sirrryasir)
