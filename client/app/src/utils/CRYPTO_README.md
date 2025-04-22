# Rust-based Encryption in Client App

This module provides secure encryption and decryption functionality for the client application, powered by Rust.

## Features

- AES-256-GCM encryption algorithm
- Machine-specific encryption (requires valid machine ID)
- Simple API for encryption/decryption operations

## Installation

The encryption functionality relies on the `algorithm` Rust module. Make sure it's correctly referenced in your `package.json`:

```json
"dependencies": {
  "algorithm": "file:../../algorithm",
  // other dependencies
}
```

Run `npm install` or `yarn` to install the dependency.

## Usage

### Basic Usage

```typescript
import { CryptoUtils } from './utils/crypto';

async function example() {
  // Initialize (gets machine ID)
  await CryptoUtils.initialize();
  
  // Encrypt data
  const password = 'your-secret-password';
  const sensitiveData = 'This is sensitive information';
  
  const encrypted = await CryptoUtils.encrypt(sensitiveData, password);
  console.log('Encrypted:', encrypted);
  
  // Decrypt data
  const decrypted = await CryptoUtils.decrypt(encrypted, password);
  console.log('Decrypted:', decrypted);
}

example().catch(console.error);
```

### Example Module

See `src/examples/cryptoExample.ts` for more usage examples, including:

- Encrypting sensitive data
- Decrypting data
- Saving encrypted data to files
- Loading and decrypting data from files

## Security Considerations

1. **Machine Binding**: Encryption is bound to the machine ID. Data encrypted on one machine can only be decrypted on the same machine.

2. **Password Management**: Choose strong passwords and handle them securely. The module doesn't manage password storage.

3. **Error Handling**: Always implement proper error handling, as encryption/decryption can fail for various reasons.

## Troubleshooting

- If you get errors about missing native modules, make sure the algorithm package is correctly built for your platform.
- For cross-platform development, you may need to rebuild the algorithm package on each platform.

## Under the Hood

The encryption functionality is implemented in Rust using the AES-256-GCM algorithm with the following components:

- Key derivation from password
- Random nonce generation for each encryption
- Machine ID verification
- Base64 encoding for storage/transport 