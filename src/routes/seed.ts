import { Hono } from "hono";
import { getMongoose } from "../db";

const seed = new Hono();

seed.post("/:name/seed", async (c) => {
    const name = c.req.param("name");
    const mongoose = getMongoose();

    try {
        // Dynamic import to keep startup fast and bundle size optimized
        const { faker } = await import("@faker-js/faker");

        const { count } = await c.req.json();
        const num = Math.min(Math.max(Number(count) || 1, 1), 100);
        const model = mongoose.models[name];

        if (!model) return c.json({ error: `Model '${name}' not found` }, 404);

        const docs = [];
        // Pre-fetch relation pools
        const refPools: Record<string, any[]> = {};
        const paths = Object.keys(model.schema.paths);

        // Identify ref fields and fetch samples
        for (const path of paths) {
            const schemaType: any = model.schema.paths[path];
            if (schemaType.instance === 'ObjectID' && schemaType.options?.ref) {
                try {
                    const refModel = mongoose.model(schemaType.options.ref);
                    // Fetch up to 100 random IDs to pick from
                    const samples = await refModel.aggregate([{ $sample: { size: 100 } }, { $project: { _id: 1 } }]);
                    if (samples.length) {
                        refPools[path] = samples.map(s => s._id);
                    }
                } catch {
                    // Ignore if ref model not found or empty
                }
            }
        }

        for (let i = 0; i < num; i++) {
            const doc: any = {};

            model.schema.eachPath((path, schemaType: any) => {
                // internal fields
                if (path === "_id" || path === "__v") return;

                // Handle Enums
                if (schemaType.options?.enum) {
                    const enums = Array.isArray(schemaType.options.enum) ? schemaType.options.enum : schemaType.options.enum.values;
                    if (enums && enums.length) {
                        doc[path] = faker.helpers.arrayElement(enums);
                        return;
                    }
                }

                const instance = schemaType.instance;

                if (instance === 'String') {
                    const lowerPath = path.toLowerCase();
                    if (lowerPath.includes('email')) doc[path] = faker.internet.email();
                    else if (lowerPath.includes('name')) doc[path] = faker.person.fullName();
                    else if (lowerPath.includes('phone')) doc[path] = faker.phone.number();
                    else if (lowerPath.includes('avatar') || lowerPath.includes('image') || lowerPath.includes('photo')) doc[path] = faker.image.avatar();
                    else if (lowerPath.includes('city')) doc[path] = faker.location.city();
                    else if (lowerPath.includes('address')) doc[path] = faker.location.streetAddress();
                    else if (lowerPath.includes('bio') || lowerPath.includes('desc')) doc[path] = faker.lorem.sentence();
                    else doc[path] = faker.word.words(2);
                } else if (instance === 'Number') {
                    doc[path] = faker.number.int({ min: 0, max: 100 });
                } else if (instance === 'Boolean') {
                    doc[path] = faker.datatype.boolean();
                } else if (instance === 'Date') {
                    doc[path] = faker.date.recent();
                } else if (instance === 'ObjectID') {
                    if (refPools[path]) {
                        doc[path] = faker.helpers.arrayElement(refPools[path]);
                    }
                }
            });
            docs.push(doc);
        }

        // Use insertMany for efficiency, but note: validation is bypassed by default in some versions unless ordered=false or options set
        // but here we just want raw data primarily.
        await model.insertMany(docs);
        return c.json({ success: true, count: docs.length });
    } catch (err: any) {
        console.error("Seed error:", err);
        return c.json({ error: err.message }, 500);
    }
});

export default seed;
