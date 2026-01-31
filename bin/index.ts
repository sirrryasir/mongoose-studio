#!/usr/bin/env bun
import path from "path";
import { existsSync, readdirSync } from "fs";
import { loadLocalModels } from "../src/loader";
import { setMongoose, getMongoose } from "../src/db";
import { startServer } from "../src/server";
import { CONFIG } from "../config";
import { inspectModel } from "../src/inspector";

async function main() {
    // Check for Help
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
        console.log(`
\x1b[36m
  __  __                                            
 |  \\/  | ___  _ __   __ _  ___  ___  ___  ___    
 | |\\/| |/ _ \\| '_ \\ / _\` |/ _ \\/ _ \\/ __|/ _ \\   
 | |  | | (_) | | | | (_| | (_) | (_) \\__ \\  __/   
 |_|  |_|\\___/|_| |_|\\__, |\\___/ \\___/|___/\\___|   
                     |___/                         
      ____  _             _ _       
     / ___|| |_ _   _  __| (_) ___  
     \\___ \\| __| | | |/ _\` | |/ _ \\ 
      ___) | |_| |_| | (_| | | (_) |
     |____/ \\__|\\__,_|\\__,_|_|\\___/ 
                                    
\x1b[0m
Usage: mongoose-studio [options]

Options:
  --port=<number>    Specify the port to run on (default: 5555)
  --uri=<string>     MongoDB connection URI
  --models=<path>    Path to models directory (optional override)
  --help, -h         Show this help message
        `);
        process.exit(0);
    }

    console.log("\n\x1b[36mStarting Mongoose Studio...\x1b[0m\n");

    const projectRoot = process.cwd();
    // Try to find user's mongoose
    const userMongoosePath = path.join(projectRoot, "node_modules", "mongoose");

    if (existsSync(userMongoosePath)) {
        try {
            // Dynamic import of user's mongoose
            const userMongoose = await import(userMongoosePath);
            // Handle ESM/CommonJS default export difference
            setMongoose(userMongoose.default || userMongoose);
            console.log("   \x1b[32m✔\x1b[0m Mongoose detected (User Project).");
        } catch (e) {
            console.error("   \x1b[31m✖\x1b[0m Failed to load project's Mongoose instance:", e);
            console.warn("   Falling back to internal Mongoose (models might not load correctly).");
            console.log("   \x1b[36mRead more: https://mongoose-studio.yaasir.dev/docs#mongoose-not-found\x1b[0m");
        }
    } else {
        console.warn("   \x1b[33m⚠\x1b[0m Mongoose not found in project. Falling back to internal instance.");
        console.log("   \x1b[36mRead more: https://mongoose-studio.yaasir.dev/docs#mongoose-not-found\x1b[0m");
    }

    // Now we can use getMongoose() to interact
    const mongoose = getMongoose();

    // Load Models
    // Priority: Command Line > src/models > models > lib/models
    const manualModelsDir = process.argv.find(arg => arg.startsWith("--models="))?.split("=")[1];

    let modelsPath = "";
    if (manualModelsDir) {
        modelsPath = path.resolve(projectRoot, manualModelsDir);
    } else {
        const candidates = ["src/models", "models", "lib/models", "dist/models"];
        for (const candidate of candidates) {
            const tempPath = path.join(projectRoot, candidate);
            if (existsSync(tempPath)) {
                modelsPath = tempPath;
                break;
            }
        }
    }

    if (modelsPath && existsSync(modelsPath)) {
        console.log(`   Scanning models in: \x1b[2m${modelsPath}\x1b[0m`);
        const { loaded, errors } = await loadLocalModels(modelsPath);

        loaded.forEach(file => console.log(`   \x1b[32m✔\x1b[0m Loaded: ${file}`));
        errors.forEach(err => console.error(`   \x1b[31m✖\x1b[0m Error: ${err}`));
    } else if (manualModelsDir) {
        console.error(`   \x1b[31m✖\x1b[0m Error: The specified models directory '${manualModelsDir}' was not found.`);
        console.log("   \x1b[36mRead more: https://mongoose-studio.yaasir.dev/docs#models-directory-not-found\x1b[0m");
    } else if (mongoose.modelNames().length === 0) {
        console.warn("   \x1b[33m⚠\x1b[0m Hint: No 'models/' or 'src/models/' directory found. If your models are elsewhere, use --models=path/to/models");
        console.log("   \x1b[36mRead more: https://mongoose-studio.yaasir.dev/docs#no-mongoose-models-registered\x1b[0m");
    }

    // Introspect
    const modelNames = mongoose.modelNames();
    console.log("\nSummary:");

    if (modelNames.length === 0) {
        console.warn("   No Mongoose models registered.");
    } else {
        console.log(`   Registered Models (${modelNames.length}):`);
        // ... (logging models if needed, keeping it minimal for now)
    }

    // Connect to MongoDB
    const uriArg = process.argv.find(arg => arg.startsWith("--uri="));
    const uri = (uriArg && uriArg.split("=")[1]) || process.env.MONGO_URI || "mongodb://localhost:27017/test";

    console.log(`\nConnecting to MongoDB...`);
    try {
        await mongoose.connect(uri);
        console.log("   \x1b[32m✔\x1b[0m Connected successfully.");
    } catch (err: any) {
        console.error("   \x1b[31m✖\x1b[0m Connection failed:", err.message);
        console.warn("   Studio will run in Schema Inspection mode only. Data features will be disabled.");
    }

    // Start Server (API + UI)
    // imports valid statically

    // Allow override via --port
    const portArg = process.argv.find(arg => arg.startsWith("--port="));
    let port = (portArg && parseInt(portArg.split("=")[1])) || CONFIG.API_PORT;

    // Retry finding port
    const maxRetries = 10;
    let serverStarted = false;

    for (let i = 0; i < maxRetries; i++) {
        try {
            Bun.serve(startServer(port, mongoose));
            serverStarted = true;
            break;
        } catch (err: any) {
            if (err.code === "EADDRINUSE" || err.message.includes("EADDRINUSE") || err.message.includes("address already in use")) {
                console.log(`   Port ${port} is busy, trying ${port + 1}...`);
                port++;
            } else {
                throw err;
            }
        }
    }

    if (!serverStarted) {
        console.error(`\n\x1b[31m✖\x1b[0m Failed to start server after ${maxRetries} attempts. Please specify a free port using --port=NUMBER`);
        process.exit(1);
    }

    console.log(`\n\x1b[36mStudio running at http://localhost:${port}\x1b[0m`);

    // Open Browser
    setTimeout(() => {
        const url = `http://localhost:${port}`;
        // Print usage instructions clearly, useful for Docker logs
        console.log(`\nTo access Mongoose Studio, open:\n\x1b[4m${url}\x1b[0m\n`);

        const openCmd = process.platform === "darwin" ? "open" :
            process.platform === "linux" ? "xdg-open" : "start";

        try {
            if (!process.env.NO_OPEN) {
                Bun.spawn([openCmd, url], {
                    stderr: "ignore",
                    stdout: "ignore"
                }).unref();
            }
        } catch (e) {
            // Ignore failure to open browser (common in Docker/Servers)
        }
    }, 1000);

    console.log(`Press Ctrl+C to stop.`);

    process.on("SIGINT", () => {
        console.log("\nStopping Studio...");
        process.exit();
    });
}

main().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
