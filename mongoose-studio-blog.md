# Stop Writing Scripts to Inspect Your Database.

If you work with **MongoDB** and **Mongoose**, you know the drill. You define your schemas with care, adding validations, types, and defaults. But when it comes time to actually *look* at your data or verify your schema structure during development, you’re often stuck switching context.

You might open MongoDB Compass, which is great but doesn't know about your Mongoose application logic. Or worse, you write temporary `console.log` scripts just to sanity-check a query.

**It’s time for a better workflow.**

## Introducing Mongoose Studio

[Mongoose Studio](https://github.com/sirrryasir/mongoose-studio) is a new CLI tool designed to bridge the gap between your code and your database. It provides an **instant, zero-configuration GUI** specifically for your Mongoose projects.

Think of it as "Prisma Studio" but built natively for the Mongoose ecosystem.

![Mongoose Studio Logo](https://raw.githubusercontent.com/sirrryasir/mongoose-studio/main/media/mongoose-studio-nobg.png)


### Why You Need This

1.  **Zero Configuration**: purely plug-and-play. You don't need to install a library, configure a dashboard, or set up valid routes.
2.  **Schema Context**: unlike generic DB viewers, Mongoose Studio respects your application code. It visualizes your schemas, types, and defaults exactly as you defined them.
3.  **Safety First**: The tool runs in **Read-Only** mode by default, preventing accidental data modification while you explore production or staging dumps.

## How to Use It

This is the best part. You don't even need to install it as a dependency. Just go to your project root (where your `models` folder lives) and run:

```bash
npx mongoose-studio
```

Or if you prefer Bun:

```bash
bunx mongoose-studio
```

That’s it. Mongoose Studio will:
1.  **Auto-detect** your `models/` directory.
2.  **Read** your `.env` file for the connection string.
3.  **Launch** a local web server (default port 5555).
4.  **Open** the GUI in your browser.

## Key Features

### 🔍 Schema Inspection
Instantly see a breakdown of your enrolled models. Check field types, required flags, and default values without flipping back and forth between multiple VS Code tabs.

### 📊 Data Exploration
View your documents in a clean, tabular format. It’s perfect for quickly verifying that your seed scripts ran correctly or checking the state of your local database after a complex operation.

### 🧠 Smart Defaults
It tries to be smart so you don't have to be verbose. But if you need to point it to a specific database or run it on a different port, it’s fully configurable:

```bash
npx mongoose-studio --port=8080 --uri=mongodb://localhost:27017/my-app
```

## Give It a Spin

Mongoose Studio is open source and built to make your developer experience smoother. Give it a try in your current project!

*   📦 **NPM**: [npmjs.com/package/mongoose-studio](https://www.npmjs.com/package/mongoose-studio)
*   ⭐ **GitHub**: [github.com/sirrryasir/mongoose-studio](https://github.com/sirrryasir/mongoose-studio)

Happy coding! 🚀
