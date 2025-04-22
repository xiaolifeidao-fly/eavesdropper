# Client App

<!-- Add existing content here -->

## New Feature: Rust-based Encryption

This application now includes secure encryption and decryption capabilities powered by Rust. This feature allows you to:

- Encrypt sensitive data with AES-256-GCM algorithm
- Decrypt encrypted data
- Bind encryption to the specific machine for added security

### Using the Encryption API

The encryption functionality is exposed through a simple API:

```typescript
import { CryptoUtils } from './utils/crypto';

// Initialize the crypto utilities
await CryptoUtils.initialize();

// Encrypt data
const encrypted = await CryptoUtils.encrypt('sensitive data', 'your-password');

// Decrypt data
const decrypted = await CryptoUtils.decrypt(encrypted, 'your-password');
```

### Examples

Check out the following locations for examples and documentation:

- `src/utils/crypto.ts` - The main API implementation
- `src/examples/cryptoExample.ts` - Usage examples
- `src/utils/CRYPTO_README.md` - Detailed documentation
- `test/crypto-test.js` - Test script for verifying functionality

### Running the Test

To verify the encryption functionality:

```
npm run build  # Build the project
node test/crypto-test.js  # Run the test script
```

### Security Notes

- Encryption is bound to the machine ID, so data encrypted on one machine can only be decrypted on the same machine
- Choose strong passwords for encryption
- Implement proper error handling in your application 