#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('测试MCP搜索功能...');

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
        console.log('搜索结果:');
        console.log(searchResults);
        
        // 分析结果
        const lines = searchResults.split('\n').filter(line => line.trim());
        console.log(`\n找到 ${lines.length} 行匹配`);
        
        if (lines.length > 0) {
          console.log('✅ 搜索成功！');
        } else {
          console.log('❌ 没有找到匹配结果');
        }
      }
      
      // 测试完成，退出
      setTimeout(() => {
        console.log('\n测试完成！');
        server.kill();
        process.exit(0);
      }, 2000);
      
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

server.on('close', (code) => {
  console.log(`\n服务器退出，代码: ${code}`);
});

server.on('error', (error) => {
  console.error('服务器错误:', error);
});

// 等待服务器启动后发送测试请求
setTimeout(() => {
  console.log('\n开始搜索测试...');
  
  // 搜索 "mcp" 关键词
  sendRequest('tools/call', {
    name: 'search',
    arguments: {
      pattern: 'mcp',
      path: '.',
      max_matches: 10
    }
  });
  
}, 1000);