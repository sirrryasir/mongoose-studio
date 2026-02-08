
import path from "path";
import fs from "fs";
import { glob } from "glob";
import { CONFIG } from "../config";

export async function loadLocalModels(modelsPath: string): Promise<{ loaded: string[], errors: string[] }> {
    const results = {
        loaded: [] as string[],
        errors: [] as string[]
    };

    if (!fs.existsSync(modelsPath)) {
        if (CONFIG.VERBOSE) console.log(`   \x1b[33m[DEBUG]\x1b[0m Models path does not exist: ${modelsPath}`);
        return results;
    }

    if (CONFIG.VERBOSE) console.log(`   \x1b[33m[DEBUG]\x1b[0m Scanning recursively in: ${modelsPath}`);

    // Use standard glob for recursive scanning
    const files = await glob("**/*.{ts,js}", { cwd: modelsPath });

    for (const file of files) {
        // Skip definition files
        if (file.endsWith(".d.ts")) {
            if (CONFIG.VERBOSE) console.log(`   \x1b[33m[DEBUG]\x1b[0m Skipped definition file: ${file}`);
            continue;
        }

        // Skip strange files like .test.ts or .spec.ts optionally, but for now we keep it simple

        const fullPath = path.join(modelsPath, file);
        if (CONFIG.VERBOSE) console.log(`   \x1b[33m[DEBUG]\x1b[0m Attempting to load: ${file}`);

        try {
            await import(fullPath);
            results.loaded.push(file);
        } catch (err: any) {
            if (CONFIG.VERBOSE) {
                console.error(`   \x1b[31m[DEBUG]\x1b[0m Failed to import ${file}:`);
                console.error(err);
            }
            results.errors.push(`${file}: ${err.message}`);
        }
    }

    return results;
}
