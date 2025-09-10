# Auu.Mcp.Rg

A cross-platform MCP (Model Context Protocol) server for ripgrep that provides powerful search capabilities with seamless support for Windows, macOS, and Linux, plus enhanced security features.

## Features

- **🌟 Cross-Platform Compatible**: Native support for Windows, macOS, and Linux with intelligent path handling (v1.2.6)
- **🔧 Search Tools**: Multiple search tools for different use cases
- **📋 Full ripgrep Support**: Supports all ripgrep options and flags
- **🚀 npx Deployable**: Can be run directly with npx
- **🆕 Global Root Directory**: Server-wide root directory configuration via environment variable (v1.2.0)
- **🆕 Enhanced Security**: Automatic path validation and directory traversal protection (v1.2.0)
- **🆕 Flexible Configuration**: Per-call root override capability (v1.2.0)
- **🆕 Smart Path Handling**: Properly combines root and path parameters for intuitive search scope (v1.2.1)
- **🆕 Performance Safeguards**: Built-in result limits (default: 100), output size limits (10MB), and timeout protection (30s) (v1.2.1)
- **🆕 Memory Protection**: Automatic output truncation to prevent memory leaks (v1.2.1)
- **🆕 Intelligent Path Resolution**: Cross-platform path normalization and validation using Node.js path utilities (v1.2.6)

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
- path: Directory to search in (optional, must be within root if specified, combines with root for intuitive search scope)
- include: Glob pattern for files to include
- exclude: Glob pattern for files to exclude
- context: Number of context lines
- max_matches: Maximum number of matches to return (default: 100)
- case_sensitive: Case sensitive search
- word_boundaries: Match whole words only
- file_type: Only search specific file types

### 2. advanced-search
Full access to all ripgrep options with complete parameter support.

### 3. count-matches
Count matches instead of showing them:
- pattern: The search pattern (required)
- root: The root directory to limit search scope (optional, search will be restricted to this directory)
- path: Directory to search in (optional, must be within root if specified, combines with root for intuitive search scope)
- include: Glob pattern for files to include
- exclude: Glob pattern for files to exclude
- case_sensitive: Case sensitive search
- file_type: Only search specific file types

### 4. list-files
List all files that would be searched:
- root: The root directory to limit search scope (optional, search will be restricted to this directory)
- path: Directory to search in (optional, must be within root if specified, combines with root for intuitive search scope)
- include: Glob pattern for files to include
- exclude: Glob pattern for files to exclude
- file_type: Only search specific file types

### 5. list-file-types
List all supported file types by ripgrep.

## Usage Examples

### Basic Search
```json
{
  "name": "search",
  "arguments": {
    "pattern": "function",
    "max_matches": 10
  }
}
```

### Search with Global Root Directory
When `ROOT` is configured in the server, all searches are automatically limited to that directory:

```json
{
  "name": "search",
  "arguments": {
    "pattern": "import",
    "include": "*.ts",
    "max_matches": 5
  }
}
```

### Count Files in Project
```json
{
  "name": "count-matches",
  "arguments": {
    "pattern": "TODO",
    "include": "*.js"
  }
}
```

### List TypeScript Files
```json
{
  "name": "list-files",
  "arguments": {
    "include": "*.ts",
    "file_type": "typescript"
  }
}
```

### Advanced Search with Context
```json
{
  "name": "advanced-search",
  "arguments": {
    "pattern": "class.*Controller",
    "include": "*.ts",
    "context": 2,
    "case_sensitive": true
  }
}
```

### Override Root Directory for Specific Search
```json
{
  "name": "search",
  "arguments": {
    "pattern": "test",
    "root": "/path/to/tests",
    "include": "*.spec.js"
  }
}
```

### Combined Root and Path Search (v1.2.1+)
When both root and path are specified, they are automatically combined:
```json
{
  "name": "search",
  "arguments": {
    "pattern": "config",
    "root": "/path/to/project",
    "path": "src",
    "include": "*.ts",
    "max_matches": 50
  }
}
```
This searches in `/path/to/project/src` directory.

### Safe Search with Built-in Limits (v1.2.1+)
All searches automatically include sensible defaults to prevent excessive output:
```json
{
  "name": "search",
  "arguments": {
    "pattern": "import",
    "path": "src"
  }
}
```
This will return at most 100 results and is protected by timeout and size limits.

## Configuration

### Basic Configuration

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

### Root Directory Configuration (Recommended)

For enhanced security, configure a default root directory to limit all search operations:

```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"],
      "env": {
        "ROOT": "/path/to/your/project"
      }
    }
  }
}
```

**Windows Example:**
```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"],
      "env": {
        "ROOT": "E:\\code\\my-project"
      }
    }
  }
}
```

**macOS/Linux Example:**
```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"],
      "env": {
        "ROOT": "/Users/username/my-project"
      }
    }
  }
}
```

### Configuration Options

