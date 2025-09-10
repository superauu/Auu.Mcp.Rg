#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('启动简单测试...');

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
  server.stdin.write(message + '\n');
}

// 处理服务器响应
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('\n收到响应:');
      console.log(JSON.stringify(response, null, 2));
      
      // 如果是搜索结果，检查内容
      if (response.result && response.result.content) {
        console.log('\n搜索结果内容:');
        console.log(response.result.content[0].text);
      }
      
      // 测试完成，退出
      setTimeout(() => {
        console.log('\n测试完成！');
        server.kill();
        process.exit(0);
      }, 1000);
      
    } catch (e) {
      console.log('服务器输出:', line);
    }
  });
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  // 只显示真正的错误信息，忽略正常的启动日志
  if (!output.includes('MCP ripgrep server started')) {
    console.log('服务器错误:', output);
  } else {
    console.log('服务器启动成功');
  }
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
  
  // 简单搜索测试
  sendRequest('tools/call', {
    name: 'search',
    arguments: {
      pattern: 'import',
      path: 'src',
      max_matches: 3
    }
  });
  
}, 1000);