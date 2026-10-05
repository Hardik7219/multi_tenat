import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { registerFilesystemTools } from "./tools/filesystem.js";
const server = new McpServer({
    name: "multi-tenat-dev",
    version: "1.0.0"
});
registerFilesystemTools(server);
serveStdio(() => server);
console.error("mcp server started");
//# sourceMappingURL=index.js.map