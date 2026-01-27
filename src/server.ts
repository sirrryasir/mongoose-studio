import { Hono } from "hono";
import type { Mongoose } from "mongoose";
import path from "path";
import { inspectModel } from "./inspector";

export function startServer(port: number = 3000, mongoose: Mongoose) {
    const app = new Hono();

    // CORS - allowing all for local dev tool convenience
    app.use("*", async (c, next) => {
        c.header("Access-Control-Allow-Origin", "*");
        c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        c.header("Access-Control-Allow-Headers", "Content-Type");
        await next();
    });

    // Serve Static UI
    app.get("/api/health", (c) => c.json({ status: "ok" }));

    app.get("/api/models", (c) => {
        if (!mongoose) {
            console.error("CRITICAL: Mongoose instance is undefined in /api/models!");
            return c.json({ error: "Server Configuration Error: Mongoose missing" }, 500);
        }
        try {
            const models = mongoose.modelNames();
            return c.json({ models });
        } catch (e: any) {
            console.error("CRITICAL: Error getting modelNames:", e);
            return c.json({ error: e.message }, 500);
        }
    });

    app.get("/api/models/:name", (c) => {
        const name = c.req.param("name");
        try {
            const fields = inspectModel(name, mongoose);
            return c.json({ model: name, fields });
        } catch (err: any) {
            return c.json({ error: err.message }, 404);
        }
    });

    app.get("/api/models/:name/data", async (c) => {
        const name = c.req.param("name");
        const limit = Number(c.req.query("limit")) || 50;
        const page = Number(c.req.query("page")) || 1;

        try {
            const model = mongoose.models[name];
            if (!model) throw new Error("Model not found");

            const docs = await model.find().limit(limit).skip((page - 1) * limit).lean();
            const total = await model.countDocuments();

            return c.json({
                docs,
                meta: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (err: any) {
            return c.json({ error: err.message }, 500);
        }
    });

    // Serve Static UI (Moved to end to avoid blocking API routes)
    app.get("/*", async (c) => {
        const url = new URL(c.req.url);
        let pathString = url.pathname;
        if (pathString === "/" || pathString === "") pathString = "/index.html";

        const uiDir = import.meta.dir.endsWith("dist")
            ? path.join(import.meta.dir, "ui")
            : path.join(import.meta.dir, "../dist/ui");

        const filePath = path.join(uiDir, pathString);

        const file = Bun.file(filePath);

        if (await file.exists()) {
            return new Response(file);
        }

        const index = Bun.file(path.join(uiDir, "index.html"));
        if (await index.exists()) {
            return new Response(index);
        }

        return c.text("UI not found. Please run build.", 404);
    });

    return {
        port,
        fetch: app.fetch,
    };
}
