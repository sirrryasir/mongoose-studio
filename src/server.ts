import { Hono } from "hono";
import type { Mongoose } from "mongoose";
import path from "path";
import fs from "fs";
import mime from "mime-types";

// Import Routes
import schemaRoutes from "./routes/schema";
import modelRoutes from "./routes/models";
import seedRoutes from "./routes/seed";

export function startServer(port: number = 3000, mongoose: Mongoose, readOnly: boolean = false) {
    const app = new Hono();

    // CORS
    app.use("*", async (c, next) => {
        c.header("Access-Control-Allow-Origin", "*");
        c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        c.header("Access-Control-Allow-Headers", "Content-Type");
        if (c.req.method === "OPTIONS") {
            return c.text("OK", 204);
        }
        await next();
    });

    // Read-Only Middleware
    app.use("/api/models/*", async (c, next) => {
        if (readOnly && ["POST", "PUT", "DELETE", "PATCH"].includes(c.req.method)) {
            // Allow seed if needed? Probably not in readonly mode.
            return c.json({ error: "Mongoose Studio is in Read-Only mode." }, 403);
        }
        await next();
    });

    app.get("/api/health", (c) => c.json({ status: "ok" }));
    app.get("/api/config", (c) => c.json({ readOnly }));

    // Mount Routes
    app.route("/api/models", schemaRoutes); // GET /api/models, GET /api/models/:name
    app.route("/api/models", modelRoutes);  // GET /api/models/:name/data, POST, PUT, DELETE
    app.route("/api/models", seedRoutes);   // POST /api/models/:name/seed

    // Serve Static UI
    app.get("/*", async (c) => {
        const url = new URL(c.req.url);
        let pathString = url.pathname;
        if (pathString === "/" || pathString === "") pathString = "/index.html";

        const currentDir = path.dirname(new URL(import.meta.url).pathname);
        // Robust way to find UI assets whether running from src or dist
        const uiDir = currentDir.endsWith("src")
            ? path.join(currentDir, "../ui/out") // Dev mode (ts-node/tsx)
            : currentDir.endsWith("dist")
                ? path.join(currentDir, "ui") // Prod mode (dist structure)
                : path.join(currentDir, "../dist/ui");

        const filePath = path.join(uiDir, pathString);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const mimeType = mime.lookup(filePath) || "application/octet-stream";
            return c.body(fs.createReadStream(filePath) as any, 200, {
                "Content-Type": mimeType
            });
        }

        // Fallback for SPA routing
        const index = path.join(uiDir, "index.html");
        if (fs.existsSync(index)) {
            return c.body(fs.createReadStream(index) as any, 200, {
                "Content-Type": "text/html"
            });
        }

        return c.text("UI not found. Please run build.", 404);
    });

    return app;
}
