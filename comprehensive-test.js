#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 全面测试MCP搜索功能...');

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
  console.log(`\n📤 发送请求: ${method}`);
  console.log(`参数: ${JSON.stringify(params, null, 2)}`);
  server.stdin.write(message + '\n');
}

// 处理服务器响应
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('\n📥 收到响应:');
      
      if (response.result && response.result.content) {
        const searchResults = response.result.content[0].text;
        console.log('搜索结果:');
        console.log(searchResults);
        
        // 分析结果
        const lines = searchResults.split('\n').filter(line => line.trim());
        console.log(`\n找到 ${lines.length} 行匹配`);
        
        if (lines.length > 0) {
          console.log('✅ 搜索成功！');
          passedTests++;
        } else {
          console.log('❌ 没有找到匹配结果');
        }
        
        testCount++;
        
        // 如果有错误信息
        if (response.result.isError) {
          console.log('❌ 请求返回错误');
        }
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

server.on('close', (code) => {
  console.log(`\n🏁 服务器退出，代码: ${code}`);
  console.log(`\n📊 测试结果: ${passedTests}/${testCount} 通过`);
  if (passedTests === testCount) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败');
  }
});

server.on('error', (error) => {
  console.error('服务器错误:', error);
});

// 等待服务器启动后发送测试请求
setTimeout(() => {
  console.log('\n🚀 开始全面测试...');
  
  // 测试1: 只有path参数
  console.log('\n=== 测试1: 只有path参数 ===');
  sendRequest('tools/call', {
    name: 'search',
    arguments: {
      pattern: 'test',
      path: '.',
      max_matches: 5
    }
  });
  
  // 测试2: 只有root参数
  setTimeout(() => {
    console.log('\n=== 测试2: 只有root参数 ===');
    sendRequest('tools/call', {
      name: 'search',
      arguments: {
        pattern: 'import',
        root: '.',
        max_matches: 5
      }
    });
  }, 2000);
  
  // 测试3: 同时有root和path参数
  setTimeout(() => {
    console.log('\n=== 测试3: 同时有root和path参数 ===');
    sendRequest('tools/call', {
      name: 'search',
      arguments: {
        pattern: 'function',
        root: '.',
        path: './src',
        max_matches: 5
      }
    });
  }, 4000);
  
  // 测试4: 没有root和path参数
  setTimeout(() => {
    console.log('\n=== 测试4: 没有root和path参数 ===');
    sendRequest('tools/call', {
      name: 'search',
      arguments: {
        pattern: 'console',
        max_matches: 5
      }
    });
  }, 6000);
  
  // 测试5: 文件类型过滤
  setTimeout(() => {
    console.log('\n=== 测试5: 文件类型过滤 ===');
    sendRequest('tools/call', {
      name: 'search',
      arguments: {
        pattern: 'export',
        file_type: 'js',
        max_matches: 5
      }
    });
  }, 8000);
  
  // 测试6: 包含和排除模式
  setTimeout(() => {
    console.log('\n=== 测试6: 包含和排除模式 ===');
    sendRequest('tools/call', {
      name: 'search',
      arguments: {
        pattern: 'const',
        include: '*.js',
        exclude: 'node_modules',
        max_matches: 5
      }
    });
  }, 10000);
  
  // 测试完成，退出
  setTimeout(() => {
    console.log('\n✅ 所有测试完成！');
    server.kill();
    process.exit(0);
  }, 12000);
  
}, 1000);