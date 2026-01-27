# Mongoose Studio

**A Graphical User Interface for Mongoose.**
Visualize Mongoose models, schemas, and data within existing projects.

## Features

 - **Zero Configuration**: Execute `npx mongoose-studio` in the project root to start.
 - **Schema Inspection**: Visualize schemas, types, validations, and default values.
 - **Data Exploration**: View documents in a tabular format.
 - **Read-Only**: Prevents accidental data modification by defaulting to read-only mode.
 - **Auto-Detection**: Automatically detects the `models/` directory and `.env` configuration.
 - **Unified Execution**: Launches both the API and UI with a single command.

## Quick Start

Execute the tool directly in the project directory (no installation required):

```bash
# Using Bun
bunx mongoose-studio

# Using npm
npx mongoose-studio
```

That's it! Your browser will open automatically.

## 🛠️ Requirements

- **Runtime**: Node.js (v18+) or Bun (v1+).
- **Database**: A running MongoDB instance.
- **Project**: A project using `mongoose` with models defined.

## ⚙️ Configuration

Mongoose Studio tries to be smart, but you can override defaults:

| Flag | Env Var | Default | Description |
|------|---------|---------|-------------|
| `--port` | `PORT` | `5555` | Port for the Studio server |
| `--uri` | `MONGO_URI` | `mongodb://localhost:27017/test` | MongoDB Connection String |

Example:
```bash
bunx mongoose-studio --port=8080 --uri=mongodb://user:pass@remote:27017/prod
```

## 🏗️ How it Works

1.  **Scans Models**: Looks for a `models/` directory in your current working directory.
2.  **Loads Code**: Dynamically imports your model files to register them with Mongoose.
3.  **Introspects**: Reads the registered Mongoose schemas to build the UI columns.
4.  **Connects**: Connects to the DB using your local environment variables.
5.  **Serves**: Starts a local server that hosts the UI and the API.

## 🤝 Contributing

We love contributions!
1.  Clone the repo: `git clone https://github.com/sirrryasir/mongoose-studio`
2.  Install deps: `bun install`
3.  Run dev: `bun run dev`

## 📄 License

MIT © Yasir
