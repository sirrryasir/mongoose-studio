
import path from "path";
import fs from "fs";

export async function loadLocalModels(modelsPath: string): Promise<{ loaded: string[], errors: string[] }> {
    const results = {
        loaded: [] as string[],
        errors: [] as string[]
    };

    if (!fs.existsSync(modelsPath)) {
        return results;
    }

    // Use Bun's native Glob for recursive scanning
    const glob = new Bun.Glob("**/*.{ts,js}");

    for await (const file of glob.scan({ cwd: modelsPath })) {
        // Skip definition files
        if (file.endsWith(".d.ts")) continue;

        const fullPath = path.join(modelsPath, file);
        try {
            await import(fullPath);
            results.loaded.push(file);
        } catch (err: any) {
            results.errors.push(`${file}: ${err.message}`);
        }
    }

    return results;
}
