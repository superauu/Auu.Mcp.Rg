#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 测试 list-files 命令...');

// 启动服务器
const server = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  windowsHide: true,
});

let requestId = 1;
let testCount = 0;
let passedTests = 0;

// 发送MCP请求
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method,
    params
  };
  const message = JSON.stringify(request);
  server.stdin.write(message + '\n');
  return message;
}

// 处理服务器响应
server.stdout.on('data', (data) => {
  const output = data.toString();
  const lines = output.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      handleResponse(response);
    } catch (e) {
      // 忽略非JSON行
    }
  }
});

server.stderr.on('data', (data) => {
  console.error('服务器错误:', data.toString());
});

function handleResponse(response) {
  if (response.result && response.result.content) {
    const result = response.result.content[0].text;
    console.log('\n📥 收到响应:');
    console.log(result);
    
    if (result.includes('Error:')) {
      console.log('❌ 请求返回错误');
    } else {
      console.log('✅ list-files 成功！');
      passedTests++;
    }
    testCount++;
    
    if (testCount >= 4) {
      // 所有测试完成
      console.log(`\n📊 测试结果: ${passedTests}/${testCount} 通过`);
      if (passedTests === testCount) {
        console.log('🎉 所有 list-files 测试通过！');
      } else {
        console.log('⚠️  部分测试失败');
      }
      server.kill();
      process.exit(passedTests === testCount ? 0 : 1);
    }
  } else if (response.error) {
    console.log('❌ 请求返回错误:', response.error);
    testCount++;
    if (testCount >= 4) {
      console.log(`\n📊 测试结果: ${passedTests}/${testCount} 通过`);
      server.kill();
      process.exit(1);
    }
  }
}

server.on('close', (code) => {
  console.log(`\n🏁 服务器退出，代码: ${code}`);
});

server.on('error', (error) => {
  console.error('服务器错误:', error);
  process.exit(1);
});

// 等待服务器启动
setTimeout(() => {
  console.log('\n🚀 开始 list-files 测试...');
  
  // 测试1: 基本 list-files
  console.log('\n=== 测试1: 基本 list-files ===');
  sendRequest('tools/call', {
    name: 'list-files',
    arguments: {
      root: '.',
      include: '*.js',
      file_type: 'js'
    }
  });
  
  // 测试2: TypeScript 文件
  setTimeout(() => {
    console.log('\n=== 测试2: TypeScript 文件 ===');
    sendRequest('tools/call', {
      name: 'list-files',
      arguments: {
        root: '.',
        include: '*.ts',
        file_type: 'typescript'
      }
    });
  }, 2000);
  
  // 测试3: 排除 node_modules
  setTimeout(() => {
    console.log('\n=== 测试3: 排除 node_modules ===');
    sendRequest('tools/call', {
      name: 'list-files',
      arguments: {
        root: '.',
        include: '*.js',
        exclude: 'node_modules',
        file_type: 'js'
      }
    });
  }, 4000);
  
  // 测试4: 所有文件类型
  setTimeout(() => {
    console.log('\n=== 测试4: 所有文件类型 ===');
    sendRequest('tools/call', {
      name: 'list-files',
      arguments: {
        root: '.',
        include: '*.*'
      }
    });
  }, 6000);
  
}, 2000);