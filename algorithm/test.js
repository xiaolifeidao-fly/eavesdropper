// Cross-platform test script for the algorithm native module
const path = require('path');
const { platform, arch } = process;
const os = require('os');

// Import the module using the regular import which should handle platform detection
const algorithm = require('./index.js');

async function runTests() {
  console.log('Running tests for the algorithm native module');
  console.log(`Platform: ${platform}, Architecture: ${arch}`);
  console.log(`OS: ${os.type()} ${os.release()}, Hostname: ${os.hostname()}`);
  console.log('---------------------------------------------------');
  
  try {
    // Test the machine ID function
    console.log('Testing getCurrentMachineId:');
    const machineId = algorithm.getCurrentMachineId();
    console.log(`Current machine ID: ${machineId}`);
    
    // Test encryption and decryption
    const password = 'test-password-123';
    const message = 'This is a secret message that needs to be encrypted';
    
    console.log('\nTesting encryption and decryption:');
    console.log(`Original message: ${message}`);
    
    // Encrypt with valid machine ID
    const encrypted = algorithm.encrypt(message, password, machineId);
    console.log(`Encrypted: ${encrypted}`);
    
    // Decrypt with valid machine ID
    const decrypted = algorithm.decrypt(encrypted, password, machineId);
    console.log(`Decrypted: ${decrypted}`);
    
    if (decrypted === message) {
      console.log('✅ PASS: Encryption/decryption test successful');
    } else {
      console.log('❌ FAIL: Decrypted text does not match original');
    }
    
    // Test sum function
    if (typeof algorithm.sum === 'function') {
      console.log('\nTesting sum function:');
      const a = 5, b = 7;
      const result = algorithm.sum(a, b);
      console.log(`Sum of ${a} + ${b} = ${result}`);
      
      if (result === a + b) {
        console.log('✅ PASS: Sum test successful');
      } else {
        console.log('❌ FAIL: Sum test failed');
      }
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\n❌ TEST FAILURE:', error);
    process.exit(1);
  }
}

runTests(); 