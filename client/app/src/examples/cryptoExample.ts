import { CryptoUtils } from '../utils/crypto-bridge';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Example functions showing how to use the Rust-based encryption utilities
 * in the client application
 */

/**
 * Example: Encrypt sensitive data
 * 
 * @param data Data to encrypt
 * @param password Password for encryption
 * @returns Encrypted data as a string
 */
export async function encryptSensitiveData(data: string, password: string): Promise<string> {
  try {
    // Initialize crypto utils (will get machine ID internally)
    await CryptoUtils.initialize();
    
    // Encrypt the data
    const encrypted = await CryptoUtils.encrypt(data, password);
    console.log('Data encrypted successfully');
    
    return encrypted;
  } catch (error) {
    console.error('Failed to encrypt data:', error);
    throw error;
  }
}

/**
 * Example: Decrypt sensitive data
 * 
 * @param encryptedData Encrypted data string
 * @param password Password used for encryption
 * @returns Decrypted data as a string
 */
export async function decryptSensitiveData(encryptedData: string, password: string): Promise<string> {
  try {
    // Initialize crypto utils (will get machine ID internally)
    await CryptoUtils.initialize();
    
    // Decrypt the data
    const decrypted = await CryptoUtils.decrypt(encryptedData, password);
    console.log('Data decrypted successfully');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    throw error;
  }
}

/**
 * Example: Save encrypted data to a file
 * 
 * @param data Data to encrypt and save
 * @param password Password for encryption
 * @param filePath Path to save the encrypted data
 */
export async function saveEncryptedData(data: string, password: string, filePath: string): Promise<void> {
  try {
    const encrypted = await encryptSensitiveData(data, password);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await fs.ensureDir(dir);
    
    // Write encrypted data to file
    await fs.writeFile(filePath, encrypted, 'utf8');
    console.log(`Encrypted data saved to ${filePath}`);
  } catch (error) {
    console.error('Failed to save encrypted data:', error);
    throw error;
  }
}

/**
 * Example: Load and decrypt data from a file
 * 
 * @param filePath Path to encrypted file
 * @param password Password for decryption
 * @returns Decrypted data as a string
 */
export async function loadAndDecryptData(filePath: string, password: string): Promise<string> {
  try {
    // Read encrypted data from file
    const encrypted = await fs.readFile(filePath, 'utf8');
    
    // Decrypt the data
    const decrypted = await decryptSensitiveData(encrypted, password);
    return decrypted;
  } catch (error) {
    console.error('Failed to load and decrypt data:', error);
    throw error;
  }
} 