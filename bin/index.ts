#!/usr/bin/env bun
import path from "path";
import { existsSync, readdirSync } from "fs";
import { loadLocalModels } from "../src/loader";
import { setMongoose, getMongoose } from "../src/db";
import { startServer } from "../src/server";
import { CONFIG } from "../config";
import { inspectModel } from "../src/inspector";

async function main() {
    console.log("Mongoose Studio is starting...");

    const projectRoot = process.cwd();
    // Try to find user's mongoose
    const userMongoosePath = path.join(projectRoot, "node_modules", "mongoose");

    if (existsSync(userMongoosePath)) {
        try {
            // Dynamic import of user's mongoose
            const userMongoose = await import(userMongoosePath);
            // Handle ESM/CommonJS default export difference
            setMongoose(userMongoose.default || userMongoose);
            console.log("Mongoose detected (User Project).");
        } catch (e) {
            console.error("Failed to load project's Mongoose instance:", e);
            console.warn("Falling back to internal Mongoose (models might not load correctly).");
        }
    } else {
        console.warn("Mongoose not found in project. Falling back to internal instance.");
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
        console.log("Scanning models in:", modelsPath);
        const { loaded, errors } = await loadLocalModels(modelsPath);

        loaded.forEach(file => console.log(`   Loaded: ${file}`));
        errors.forEach(err => console.error(`   Error: ${err}`));
    } else if (manualModelsDir) {
        console.error(`Error: The specified models directory '${manualModelsDir}' was not found.`);
    } else if (modelNames.length === 0) {
        console.warn("Hint: No 'models/' or 'src/models/' directory found. If your models are elsewhere, use --models=path/to/models");
    }

    // Introspect
    const modelNames = mongoose.modelNames();
    console.log("\nSummary:");

    if (modelNames.length === 0) {
        console.warn("   No Mongoose models registered.");
    } else {
        console.log(`   Registered Models (${modelNames.length}):`);

        for (const name of modelNames) {
            console.log(`\n   Model: ${name}`);
            try {
                const fields = inspectModel(name, mongoose);

                const tableData = fields.map(f => ({
                    Field: f.path,
                    Type: f.type,
                    Required: f.required ? "YES" : "no",
                    Default: f.default !== undefined ? String(f.default) : "-",
                    Ref: f.ref || "-"
                }));

                console.table(tableData);
            } catch (err: any) {
                console.error(`      Could not inspect ${name}: ${err.message}`);
            }
        }
    }

    // Connect to MongoDB
    const uriArg = process.argv.find(arg => arg.startsWith("--uri="));
    const uri = (uriArg && uriArg.split("=")[1]) || process.env.MONGO_URI || "mongodb://localhost:27017/test";

    console.log(`\nConnecting to MongoDB...`);
    try {
        await mongoose.connect(uri);
        console.log("   Connected successfully.");
    } catch (err: any) {
        console.error("   Connection failed:", err.message);
        console.warn("   Studio will run in Schema Inspection mode only. Data features will be disabled.");
    }

    // Start Server (API + UI)
    // imports valid statically

    // Allow override via --port
    const portArg = process.argv.find(arg => arg.startsWith("--port="));
    const port = (portArg && parseInt(portArg.split("=")[1])) || CONFIG.API_PORT;

    // We only need ONE server now
    // startServer is imported statically

    try {
        Bun.serve(startServer(port, mongoose));
        console.log(`\nStudio running at http://localhost:${port}`);
    } catch (err: any) {
        console.error(`Failed to start server on port ${port}:`, err.message);
        process.exit(1);
    }

    // Open Browser
    setTimeout(() => {
        const url = `http://localhost:${port}`;
        // Print usage instructions clearly, useful for Docker logs
        console.log(`\nTo access Mongoose Studio, open:\n${url}\n`);

        const openCmd = process.platform === "darwin" ? "open" :
            process.platform === "linux" ? "xdg-open" : "start";

        try {
            Bun.spawn([openCmd, url], {
                stderr: "ignore",
                stdout: "ignore"
            }).unref();
        } catch (e) {
            // Ignore failure to open browser (common in Docker/Servers)
        }
    }, 1000);

    console.log(`\nPress Ctrl+C to stop.`);

    process.on("SIGINT", () => {
        console.log("\nStopping Studio...");
        process.exit();
    });
}

main().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
