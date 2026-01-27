
import { describe, it, expect } from "bun:test";
import mongoose from "mongoose";
import { inspectModel } from "../src/inspector";

describe("Inspector Logic", () => {

    // Define a dummy model for testing
    const TestSchema = new mongoose.Schema({
        name: { type: String, required: true },
        age: { type: Number, default: 25 },
        active: Boolean
    });

    // Register if not exists
    const TestModel = mongoose.models.TestInspector || mongoose.model("TestInspector", TestSchema);

    it("should extract fields correctly", () => {
        const fields = inspectModel("TestInspector");

        expect(fields).toBeArray();
        expect(fields.length).toBeGreaterThan(0);

        const nameField = fields.find(f => f.path === "name");
        expect(nameField).toBeDefined();
        expect(nameField?.type).toBe("String");
        expect(nameField?.required).toBe(true);

        const ageField = fields.find(f => f.path === "age");
        expect(ageField?.default).toBe(25);
    });
});
