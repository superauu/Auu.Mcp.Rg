#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('启动MCP服务器测试...');

// 启动服务器
const server = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  windowsHide: true,
});

let requestId = 1;

// 发送MCP请求的函数
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method,
    params
  };
  const message = JSON.stringify(request);
  console.log(`\n发送请求: ${method}`);
  console.log(`参数:`, JSON.stringify(params, null, 2));
  server.stdin.write(message + '\n');
}

// 处理服务器响应
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('\n收到响应:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('服务器输出:', line);
    }
  });
});

server.stderr.on('data', (data) => {
  console.log('服务器错误:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n服务器退出，代码: ${code}`);
});

server.on('error', (error) => {
  console.error('服务器错误:', error);
});

// 等待服务器启动后发送测试请求
setTimeout(() => {
  console.log('\n开始测试...');
  
  // 测试1: 获取工具列表
  sendRequest('tools/list');
  
  // 测试2: 基本搜索
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'search',
      arguments: {
        pattern: 'test',
        path: '.',
        max_matches: 5
      }
    });
  }, 1000);
  
  // 测试3: 计数匹配
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'count-matches',
      arguments: {
        pattern: 'function',
        path: 'src'
      }
    });
  }, 2000);
  
  // 测试4: 列出文件
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'list-files',
      arguments: {
        path: 'src',
        include: '*.ts'
      }
    });
  }, 3000);
  
  // 测试5: 列出文件类型
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'list-file-types'
    });
  }, 4000);
  
  // 测试完成
  setTimeout(() => {
    console.log('\n测试完成！');
    server.kill();
  }, 6000);
  
}, 1000);