# 在 Client App 中使用 Rust 加密功能

## 解决方案概述

我们已成功在 client/app 中集成了基于 Rust 的加密解密功能。这种实现方法避免了 webpack 直接打包 native 模块导致的问题，同时保持了代码的简洁性和可维护性。

## 实现细节

1. **架构设计**:
   - 使用 JavaScript 直接加载 Rust native 模块 (algorithm)
   - 提供 TypeScript 类型定义进行类型检查
   - 在应用程序中无缝集成

2. **关键组件**:
   - `crypto-wrapper.js`: 直接加载 native 模块并提供包装类
   - `crypto-bridge.ts`: 为 TypeScript 提供类型安全的接口
   - `examples/cryptoExample.ts`: 提供使用示例

3. **功能特性**:
   - AES-256-GCM 加密算法
   - 机器绑定的加密 (需要有效的机器 ID)
   - 简单易用的 API

## 如何使用

在你的代码中使用加密功能的步骤：

### 1. 导入

```typescript
import { CryptoUtils } from '../utils/crypto-bridge';
```

### 2. 初始化

在使用加密/解密功能之前，必须先初始化 CryptoUtils 以获取机器 ID：

```typescript
await CryptoUtils.initialize();
```

### 3. 加密数据

```typescript
const password = '您的安全密码';
const sensitiveData = '需要加密的敏感信息';

const encrypted = await CryptoUtils.encrypt(sensitiveData, password);
console.log(`加密后: ${encrypted}`);
```

### 4. 解密数据

```typescript
const decrypted = await CryptoUtils.decrypt(encrypted, password);
console.log(`解密后: ${decrypted}`);
```

### 5. 获取机器 ID (可选)

```typescript
const machineId = await CryptoUtils.getMachineId();
console.log(`当前机器 ID: ${machineId}`);
```

## 示例代码

完整的加密/解密示例可在 `src/kernel/app.ts` 中的 `testCryptoUtils` 函数中找到：

```typescript
async function testCryptoUtils() {
  await CryptoUtils.initialize();
  
  const testText = '这是一段需要加密的测试文本';
  const password = 'test-password-123';
  
  const encrypted = await CryptoUtils.encrypt(testText, password);
  const decrypted = await CryptoUtils.decrypt(encrypted, password);
  
  if (decrypted === testText) {
    console.log('✅ 加密解密测试成功!');
  }
}
```

## 安全考虑

1. **密码管理**: 请安全地存储密码，切勿明文保存
2. **机器绑定**: 请注意，在一台机器上加密的数据只能在同一台机器上解密
3. **错误处理**: 始终优雅地处理加密/解密错误

## 技术附注

1. **为什么这样实现?**
   - 避免了 webpack 打包 native 模块时的各种问题
   - 使用 JavaScript 直接 require 的方式更简单可靠
   - 通过 TypeScript 接口保持了类型安全
   
2. **调试技巧**
   - 如遇问题，检查机器 ID 是否正确获取
   - 确保使用相同的密码进行加密和解密
   - 查看控制台错误日志获取更多信息 