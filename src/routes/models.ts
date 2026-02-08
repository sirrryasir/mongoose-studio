import { Hono } from "hono";
import { stream } from "hono/streaming";
import { getMongoose } from "../db";

const models = new Hono();

// Helper to get model safely
const getModel = (name: string) => {
    const mongoose = getMongoose();
    const model = mongoose.models[name];
    if (!model) throw new Error(`Model '${name}' not found`);
    return model;
};

// Sanitize Query to prevent NoSQL Injection
const sanitizeQuery = (query: any): any => {
    if (!query || typeof query !== 'object') return query;

    if (Array.isArray(query)) {
        return query.map(sanitizeQuery);
    }

    const sanitized: any = {};
    for (const key in query) {
        if (key.startsWith('$')) {
            // Whitelist allowed operators
            const allowed = [
                '$eq', '$gt', '$gte', '$lt', '$lte',
                '$in', '$nin', '$ne', '$regex', '$options',
                '$exists', '$all', '$size', '$or', '$and', '$not'
            ];
            if (!allowed.includes(key)) {
                // Strip dangerous operators (e.g. $where, $expr)
                continue;
            }
        }
        sanitized[key] = sanitizeQuery(query[key]);
    }
    return sanitized;
};

// GET /:name/data
models.get("/:name/data", async (c) => {
    const name = c.req.param("name");
    const limit = Math.min(Number(c.req.query("limit")) || 50, 500); // Cap limit at 500
    const page = Math.max(Number(c.req.query("page")) || 1, 1);
    const queryStr = c.req.query("query");
    const sortParam = c.req.query("sort") || "_id:-1";
    const parts = sortParam.split(":");
    const sortField = parts[0] || "_id";
    const sortOrder = parseInt(parts[1] || "-1");
    const sort = { [sortField]: sortOrder } as any;

    let query = {};

    if (queryStr && queryStr.trim() !== "") {
        try {
            const parsed = JSON.parse(queryStr);
            query = sanitizeQuery(parsed);
        } catch (e) {
            return c.json({ error: "Invalid JSON in query filter" }, 400);
        }
    }

    try {
        const model = getModel(name);
        // Use estimatedDocumentCount for speed if no query, otherwise countDocuments
        const total = Object.keys(query).length === 0
            ? await model.estimatedDocumentCount()
            : await model.countDocuments(query);

        const docs = await model.find(query)
            .sort(sort)
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();

        return c.json({
            docs,
            meta: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// POST /:name
models.post("/:name", async (c) => {
    const name = c.req.param("name");
    try {
        const body = await c.req.json();
        const model = getModel(name);
        const doc = await model.create(body);
        return c.json({ doc }, 201);
    } catch (err: any) {
        return c.json({ error: err.message }, 400);
    }
});

// GET /:name/export
models.get("/:name/export", async (c) => {
    const name = c.req.param("name");
    const format = c.req.query("format") || "json";

    try {
        const model = getModel(name);
        // Use cursor for memory efficiency with large exports
        const cursor = model.find().cursor();

        if (format === "csv") {
            c.header("Content-Type", "text/csv");
            c.header("Content-Disposition", `attachment; filename=${name}.csv`);

            return stream(c, async (stream) => {
                // Get all paths except internal version key
                const headers = Object.keys(model.schema.paths).filter(p => p !== '__v');
                await stream.write(headers.join(",") + "\n");

                for await (const doc of cursor) {
                    const row = headers.map(h => {
                        const val = (doc as any)[h];
                        if (val === undefined || val === null) return "";
                        // Basic CSV escaping
                        const strInfo = JSON.stringify(val);
                        return strInfo;
                    }).join(",");
                    await stream.write(row + "\n");
                }
            });
        }

        // JSON Stream
        c.header("Content-Type", "application/json");
        c.header("Content-Disposition", `attachment; filename=${name}.json`);

        return stream(c, async (stream) => {
            await stream.write("[");
            let isFirst = true;
            for await (const doc of cursor) {
                if (!isFirst) {
                    await stream.write(",");
                }
                await stream.write(JSON.stringify(doc));
                isFirst = false;
            }
            await stream.write("]");
        });

    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// POST /:name/aggregate
models.post("/:name/aggregate", async (c) => {
    const name = c.req.param("name");
    try {
        const pipeline = await c.req.json();
        if (!Array.isArray(pipeline)) {
            return c.json({ error: "Pipeline must be an array" }, 400);
        }

        const model = getModel(name);
        // Trust developer but limit output size
        const docs = await model.aggregate(pipeline).limit(200);

        return c.json({ docs });
    } catch (err: any) {
        return c.json({ error: err.message }, 400);
    }
});

// GET /:name/:id
models.get("/:name/:id", async (c) => {
    const name = c.req.param("name");
    const id = c.req.param("id");

    try {
        const model = getModel(name);
        const doc = await model.findById(id);
        if (!doc) return c.json({ error: "Document not found" }, 404);
        return c.json({ doc });
    } catch (err: any) {
        return c.json({ error: err.message }, 400);
    }
});

// PUT /:name/:id
models.put("/:name/:id", async (c) => {
    const name = c.req.param("name");
    const id = c.req.param("id");

    try {
        const body = await c.req.json();
        const model = getModel(name);

        // Validation run is crucial for data integrity
        const doc = await model.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!doc) return c.json({ error: "Document not found" }, 404);
        return c.json({ doc });
    } catch (err: any) {
        return c.json({ error: err.message }, 400);
    }
});

// DELETE /:name/:id
models.delete("/:name/:id", async (c) => {
    const name = c.req.param("name");
    const id = c.req.param("id");

    try {
        const model = getModel(name);
        const doc = await model.findByIdAndDelete(id);
        if (!doc) return c.json({ error: "Document not found" }, 404);
        return c.json({ success: true, id });
    } catch (err: any) {
        return c.json({ error: err.message }, 400);
    }
});

// GET /:name/export
models.get("/:name/export", async (c) => {
    const name = c.req.param("name");
    const format = c.req.query("format") || "json";

    try {
        const model = getModel(name);
        // Use cursor for memory efficiency with large exports
        const cursor = model.find().cursor();

        if (format === "csv") {
            c.header("Content-Type", "text/csv");
            c.header("Content-Disposition", `attachment; filename=${name}.csv`);

            return stream(c, async (stream) => {
                // Get all paths except internal version key
                const headers = Object.keys(model.schema.paths).filter(p => p !== '__v');
                await stream.write(headers.join(",") + "\n");

                for await (const doc of cursor) {
                    const row = headers.map(h => {
                        const val = (doc as any)[h];
                        if (val === undefined || val === null) return "";
                        // Basic CSV escaping
                        const strInfo = JSON.stringify(val);
                        return strInfo;
                    }).join(",");
                    await stream.write(row + "\n");
                }
            });
        }

        // JSON Stream
        c.header("Content-Type", "application/json");
        c.header("Content-Disposition", `attachment; filename=${name}.json`);

        return stream(c, async (stream) => {
            await stream.write("[");
            let isFirst = true;
            for await (const doc of cursor) {
                if (!isFirst) {
                    await stream.write(",");
                }
                await stream.write(JSON.stringify(doc));
                isFirst = false;
            }
            await stream.write("]");
        });

    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// POST /:name/aggregate
models.post("/:name/aggregate", async (c) => {
    const name = c.req.param("name");
    try {
        const pipeline = await c.req.json();
        if (!Array.isArray(pipeline)) {
            return c.json({ error: "Pipeline must be an array" }, 400);
        }

        const model = getModel(name);
        // Trust developer but limit output size
        const docs = await model.aggregate(pipeline).limit(200);

        return c.json({ docs });
    } catch (err: any) {
        return c.json({ error: err.message }, 400);
    }
});

export default models;
