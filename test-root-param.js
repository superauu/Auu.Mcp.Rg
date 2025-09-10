#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('测试root参数功能...');

// 启动服务器
const server = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  windowsHide: true,
});

let requestId = 1;

// 发送MCP请求
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method,
    params
  };
  const message = JSON.stringify(request);
  console.log(`\n发送请求: ${method}`);
  console.log(`参数: ${JSON.stringify(params, null, 2)}`);
  server.stdin.write(message + '\n');
}

// 处理服务器响应
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('\n收到响应:');
      
      if (response.result && response.result.content) {
        const searchResults = response.result.content[0].text;
        const lines = searchResults.split('\n').filter(line => line.trim());
        console.log(`找到 ${lines.length} 行匹配`);
        
        if (lines.length > 0) {
          console.log('前3个结果:');
          lines.slice(0, 3).forEach((line, i) => {
            console.log(`${i+1}: ${line}`);
          });
        }
      }
      
      if (response.error) {
        console.log('错误:', response.error);
      }
      
    } catch (e) {
      console.log('无法解析的响应:', line);
    }
  });
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (!output.includes('MCP ripgrep server started')) {
    console.log('服务器错误:', output);
  }
});

// 测试序列
let testIndex = 0;
const tests = [
  {
    name: '测试1: 在src目录中搜索import',
    params: {
      name: 'search',
      arguments: {
        pattern: 'import',
        root: 'src',
        max_matches: 5
      }
    }
  },
  {
    name: '测试2: 尝试越界搜索（应该失败）',
    params: {
      name: 'search',
      arguments: {
        pattern: 'test',
        root: 'src',
        path: '..\\node_modules',  // 尝试访问root外的目录
        max_matches: 5
      }
    }
  },
  {
    name: '测试3: 在root内搜索',
    params: {
      name: 'search',
      arguments: {
        pattern: 'function',
        root: 'src',
        path: 'src',  // 在root内
        max_matches: 3
      }
    }
  }
];

function runNextTest() {
  if (testIndex < tests.length) {
    const test = tests[testIndex];
    console.log(`\n=== ${test.name} ===`);
    sendRequest('tools/call', test.params);
    testIndex++;
    
    setTimeout(runNextTest, 3000);
  } else {
    console.log('\n所有测试完成！');
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 1000);
  }
}

// 等待服务器启动后开始测试
setTimeout(() => {
  console.log('开始测试序列...');
  runNextTest();
}, 1000);