- **ROOT**: Sets the default root directory for all search operations (optional but recommended)
- **AUU_MCP_RG_VERSION**: Version pinning for stability (optional)

When `ROOT` is configured, all tools will automatically use this directory unless explicitly overridden.

## Enhanced Cross-Platform Compatibility (v1.2.6)

This server now offers superior cross-platform compatibility with intelligent path handling:

### 🆕 Advanced Cross-Platform Features

**Intelligent Path Resolution:**
- Automatic detection and handling of platform-specific path formats
- Smart relative path resolution relative to the root directory
- Cross-platform path validation using Node.js `path.relative()` and `path.isAbsolute()`

**Universal Path Normalization:**
- Automatic conversion of Windows backslashes to forward slashes for ripgrep compatibility
- Consistent path handling across all platforms
- Support for mixed path formats in the same environment

### Platform-Specific Optimizations

#### Windows
- **Native Path Support**: Full support for Windows-style paths (`C:\project\src`)
- **Command Escaping**: Proper Windows command argument escaping
- **Process Management**: Windows-optimized process spawning

#### macOS & Linux
- **Unix Path Standards**: Native support for POSIX paths (`/home/user/project`)
- **Shell Integration**: Standard Unix shell behavior
- **Performance**: Optimized for Unix process management

### 🆕 Cross-Platform Examples

**Windows Configuration:**
```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"],
      "env": {
        "ROOT": "E:\\code\\my-project"
      }
    }
  }
}
```

**macOS/Linux Configuration:**
```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"],
      "env": {
        "ROOT": "/home/username/my-project"
      }
    }
  }
}
```

**Cross-Platform Path Usage:**
```json
{
  "name": "search",
  "arguments": {
    "pattern": "import",
    "root": "E:\\code\\project",  // Windows path
    "path": "src/utils"           // Relative path works on all platforms
  }
}
```

### 🆕 Technical Improvements (v1.2.6)

- **Enhanced Path Validation**: Uses `path.relative()` instead of string matching for reliable cross-platform boundary checking
- **Improved Relative Path Support**: Proper handling of relative paths relative to the root directory
- **Memory Safety**: Improved path handling to prevent security issues
- **Performance**: Optimized path resolution and validation algorithms
- **Comprehensive Testing**: Added extensive cross-platform test coverage

## Windows Compatibility Fixes

This server addresses several Windows compatibility issues found in other MCP ripgrep implementations:

1. **Proper Command Escaping**: Uses Windows-appropriate argument escaping
2. **Process Execution**: Direct process spawning without shell dependencies
3. **Path Handling**: Proper handling of Windows paths with spaces and special characters
4. **Build Process**: Removed Unix-specific commands like `chmod`

## Security & Performance Features (v1.1.0+)

### Global Root Directory Configuration

The `ROOT` environment variable provides server-wide security by limiting all search operations to a specific directory:

```json
{
  "mcpServers": {
    "auu-mcp-rg": {
      "command": "npx",
      "args": ["auu-mcp-rg"],
      "env": {
        "ROOT": "/path/to/project"
      }
    }
  }
}
```

**Benefits:**
- **Server-wide Security**: All tools automatically respect the root directory boundary
- **Zero Configuration Needed**: No need to specify root in individual tool calls
- **Prevents Accidental Access**: Protects sensitive files outside the project directory
- **Sandboxed Environment**: Provides controlled search scope for enhanced security
- **Multi-tenant Support**: Ideal for shared environments and team projects
- **Directory Traversal Protection**: Blocks attempts to access paths outside the root

### Per-Call Root Override

You can still specify a different root directory for individual tool calls:

```json
{
  "name": "search",
  "arguments": {
    "pattern": "function",
    "root": "/different/path/project",
    "max_matches": 10
  }
}
```

### Path Validation

- **Automatic Validation**: All search paths are validated against the root directory
- **Clear Error Messages**: Attempts to access paths outside the root are blocked with informative errors
- **Flexible Path Support**: Works with both absolute and relative paths
- **Cross-Platform**: Proper handling of Windows, macOS, and Linux path formats

### Performance & Memory Protection (v1.2.1+)

- **Result Limits**: Built-in limit of 100 matches per search to prevent excessive output
- **Output Size Limits**: Automatic truncation at 10MB to prevent memory issues
- **Timeout Protection**: 30-second timeout to prevent hanging searches
- **Memory Safety**: Automatic process cleanup and resource management
- **Smart Defaults**: Sensible defaults that balance functionality with safety

### Smart Path Handling (v1.2.1+)

- **Path Combination**: When both `root` and `path` are specified, they are intelligently combined
- **Intuitive Search Scope**: `root: "/project", path: "src"` searches in `/project/src`
- **Validation**: Combined paths are still validated against security boundaries
- **Backward Compatible**: Existing usage patterns continue to work unchanged

## Requirements

- Node.js 18+
- ripgrep installed and available in PATH
- Windows, macOS, or Linux

## License

MIT