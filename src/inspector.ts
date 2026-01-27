import type { Mongoose } from "mongoose";

export interface FieldInfo {
    path: string;
    type: string;
    required: boolean;
    default?: any;
    ref?: string;
}

export function inspectModel(modelName: string, mongoose: Mongoose): FieldInfo[] {
    const model = mongoose.models[modelName];
    if (!model) {
        throw new Error(`Model '${modelName}' not found in mongoose registry.`);
    }

    const paths = model.schema.paths;
    const fields: FieldInfo[] = [];

    for (const key in paths) {
        if (key === "__v") continue; // Skip version key

        const pathType: any = paths[key];
        const info: FieldInfo = {
            path: key,
            type: pathType.instance,
            required: !!pathType.isRequired,
        };

        // Check for default value
        if (pathType.defaultValue !== undefined) {
            // Handle functions as defaults (common in existing mongoose schemas)
            info.default = typeof pathType.defaultValue === 'function' ? '[Function]' : pathType.defaultValue;
        }

        // Check for refs (relationships)
        if (pathType.options && pathType.options.ref) {
            info.ref = pathType.options.ref;
        }

        fields.push(info);
    }

    return fields;
}
