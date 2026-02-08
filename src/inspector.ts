import type { Mongoose, SchemaType } from "mongoose";

export interface FieldInfo {
    path: string;
    type: string;
    required: boolean;
    default?: unknown;
    ref?: string;
    enum?: string[];
    min?: number;
    max?: number;
    match?: string;
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

        // Cast to any because Mongoose SchemaType types are complex and vary by version
        const pathType = paths[key] as any;

        const info: FieldInfo = {
            path: key,
            type: pathType.instance,
            required: !!pathType.isRequired,
        };

        // Check for default value
        if (pathType.defaultValue !== undefined) {
            info.default = typeof pathType.defaultValue === 'function' ? '[Function]' : pathType.defaultValue;
        }

        // Check for options
        if (pathType.options) {
            if (pathType.options.ref) info.ref = pathType.options.ref;
            if (pathType.options.enum) info.enum = pathType.options.enum;
            if (pathType.options.min !== undefined) info.min = pathType.options.min;
            if (pathType.options.max !== undefined) info.max = pathType.options.max;
            // Handle match (regex) - tricky to serialize but we can try string
            if (pathType.options.match) info.match = pathType.options.match.toString();
        }

        // Also check validators array for min/max/enum if not in options directly
        if (pathType.validators) {
            pathType.validators.forEach((v: { type: string, min?: number, max?: number, enumValues?: string[] }) => {
                if (v.type === 'min') info.min = v.min;
                if (v.type === 'max') info.max = v.max;
                if (v.type === 'enum') info.enum = v.enumValues;
            });
        }

        fields.push(info);
    }

    return fields;
}
