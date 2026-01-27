
import type { Mongoose } from "mongoose";

let mongooseInstance: Mongoose | null = null;

// Default import for fallback types, but we prefer the injected instance
import * as defaultMongoose from "mongoose";

export function setMongoose(instance: any) {
    mongooseInstance = instance;
}

export function getMongoose(): Mongoose {
    if (!mongooseInstance) {
        // Fallback to local mongoose if not set (e.g. in tests or dev)
        // But in production CLI usage, this should be set by bin/index.ts
        return defaultMongoose as unknown as Mongoose;
    }
    return mongooseInstance;
}
