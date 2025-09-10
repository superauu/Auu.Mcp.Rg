#!/usr/bin/env node

import { resolve, normalize, relative, isAbsolute } from 'path';
import { spawn } from 'child_process';

// 模拟validatePath函数
function validatePath(root, path) {
  if (!root) return path;
  
  const resolvedRoot = resolve(normalize(root));
  if (path) {
    // 如果path是相对路径，相对于root目录解析
    let resolvedPath;
    if (isAbsolute(path)) {
      resolvedPath = resolve(normalize(path));
    } else {
      resolvedPath = resolve(resolvedRoot, normalize(path));
    }
    // 检查路径是否在root范围内 - 使用相对路径验证，跨平台兼容
    const relativePath = relative(resolvedRoot, resolvedPath);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      throw new Error(`Path '${path}' is outside the root directory '${root}'`);
    }
    return resolvedPath;
  }
  return resolvedRoot;
}

// 测试用例
const testCases = [
  // Windows路径测试
  {
    name: 'Windows路径验证',
    platform: 'win32',
    tests: [
      { root: 'E:\\code\\project', path: 'E:\\code\\project\\src', shouldPass: true },
      { root: 'E:\\code\\project', path: 'E:\\code\\other\\src', shouldPass: false },
      { root: 'E:\\code\\project', path: 'src\\utils', shouldPass: true },
      { root: 'E:\\code\\project', path: '..\\other', shouldPass: false },
    ]
  },
  // Unix路径测试
  {
    name: 'Unix路径验证',
    platform: 'posix',
    tests: [
      { root: '/home/user/project', path: '/home/user/project/src', shouldPass: true },
      { root: '/home/user/project', path: '/home/user/other/src', shouldPass: false },
      { root: '/home/user/project', path: 'src/utils', shouldPass: true },
      { root: '/home/user/project', path: '../other', shouldPass: false },
    ]
  },
  // 混合路径测试
  {
    name: '混合路径验证',
    platform: 'posix',
    tests: [
      { root: '/project', path: '/project/subdir', shouldPass: true },
      { root: '/project', path: '/project/subdir/../subdir', shouldPass: true },
      { root: '/project', path: '/project/./subdir', shouldPass: true },
    ]
  }
];

// 运行测试
console.log('🧪 跨平台路径验证测试\n');

let passedTests = 0;
let totalTests = 0;

testCases.forEach(testCase => {
  console.log(`\n📋 ${testCase.name}:`);
  
  testCase.tests.forEach(test => {
    totalTests++;
    try {
      const result = validatePath(test.root, test.path);
      const passed = test.shouldPass;
      
      if (passed) {
        console.log(`  ✅ PASS: ${test.root} + ${test.path} -> ${result}`);
        passedTests++;
      } else {
        console.log(`  ❌ FAIL: ${test.root} + ${test.path} 应该失败但通过了`);
      }
    } catch (error) {
      if (!test.shouldPass) {
        console.log(`  ✅ PASS: ${test.root} + ${test.path} -> ${error.message}`);
        passedTests++;
      } else {
        console.log(`  ❌ FAIL: ${test.root} + ${test.path} -> ${error.message}`);
      }
    }
  });
});

console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);

if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！');
  process.exit(0);
} else {
  console.log('❌ 有测试失败');
  process.exit(1);
}