#!/usr/bin/env node
import path from "path";
import { existsSync } from "fs";
import { Command } from "commander";
import { loadLocalModels } from "../src/loader";
import { setMongoose, getMongoose } from "../src/db";
import { startServer } from "../src/server";
import { CONFIG } from "../config";
import { serve } from "@hono/node-server";
import open from "open";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
    .name("mongoose-studio")
    .description(pkg.description)
    .version(pkg.version)
    .option("-p, --port <number>", "Specify the port to run on", String(CONFIG.DEFAULT_PORT))
    .option("-u, --uri <string>", "MongoDB connection URI")
    .option("-m, --models <path>", "Path to models directory (optional override)")
    .option("--readonly", "Enable read-only mode (disable editing)")
    .option("--verbose", "Enable verbose logging")
    .action(async (options) => {
        await main(options);
    });

program.parse();

interface CLIOptions {
    port: string;
    uri?: string;
    models?: string;
    readonly?: boolean;
    verbose?: boolean;
}

async function main(options: CLIOptions) {
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
                                    
\x1b[0m`);
    console.log(`\x1b[36mv${pkg.version}\x1b[0m\n`);
    console.log("\x1b[36mStarting Mongoose Studio...\x1b[0m\n");

    // Verbose Mode
    if (options.verbose) {
        CONFIG.VERBOSE = true;
        console.log("   \x1b[33m[VERBOSE MODE ENABLED]\x1b[0m");
    }

    // Read-Only Mode
    if (options.readonly) {
        CONFIG.READ_ONLY = true;
        console.log("   \x1b[33m[READ-ONLY MODE ENABLED]\x1b[0m");
    }

    // Check for Updates (Non-blocking)
    checkForUpdates(pkg.version);

    const projectRoot = process.cwd();
    const userMongoosePath = path.join(projectRoot, "node_modules", "mongoose");

    if (existsSync(userMongoosePath)) {
        try {
            // Dynamic import of user's mongoose
            const userMongoose = await import(userMongoosePath);
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

    const mongoose = getMongoose();

    const manualModelsDir = options.models; // From commander

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

    // Connect to MongoDB
    const uriRaw = options.uri || process.env.MONGO_URI || "mongodb://localhost:27017/test";
    const uri = uriRaw as string;

    console.log(`\nConnecting to MongoDB...`);

    let connected = false;
    const maxConnectRetries = 5;

    for (let i = 0; i < maxConnectRetries; i++) {
        try {
            await mongoose.connect(uri);
            console.log("   \x1b[32m✔\x1b[0m Connected successfully.");
            connected = true;
            break;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (i < maxConnectRetries - 1) {
                console.log(`   \x1b[33m⚠\x1b[0m Connection failed. Retrying in 2s... (${i + 1}/${maxConnectRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error("   \x1b[31m✖\x1b[0m Connection failed:", msg);
                console.warn("   Studio will run in Schema Inspection mode only. Data features will be disabled.");
            }
        }
    }

    // Start Server
    const port = parseInt(options.port) || CONFIG.DEFAULT_PORT;
    const maxRetries = 10;

    // Get Hono App
    const app = startServer(port, mongoose, CONFIG.READ_ONLY);

    const tryListen = (currentPort: number, retries: number) => {
        if (retries === 0) {
            console.error(`\n\x1b[31m✖\x1b[0m Failed to find a free port after ${maxRetries} attempts.`);
            process.exit(1);
        }

        try {
            const server = serve({
                fetch: app.fetch,
                port: currentPort
            });

            server.on('listening', () => {
                const url = `http://localhost:${currentPort}`;
                console.log(`\n\x1b[36mStudio running at ${url}\x1b[0m`);

                setTimeout(() => {
                    console.log(`\nTo access Mongoose Studio, open:\n\x1b[4m${url}\x1b[0m\n`);
                    if (!process.env.NO_OPEN) {
                        open(url).catch(() => { });
                    }
                }, 1000);
            });

            server.on('error', (e: NodeJS.ErrnoException) => {
                if (e.code === 'EADDRINUSE') {
                    console.log(`   Port ${currentPort} is busy, trying ${currentPort + 1}...`);
                    server.close(); // Ensure clean
                    tryListen(currentPort + 1, retries - 1);
                } else {
                    console.error("Server error:", e);
                    process.exit(1);
                }
            });

        } catch (e) {
            // Synchronous error?
            console.error(e);
        }
    };

    tryListen(port, maxRetries);

    console.log(`Press Ctrl+C to stop.`);

    process.on("SIGINT", () => {
        console.log("\nStopping Studio...");
        process.exit();
    });
}

async function checkForUpdates(currentVersion: string) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const res = await fetch("https://registry.npmjs.org/mongoose-studio/latest", {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json() as { version?: string };
            const latestVersion = data.version;
            if (latestVersion && latestVersion !== currentVersion) {
                console.log("\n\x1b[43m\x1b[30m UPDATE AVAILABLE \x1b[0m \x1b[36m" + currentVersion + " \x1b[0m→ \x1b[32m" + latestVersion + "\x1b[0m");
                console.log("Run \x1b[36mnpm i -g mongoose-studio\x1b[0m to update.\n");
            }
        }
    } catch (e) {
        // Ignore
    }
}
