#!/usr/bin/env node

import { spawn } from 'child_process';
import { resolve, normalize } from 'path';

// 测试不同平台的路径处理
const testPaths = [
  'C:\\Users\\user\\project\\src',
  '/home/user/project/src',
  './src',
  '../project/src',
  'src/utils',
  'dist/index.js',
  'node_modules',
  'E:\\code\\project\\lib',
  '/opt/project/config'
];

console.log('🧪 路径标准化测试\n');

testPaths.forEach(path => {
  // 标准化路径处理
  const normalizedPath = path.replace(/\\/g, '/');
  console.log(`📁 原始路径: ${path}`);
  console.log(`   标准化: ${normalizedPath}`);
  console.log();
});

// 测试ripgrep命令构建
console.log('🔍 ripgrep命令构建测试:\n');

function buildTestCommand(pattern, searchPath) {
  const cmd = ['rg', pattern];
  
  if (searchPath) {
    const normalizedPath = searchPath.replace(/\\/g, '/');
    cmd.push(normalizedPath);
  }
  
  return cmd;
}

const testCommands = [
  { pattern: 'import', path: 'src' },
  { pattern: 'function', path: 'C:\\project\\src' },
  { pattern: 'class', path: '/home/user/project/src' },
  { pattern: 'const', path: './lib' }
];

testCommands.forEach(({ pattern, path }) => {
  const cmd = buildTestCommand(pattern, path);
  console.log(`📋 模式: "${pattern}", 路径: "${path}"`);
  console.log(`   命令: ${cmd.join(' ')}`);
  console.log();
});

console.log('✅ 路径处理测试完成');