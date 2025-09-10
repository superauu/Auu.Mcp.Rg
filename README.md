# Auu.Mcp.Rg

A Windows-compatible MCP (Model Context Protocol) server for ripgrep that provides powerful search capabilities with proper Windows support and security features.

## Features

- **Windows Compatible**: Properly handles Windows paths, command escaping, and process execution
- **Search Tools**: Multiple search tools for different use cases
- **Full ripgrep Support**: Supports all ripgrep options and flags
- **npx Deployable**: Can be run directly with npx
- **🆕 Root Directory Restriction**: Security feature to limit search scope to specific directories
- **🆕 Path Validation**: Prevents directory traversal attacks outside the root directory

## Installation

```bash
npm install -g auu-mcp-rg
```

Or use with npx:

```bash
npx auu-mcp-rg
```

## Tools Available

### 1. search
Basic search with common options:
- pattern: The search pattern (required)
- root: The root directory to limit search scope (optional, search will be restricted to this directory)
- path: Directory to search in (optional, must be within root if specified)
- include: Glob pattern for files to include
- exclude: Glob pattern for files to exclude
- context: Number of context lines
- case_sensitive: Case sensitive search
- word_boundaries: Match whole words only
- file_type: Only search specific file types

### 2. advanced-search
Full access to all ripgrep options with complete parameter support.

### 3. count-matches
Count matches instead of showing them:
- pattern: The search pattern (required)
- root: The root directory to limit search scope (optional, search will be restricted to this directory)
- path: Directory to search in (optional, must be within root if specified)
- include: Glob pattern for files to include
- exclude: Glob pattern for files to exclude
- case_sensitive: Case sensitive search
- file_type: Only search specific file types

### 4. list-files
List all files that would be searched:
- root: The root directory to limit search scope (optional, search will be restricted to this directory)
- path: Directory to search in (optional, must be within root if specified)
- include: Glob pattern for files to include
- exclude: Glob pattern for files to exclude
- file_type: Only search specific file types

### 5. list-file-types
List all supported file types by ripgrep.

## Configuration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"]
    }
  }
}
```

## Windows Compatibility Fixes

This server addresses several Windows compatibility issues found in other MCP ripgrep implementations:

1. **Proper Command Escaping**: Uses Windows-appropriate argument escaping
2. **Process Execution**: Direct process spawning without shell dependencies
3. **Path Handling**: Proper handling of Windows paths with spaces and special characters
4. **Build Process**: Removed Unix-specific commands like `chmod`

## Security Features (v1.1.0+)

### Root Directory Restriction

The `root` parameter provides security by limiting search scope to a specific directory:

```json
{
  "name": "search",
  "arguments": {
    "pattern": "function",
    "root": "/path/to/project",
    "max_matches": 10
  }
}
```

**Benefits:**
- Prevents accidental access to sensitive files outside the project
- Provides sandboxed search environment
- Useful for multi-tenant or shared environments
- Protects against directory traversal attacks

### Path Validation

- Automatic validation ensures all search paths stay within the root directory
- Attempts to access paths outside the root are blocked with clear error messages
- Works with both absolute and relative paths

## Requirements

- Node.js 18+
- ripgrep installed and available in PATH
- Windows, macOS, or Linux

## License

MIT