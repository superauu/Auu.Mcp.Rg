import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { spawn } from "child_process";
import { promisify } from "util";
import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join, dirname, resolve, normalize } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 从环境变量读取默认root目录
const DEFAULT_ROOT = process.env.ROOT;

// 需要排除的非源代码文件夹列表
const DEFAULT_EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  'out',
  'target',
  'bin',
  'obj',
  'Debug',
  'Release',
  'coverage',
  '.nyc_output',
  '.cache',
  '.tmp',
  '.temp',
  'logs',
  'log',
  '.git',
  '.svn',
  '.hg',
  '.idea',
  '.vscode',
  '.vs',
  '*.swp',
  '*.swo',
  '*~',
  '.DS_Store',
  'Thumbs.db',
  '.env',
  '.env.local',
  '.env.development',
  '.env.test',
  '.env.production',
  'vendor',
  'vendors',
  'bower_components',
  'jspm_packages',
  'flow-typed',
  '.next',
  '.nuxt',
  '.vuepress',
  '.docusaurus',
  '.docz',
  '.storybook',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  'site-packages',
  'venv',
  'env',
  '.venv',
  '.env',
  'node_modules',
  'Pods',
  'Carthage',
  'Checkouts',
  'DerivedData',
  'build',
  '.gradle',
  '.idea',
  '.vs',
  '*.pyc',
  '*.pyo',
  '*.class',
  '*.jar',
  '*.war',
  '*.ear',
  '*.dll',
  '*.exe',
  '*.so',
  '*.dylib',
  '*.a',
  '*.lib',
  '*.o',
  '*.obj',
  '*.bin',
  '*.dat',
  '*.db',
  '*.sqlite',
  '*.log',
  '*.tmp',
  '*.temp',
  '*.bak',
  '*.backup',
  '*.swp',
  '*.swo',
  '*~',
  '.DS_Store',
  'Thumbs.db'
];

// 构建排除参数
function buildExcludePatterns(userExclude?: string): string[] {
  const patterns: string[] = [];
  
  // 添加默认排除模式
  DEFAULT_EXCLUDE_DIRS.forEach(dir => {
    patterns.push(`!${dir}`);
  });
  
  // 添加用户自定义排除模式
  if (userExclude) {
    patterns.push(`!${userExclude}`);
  }
  
  return patterns;
}

// 验证路径是否在root范围内
function validatePath(root: string | undefined, path: string | undefined): string | undefined {
  if (!root) return path;
  
  const resolvedRoot = resolve(normalize(root));
  if (path) {
    // 如果path是绝对路径，直接使用它
    const resolvedPath = resolve(normalize(path));
    // 检查路径是否在root范围内
    if (!resolvedPath.startsWith(resolvedRoot)) {
      throw new Error(`Path '${path}' is outside the root directory '${root}'`);
    }
    return resolvedPath;
  }
  return resolvedRoot;
}

