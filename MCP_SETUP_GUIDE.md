# MCP Server Setup & Usage Guide

## What is MCP?
The **Model Context Protocol (MCP)** is a standardized way for AI models (like Claude, Cursor's AI, or ChatGPT) to securely interact with local tools, data sources, and your file system. An MCP Server exposes specific "tools" or "resources" to the AI, allowing it to perform actions on your behalf (e.g., listing directories, reading files, executing commands) in a controlled manner.

## What Was Done
I have configured and fixed the MCP server located in the `mcp` directory of your project:
1. **Dependency Resolution**: Installed required dependencies (`typescript`, `@types/node`, `zod`).
2. **TypeScript Configuration**: Updated `tsconfig.json` to properly compile Node.js modules and output them to the `dist/` directory.
3. **Build Fixes**: Resolved compilation errors related to `fs/promises` and `path` by adding proper Node typings.
4. **Current Capabilities**: The server currently exposes a single tool: `list_directory` (defined in `src/tools/filesystem.ts`), which allows an AI to safely list files and directories within your project.

## How to Build and Run the Server

Navigate to the `mcp` directory:
```bash
cd mcp
```

**1. Install Dependencies (if not already done)**
```bash
npm install
```

**2. Build the Server**
```bash
npm run build
```
This compiles the TypeScript code in `src/` into JavaScript in the `dist/` directory.

**3. Run the Server (Development)**
```bash
npm run dev
```

**4. Run the Server (Production)**
```bash
npm start
```
*Note: The server uses `stdio` for communication, meaning it reads from standard input and writes to standard output. It is designed to be run as a subprocess by an MCP Client, rather than run manually in your terminal.*

## How to Use This with an MCP Client (e.g., Claude Desktop or Cursor)

To allow an AI assistant to use your tools, you must configure the AI client to launch this server.

### Example: Claude Desktop
1. Open Claude Desktop's configuration file:
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`
   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the following configuration to register your local server:
   ```json
   {
     "mcpServers": {
       "multi-tenat-dev": {
         "command": "node",
         "args": [
           "/home/hardik7219/FILES/multi_tenat/mcp/dist/index.js"
         ]
       }
     }
   }
   ```
3. Restart Claude Desktop. You will now see a hammer icon (⚒️) indicating that Claude has access to the `list_directory` tool.

### Adding More Tools
There are placeholder files for `git.ts`, `search.ts`, and `terminal.ts` inside `src/tools/`. To add more functionality:
1. Implement the tool logic in the respective file (similar to `filesystem.ts`).
2. Import and register the tool in `src/index.ts` using `server.registerTool(...)`.
3. Rebuild the server using `npm run build`.
