// Example usage of the encryption/decryption library

const { encrypt, decrypt, getCurrentMachineId } = require('./index.js');

async function main() {
  try {
    // Get the current machine ID
    const machineId = await getCurrentMachineId();
    console.log(`Current machine ID: ${machineId}`);
    
    const password = 'your-secret-password';
    const message = 'This is a secret message that needs to be encrypted';
    
    console.log('\n--- Successful Encryption/Decryption ---');
    console.log(`Original message: ${message}`);
    
    // Encrypt with valid machine ID
    const encrypted = await encrypt(message, password, machineId);
    console.log(`Encrypted: ${encrypted}`);
    
    // Decrypt with valid machine ID
    const decrypted = await decrypt(encrypted, password, machineId);
    console.log(`Decrypted: ${decrypted}`);
    
    // Demonstrate what happens with invalid machine ID
    console.log('\n--- Invalid Machine ID Scenario ---');
    const fakeMachineId = 'fake-machine-id';
    
    // Encrypt with invalid machine ID (will encrypt random data instead)
    const encryptedWithFakeId = await encrypt(message, password, fakeMachineId);
    console.log(`Encrypted with fake ID: ${encryptedWithFakeId}`);
    
    // Try to decrypt with invalid machine ID (will fail)
    try {
      await decrypt(encrypted, password, fakeMachineId);
      console.log('Decryption with fake ID succeeded (should not happen)');
    } catch (error) {
      console.log(`Decryption with fake ID failed as expected: ${error.message}`);
    }
    
    // Try to decrypt the data encrypted with fake ID
    try {
      const decryptedFake = await decrypt(encryptedWithFakeId, password, machineId);
      console.log(`Decrypted content from fake ID encryption: ${decryptedFake}`);
      console.log('Note: This is not the original message because encryption with fake ID generates random data');
    } catch (error) {
      console.log(`Failed to decrypt data encrypted with fake ID: ${error.message}`);
    }
    
    console.log('\n--- Wrong Password Scenario ---');
    const wrongPassword = 'wrong-password';
    
    // Try to decrypt with wrong password
    try {
      await decrypt(encrypted, wrongPassword, machineId);
      console.log('Decryption with wrong password succeeded (should not happen)');
    } catch (error) {
      console.log(`Decryption with wrong password failed as expected: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 