const ArgsSchema = z.object({
  pattern: z.string(),
  root: z.string().optional(),
  path: z.string().optional(),
  include: z.string().optional(),
  exclude: z.string().optional(),
  context: z.number().optional(),
  max_matches: z.number().optional(),
  case_sensitive: z.boolean().optional(),
  word_boundaries: z.boolean().optional(),
  whole_word: z.boolean().optional(),
  regex: z.boolean().optional(),
  literal: z.boolean().optional(),
  file_type: z.string().optional(),
  type: z.string().optional(),
  multiline: z.boolean().optional(),
  count: z.boolean().optional(),
  files_with_matches: z.boolean().optional(),
  list_files: z.boolean().optional(),
  file_types: z.boolean().optional(),
  before_context: z.number().optional(),
  after_context: z.number().optional(),
  max_columns: z.number().optional(),
  max_filesize: z.string().optional(),
  sort_files: z.boolean().optional(),
  sort_r: z.boolean().optional(),
  no_ignore: z.boolean().optional(),
  no_ignore_parent: z.boolean().optional(),
  no_ignore_vcs: z.boolean().optional(),
  hidden: z.boolean().optional(),
  no_heading: z.boolean().optional(),
  no_line_number: z.boolean().optional(),
  no_column: z.boolean().optional(),
  no_filename: z.boolean().optional(),
  no_messages: z.boolean().optional(),
  pretty: z.boolean().optional(),
  vimgrep: z.boolean().optional(),
  with_filename: z.boolean().optional(),
  line_number: z.boolean().optional(),
  column: z.boolean().optional(),
  field_context_separator: z.string().optional(),
  field_match_separator: z.string().optional(),
  field_file_separator: z.string().optional(),
  only_matching: z.boolean().optional(),
  replace: z.string().optional(),
  max_count: z.number().optional(),
  byte_offset: z.boolean().optional(),
  unrestricted: z.boolean().optional(),
  dereference_recursive: z.boolean().optional(),
  follow: z.boolean().optional(),
  one_file_system: z.boolean().optional(),
  require_git: z.boolean().optional(),
  pass_through: z.boolean().optional(),
  auto_hybrid_regex: z.boolean().optional(),
  hyper_scan: z.boolean().optional(),
  pcre2: z.boolean().optional(),
  no_pcre2_unicode: z.boolean().optional(),
  no_unicode: z.boolean().optional(),
  no_encoding: z.boolean().optional(),
  no_mmap: z.boolean().optional(),
  no_pre: z.boolean().optional(),
  no_jit: z.boolean().optional(),
  threads: z.number().optional(),
  depth: z.number().optional(),
  min_depth: z.number().optional(),
  max_depth: z.number().optional(),
  iglob: z.string().optional(),
  glob: z.string().optional(),
  glob_case_insensitive: z.boolean().optional(),
  no_glob: z.boolean().optional(),
  pre: z.string().optional(),
  post: z.string().optional(),
  pre_glob: z.string().optional(),
  post_glob: z.string().optional(),
  pre_glob_case_insensitive: z.boolean().optional(),
  post_glob_case_insensitive: z.boolean().optional(),
  no_pre_glob: z.boolean().optional(),
  no_post_glob: z.boolean().optional(),
  pre_grep: z.string().optional(),
  post_grep: z.string().optional(),
  pre_grep_glob: z.string().optional(),
  post_grep_glob: z.string().optional(),
  pre_grep_glob_case_insensitive: z.boolean().optional(),
  post_grep_glob_case_insensitive: z.boolean().optional(),
  no_pre_grep_glob: z.boolean().optional(),
  no_post_grep_glob: z.boolean().optional(),
  encoding: z.string().optional(),
  mmap: z.boolean().optional(),
});

type Args = z.infer<typeof ArgsSchema>;

