
# Mongoose Studio Quickstart

## Installation

You can run Mongoose Studio directly in any project (no global install needed if you just clone it), or integrate it.

### Prerequisites
- **Bun** (v1.0+)
- **MongoDB** (Local or Atlas)

## Running the Studio

1. **Navigate to the studio directory**:
   ```bash
   cd mongoose-studio
   ```

2. **Run the all-in-one command**:
   ```bash
   bun bin/index.ts
   ```

This will:
- Connect to the DB defined in `.env`.
- Start the API Server on port `5555`.
- Start the Web UI on port `5556`.
- Open your browser to `http://localhost:5556`.

## Configuration

You can override defaults using CLI flags:

- **Change API Port**:
  ```bash
  bun bin/index.ts --port=8000
  ```

- **Reset/Seed Database**:
  ```bash
  bun bin/index.ts --seed
  ```
