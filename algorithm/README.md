# Algorithm - Encryption/Decryption Library

This library provides encryption and decryption functions with machine ID verification for Node.js applications.

## Features

- AES-256-GCM encryption and decryption
- Machine ID verification to ensure only authorized machines can decrypt data
- Fallback to random data encryption if verification fails
- Written in Rust and exposed to Node.js through NAPI

## Installation

```bash
npm install algorithm
# or
yarn add algorithm
```

## Usage

### Get Current Machine ID

To get the current machine ID, which is required for authentication:

```javascript
import { getCurrentMachineId } from 'algorithm';

async function getMachineId() {
  const machineId = await getCurrentMachineId();
  console.log(`Current machine ID: ${machineId}`);
  return machineId;
}
```

### Encrypt Data

To encrypt data with machine ID verification:

```javascript
import { encrypt, getCurrentMachineId } from 'algorithm';

async function encryptData(data, password) {
  const machineId = await getCurrentMachineId();
  const encrypted = await encrypt(data, password, machineId);
  return encrypted;
}
```

If the provided machine ID doesn't match the current machine ID, the function will still return encrypted data, but it will be a random string of the same length as the input data.

### Decrypt Data

To decrypt data with machine ID verification:

```javascript
import { decrypt, getCurrentMachineId } from 'algorithm';

async function decryptData(encryptedData, password) {
  const machineId = await getCurrentMachineId();
  try {
    const decrypted = await decrypt(encryptedData, password, machineId);
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw error;
  }
}
```

If the provided machine ID doesn't match the current machine ID, the function will throw an authentication error.

## Example

```javascript
import { encrypt, decrypt, getCurrentMachineId } from 'algorithm';

async function main() {
  try {
    const machineId = await getCurrentMachineId();
    const password = 'secret-password';
    const message = 'This is a secret message';
    
    // Encrypt with valid machine ID
    const encrypted = await encrypt(message, password, machineId);
    console.log(`Encrypted: ${encrypted}`);
    
    // Decrypt with valid machine ID
    const decrypted = await decrypt(encrypted, password, machineId);
    console.log(`Decrypted: ${decrypted}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## API Reference

### getCurrentMachineId()

Returns a Promise that resolves to the current machine ID as a string.

### encrypt(plaintext, password, machineId)

Parameters:
- `plaintext` (string): The data to encrypt
- `password` (string): The password used for encryption
- `machineId` (string): The machine ID for verification

Returns a Promise that resolves to the encrypted data as a string in the format `nonce:ciphertext`.

### decrypt(ciphertext, password, machineId)

Parameters:
- `ciphertext` (string): The encrypted data in the format `nonce:ciphertext`
- `password` (string): The password used for decryption
- `machineId` (string): The machine ID for verification

Returns a Promise that resolves to the decrypted data as a string. Throws an error if authentication or decryption fails.

## Building from Source

```bash
# Build release version
npm run build
# or
yarn build

# Run tests
npm test
# or
yarn test
```

## License

MIT

## Windows 支持

本项目支持Windows平台。如果你是在非Windows平台上构建Windows版本，需要执行以下步骤：

1. 安装Windows目标平台的Rust工具链：
   ```bash
   npm run setup:win-target
   # 或直接执行
   rustup target add x86_64-pc-windows-msvc
   ```

2. 构建Windows版本：
   ```bash
   npm run build:win
   ```

3. 如果在Windows平台上遇到"not a valid Win32 application"错误，请确保：
   - 使用了正确的交叉编译工具链
   - 构建过程中没有错误
   - Windows版本的.node文件位于正确的位置（项目根目录和win32-x64-msvc子目录） 