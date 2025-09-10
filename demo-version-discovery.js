#!/usr/bin/env node

// 演示版本自动发现功能
import { spawn } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';

console.log('=== 版本自动发现功能演示 ===\n');

// 1. 检查当前版本
console.log('1. 检查当前安装的版本:');
const checkVersion = spawn('npx', ['auu-mcp-rg', '--version'], {
  shell: false,
  stdio: ['pipe', 'pipe', 'pipe']
});

checkVersion.stdout.on('data', (data) => {
  console.log(`当前版本: ${data.toString().trim()}`);
});

checkVersion.stderr.on('data', (data) => {
  console.log(`版本信息: ${data.toString().trim()}`);
});

checkVersion.on('close', (code) => {
  console.log(`版本检查完成，退出码: ${code}\n`);
  
  // 2. 演示最新版本获取
  console.log('2. 获取最新版本信息:');
  const getLatest = spawn('npm', ['view', 'auu-mcp-rg', 'version'], {
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  getLatest.stdout.on('data', (data) => {
    console.log(`最新版本: ${data.toString().trim()}`);
  });
  
  getLatest.stderr.on('data', (data) => {
    console.log(`错误: ${data.toString().trim()}`);
  });
  
  getLatest.on('close', (code) => {
    console.log(`最新版本检查完成，退出码: ${code}\n`);
    
    // 3. 演示版本自动更新
    console.log('3. 演示版本自动更新机制:');
    console.log('配置文件中的版本设置: @latest');
    console.log('环境变量版本: AUU_MCP_RG_VERSION=1.1.0');
    console.log('');
    console.log('自动更新机制说明:');
    console.log('- 使用 @latest 标签确保每次启动都获取最新版本');
    console.log('- 环境变量可用于回滚到特定版本');
    console.log('- npx 会自动检查并下载最新版本');
    console.log('- 无需手动更新，客户端重启后自动生效');
    console.log('');
    
    // 4. 演示配置文件位置
    console.log('4. Claude Desktop 配置文件位置:');
    const configPath = process.platform === 'win32' 
      ? join(homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
      : process.platform === 'darwin'
      ? join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
      : join(homedir(), '.config', 'Claude', 'claude_desktop_config.json');
    
    console.log(`配置文件路径: ${configPath}`);
    console.log('');
    
    // 5. 演示更新后的配置
    console.log('5. 更新后的配置示例:');
    console.log(JSON.stringify({
      "mcpServers": {
        "auu-mcp-rg": {
          "command": "npx",
          "args": ["auu-mcp-rg@latest"],
          "env": {
            "AUU_MCP_RG_VERSION": "1.1.0"
          }
        }
      }
    }, null, 2));
    console.log('');
    
    console.log('6. 版本自动发现流程:');
    console.log('1) Claude Desktop 启动时读取配置文件');
    console.log('2) 发现 @latest 标签，向 npm 仓库查询最新版本');
    console.log('3) 如果本地缓存版本不是最新，自动下载最新版本');
    console.log('4) 启动最新版本的 MCP 服务器');
    console.log('5) 服务器报告版本信息给客户端');
    console.log('6) 客户端显示新版本功能和安全特性');
    console.log('');
    
    console.log('=== 演示完成 ===');
  });
});

checkVersion.on('error', (error) => {
  console.log(`检查版本时出错: ${error.message}`);
  console.log('这可能是因为包未安装或网络问题');
});