const server = new Server(
  {
    name: "auu-mcp-rg",
    version: "1.2.2",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function escapeArg(arg: string): string {
  if (process.platform === 'win32') {
    return `"${arg.replace(/"/g, '""')}"`;
  }
  return arg.replace(/([\\'"(){}[\]!$&*|;<>?`~])/g, '\\$1');
}

function buildCommand(args: Args): string[] {
  const cmd: string[] = ['rg'];
  
  // 应用智能排除规则
  const excludePatterns = buildExcludePatterns(args.exclude);
  excludePatterns.forEach(pattern => {
    cmd.push('-g', pattern);
  });
  
  if (args.case_sensitive === false) cmd.push('-i');
  if (args.word_boundaries) cmd.push('-w');
  if (args.whole_word) cmd.push('-w');
  if (args.regex === false) cmd.push('-F');
  if (args.literal) cmd.push('-F');
  if (args.multiline) cmd.push('-U');
  if (args.count) cmd.push('-c');
  if (args.files_with_matches) cmd.push('-l');
  if (args.list_files) cmd.push('--files');
  if (args.file_types) cmd.push('--type-list');
  if (args.no_ignore) cmd.push('--no-ignore');
  if (args.no_ignore_parent) cmd.push('--no-ignore-parent');
  if (args.no_ignore_vcs) cmd.push('--no-ignore-vcs');
  if (args.hidden) cmd.push('--hidden');
  if (args.no_heading) cmd.push('--no-heading');
  if (args.no_line_number) cmd.push('-N');
  if (args.no_column) cmd.push('--no-column');
  if (args.no_filename) cmd.push('--no-filename');
  if (args.no_messages) cmd.push('--no-messages');
  if (args.pretty) cmd.push('--pretty');
  if (args.vimgrep) cmd.push('--vimgrep');
  if (args.with_filename) cmd.push('--with-filename');
  if (args.line_number) cmd.push('-n');
  if (args.column) cmd.push('--column');
  if (args.only_matching) cmd.push('-o');
  if (args.byte_offset) cmd.push('--byte-offset');
  if (args.unrestricted) cmd.push('-u');
  if (args.dereference_recursive) cmd.push('-L');
  if (args.follow) cmd.push('-L');
  if (args.one_file_system) cmd.push('--one-file-system');
  if (args.require_git) cmd.push('--require-git');
  if (args.pass_through) cmd.push('--passthru');
  if (args.auto_hybrid_regex) cmd.push('--auto-hybrid-regex');
  if (args.hyper_scan) cmd.push('--hyper-scan');
  if (args.pcre2) cmd.push('--pcre2');
  if (args.no_pcre2_unicode) cmd.push('--no-pcre2-unicode');
  if (args.no_unicode) cmd.push('--no-unicode');
  if (args.no_encoding) cmd.push('--no-encoding');
  if (args.no_mmap) cmd.push('--no-mmap');
  if (args.no_pre) cmd.push('--no-pre');
  if (args.no_jit) cmd.push('--no-jit');
  if (args.threads) cmd.push('--threads', args.threads.toString());
  if (args.depth) cmd.push('--depth', args.depth.toString());
  if (args.min_depth) cmd.push('--mindepth', args.min_depth.toString());
  if (args.max_depth) cmd.push('--maxdepth', args.max_depth.toString());
  if (args.glob_case_insensitive) cmd.push('--glob-case-insensitive');
  if (args.no_glob) cmd.push('--no-glob');
  if (args.no_pre_glob) cmd.push('--no-pre-glob');
  if (args.no_post_glob) cmd.push('--no-post-glob');
  if (args.no_pre_grep_glob) cmd.push('--no-pre-grep-glob');
  if (args.no_post_grep_glob) cmd.push('--no-post-grep-glob');
  if (args.mmap) cmd.push('--mmap');
  if (args.encoding) cmd.push('--encoding', args.encoding);
  
  if (args.context !== undefined) cmd.push('-C', args.context.toString());
  if (args.before_context !== undefined) cmd.push('-B', args.before_context.toString());
  if (args.after_context !== undefined) cmd.push('-A', args.after_context.toString());
  if (args.max_columns !== undefined) cmd.push('--max-columns', args.max_columns.toString());
  if (args.max_filesize) cmd.push('--max-filesize', args.max_filesize);
  if (args.max_count !== undefined) cmd.push('--max-count', args.max_count.toString());
  if (args.replace !== undefined) cmd.push('--replace', args.replace);
  
  if (args.include) cmd.push('-g', args.include);
  if (args.file_type) cmd.push('-t', args.file_type);
  if (args.type) cmd.push('-t', args.type);
  if (args.iglob) cmd.push('--iglob', args.iglob);
  if (args.glob) cmd.push('--glob', args.glob);
  if (args.pre) cmd.push('--pre', args.pre);
  if (args.post) cmd.push('--post', args.post);
  if (args.pre_glob) cmd.push('--pre-glob', args.pre_glob);
  if (args.post_glob) cmd.push('--post-glob', args.post_glob);
  if (args.pre_grep) cmd.push('--pre-grep', args.pre_grep);
  if (args.post_grep) cmd.push('--post-grep', args.post_grep);
  if (args.pre_grep_glob) cmd.push('--pre-grep-glob', args.pre_grep_glob);
  if (args.post_grep_glob) cmd.push('--post-grep-glob', args.post_grep_glob);
  if (args.field_context_separator) cmd.push('--field-context-separator', args.field_context_separator);
  if (args.field_match_separator) cmd.push('--field-match-separator', args.field_match_separator);
  if (args.field_file_separator) cmd.push('--field-file-separator', args.field_file_separator);
  
  if (args.sort_files) cmd.push('--sort-files');
  if (args.sort_r) cmd.push('--sortr');
  
  cmd.push(args.pattern);
  
  // 确定搜索路径：优先使用path，否则使用root
  let searchPath = '';
  if (args.path) {
    searchPath = args.path;
  } else if (args.root) {
    searchPath = args.root;
  } else {
    // 如果既没有path也没有root，使用当前工作目录
    searchPath = '.';
  }
  
  if (searchPath) {
    cmd.push(searchPath);
  }
  
  return cmd;
}

async function executeRipgrep(args: Args): Promise<string> {
  // 验证路径但不改变原始参数结构
  const validatedPath = validatePath(args.root, args.path);
  const validatedArgs = { ...args };
  
  // 根据验证结果调整参数
  if (validatedPath) {
    if (args.path) {
      validatedArgs.path = validatedPath;
    } else if (args.root) {
      validatedArgs.root = validatedPath;
    } else {
      validatedArgs.root = validatedPath;
    }
  }
  
  const cmd = buildCommand(validatedArgs);
  
  return new Promise((resolve, reject) => {
    // 设置超时时间 (30秒)
    const timeout = setTimeout(() => {
      rg.kill();
      reject(new Error('Search timeout after 30 seconds'));
    }, 30000);
    const rg = spawn('rg', cmd.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
      windowsVerbatimArguments: false
    });
    
    let stdout = '';
    let stderr = '';
    
    rg.stdout.on('data', (data) => {
      stdout += data.toString();
      // 防止内存泄漏，限制输出大小 (约10MB)
      if (stdout.length > 10 * 1024 * 1024) {
        rg.kill();
        resolve(stdout + "\n... Output truncated due to size limits");
      }
    });
    
    rg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    rg.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve(stdout);
      } else if (code === 1) {
        resolve(stdout);
      } else {
        reject(new Error(`ripgrep exited with code ${code}: ${stderr}`));
      }
    });
    
    rg.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to execute ripgrep: ${error.message}`));
    });
  });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search",
        description: "Search for a pattern using ripgrep",
        inputSchema: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
              description: "The pattern to search for",
            },
            root: {
              type: "string",
              description: "The root directory to limit search scope (optional, search will be restricted to this directory)",
            },
            path: {
              type: "string",
              description: "The path to search in (optional, must be within root if specified)",
            },
            include: {
              type: "string",
              description: "Include files matching this glob pattern",
            },
            exclude: {
              type: "string",
              description: "Exclude files matching this glob pattern",
            },
            context: {
              type: "number",
              description: "Number of context lines to show",
            },
            max_matches: {
              type: "number",
              description: "Maximum number of matches to return (default: 100)",
            },
            case_sensitive: {
              type: "boolean",
              description: "Case sensitive search",
            },
            word_boundaries: {
              type: "boolean",
              description: "Match whole words only",
            },
            file_type: {
              type: "string",
              description: "Only search files of this type",
            },
          },
          required: ["pattern"],
        },
      },
      {
        name: "advanced-search",
        description: "Advanced search with all ripgrep options",
        inputSchema: {
          type: "object",
          properties: ArgsSchema.shape,
          required: ["pattern"],
        },
      },
      {
        name: "count-matches",
        description: "Count matches for a pattern",
        inputSchema: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
              description: "The pattern to count",
            },
            root: {
              type: "string",
              description: "The root directory to limit search scope (optional, search will be restricted to this directory)",
            },
            path: {
              type: "string",
              description: "The path to search in (optional, must be within root if specified)",
            },
            include: {
              type: "string",
              description: "Include files matching this glob pattern",
            },
            exclude: {
              type: "string",
              description: "Exclude files matching this glob pattern",
            },
            case_sensitive: {
              type: "boolean",
              description: "Case sensitive search",
            },
            file_type: {
              type: "string",
              description: "Only search files of this type",
            },
          },
          required: ["pattern"],
        },
      },
      {
        name: "list-files",
        description: "List all files that would be searched",
        inputSchema: {
          type: "object",
          properties: {
            root: {
              type: "string",
              description: "The root directory to limit search scope (optional, search will be restricted to this directory)",
            },
            path: {
              type: "string",
              description: "The path to search in (optional, must be within root if specified)",
            },
            include: {
              type: "string",
              description: "Include files matching this glob pattern",
            },
            exclude: {
              type: "string",
              description: "Exclude files matching this glob pattern",
            },
            file_type: {
              type: "string",
              description: "Only search files of this type",
            },
          },
        },
      },
      {
        name: "list-file-types",
        description: "List all supported file types",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result = '';
    
    // 合并默认root目录和传入的参数
    const finalArgs = { ...args };
    if (DEFAULT_ROOT && !(args as any)?.root) {
      (finalArgs as any).root = DEFAULT_ROOT;
    }
    
    switch (name) {
      case "search":
        result = await executeRipgrep({
          pattern: (finalArgs as any)?.pattern || '',
          root: (finalArgs as any)?.root,
          path: (finalArgs as any)?.path,
          include: (finalArgs as any)?.include,
          exclude: (finalArgs as any)?.exclude,
          context: (finalArgs as any)?.context,
          max_matches: (finalArgs as any)?.max_matches || 100,
          case_sensitive: (finalArgs as any)?.case_sensitive,
          word_boundaries: (finalArgs as any)?.word_boundaries,
          file_type: (finalArgs as any)?.file_type,
        });
        break;
        
      case "advanced-search":
        result = await executeRipgrep(finalArgs as Args);
        break;
        
      case "count-matches":
        result = await executeRipgrep({
          pattern: (finalArgs as any)?.pattern || '',
          root: (finalArgs as any)?.root,
          path: (finalArgs as any)?.path,
          include: (finalArgs as any)?.include,
          exclude: (finalArgs as any)?.exclude,
          case_sensitive: (finalArgs as any)?.case_sensitive,
          file_type: (finalArgs as any)?.file_type,
          count: true,
        });
        break;
        
      case "list-files":
        result = await executeRipgrep({
          pattern: '',
          root: (finalArgs as any)?.root,
          path: (finalArgs as any)?.path,
          include: (finalArgs as any)?.include,
          exclude: (finalArgs as any)?.exclude,
          file_type: (finalArgs as any)?.file_type,
          list_files: true,
        });
        break;
        
      case "list-file-types":
        result = await executeRipgrep({
          pattern: '',
          file_types: true,
        });
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP ripgrep server started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});