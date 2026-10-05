import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/server";
import fs from "fs/promises";
import path from "path";
const PROJECT_ROOT = path.resolve("..");
export function registerFilesystemTools(server) {
    server.registerTool("list_directory", {
        description: "List files and directories inside the project",
        inputSchema: z.object({
            path: z.string().default(".")
        })
    }, async ({ path: requestedPath }) => {
        const fullPath = path.resolve(PROJECT_ROOT, requestedPath);
        const entries = await fs.readdir(fullPath, {
            withFileTypes: true
        });
        const result = entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory()
                ? "directory"
                : "file"
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    });
}
//# sourceMappingURL=filesystem.js.map