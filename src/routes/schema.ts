import { Hono } from "hono";
import { inspectModel } from "../inspector";
import { getMongoose } from "../db";

const schema = new Hono();

schema.get("/", (c) => {
    const mongoose = getMongoose();
    if (!mongoose) return c.json({ error: "Mongoose missing" }, 500);
    // Sort models alphabetically for better UX
    const models = mongoose.modelNames().sort();
    return c.json({ models });
});

schema.get("/:name", (c) => {
    const mongoose = getMongoose();
    const name = c.req.param("name");
    try {
        const fields = inspectModel(name, mongoose);
        return c.json({ model: name, fields });
    } catch (err: any) {
        return c.json({ error: err.message }, 404);
    }
});

export default schema;
