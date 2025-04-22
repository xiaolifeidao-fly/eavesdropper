import test from 'ava'

import { sum, encrypt, decrypt, getCurrentMachineId } from '../index.js'

// Keep the original test for backward compatibility
test('sum from native', (t) => {
  t.is(sum(1, 2), 3)
})

// Get the current machine ID for testing
test('get current machine ID', async (t) => {
  const machineId = await getCurrentMachineId()
  t.true(typeof machineId === 'string' && machineId.length > 0)
  console.log('Current machine ID:', machineId)
})

// Test encryption with valid machine ID
test('encrypt with valid machine ID', async (t) => {
  const machineId = await getCurrentMachineId()
  const plaintext = 'Hello, world!'
  const password = 'secret-password'
  
  const encrypted = await encrypt(plaintext, password, machineId)
  t.true(typeof encrypted === 'string' && encrypted.length > 0)
  t.true(encrypted.includes(':')) // Format should be nonce:ciphertext
})

// Test decryption with valid machine ID and valid ciphertext
test('decrypt with valid machine ID', async (t) => {
  const machineId = await getCurrentMachineId()
  const plaintext = 'Hello, world!'
  const password = 'secret-password'
  
  const encrypted = await encrypt(plaintext, password, machineId)
  const decrypted = await decrypt(encrypted, password, machineId)
  
  t.is(decrypted, plaintext)
})

// Test encryption with invalid machine ID
// Should still "work" but produce garbage output
test('encrypt with invalid machine ID', async (t) => {
  const machineId = await getCurrentMachineId()
  const fakeMachineId = 'fake-machine-id'
  const plaintext = 'Hello, world!'
  const password = 'secret-password'
  
  const encrypted = await encrypt(plaintext, password, fakeMachineId)
  t.true(typeof encrypted === 'string' && encrypted.length > 0)
  
  // Should be able to decrypt, but result should not match original
  try {
    // This might throw an error or return different content
    const decrypted = await decrypt(encrypted, password, machineId)
    t.not(decrypted, plaintext) // Should not match original
  } catch (error) {
    // If it throws, that's also acceptable
    t.pass()
  }
})

// Test decryption with invalid machine ID
// Should reject with authentication error
test('decrypt with invalid machine ID', async (t) => {
  const machineId = await getCurrentMachineId()
  const fakeMachineId = 'fake-machine-id'
  const plaintext = 'Hello, world!'
  const password = 'secret-password'
  
  const encrypted = await encrypt(plaintext, password, machineId)
  
  // Should fail with authentication error
  await t.throwsAsync(async () => {
    await decrypt(encrypted, password, fakeMachineId)
  }, { message: /Authentication failed/ })
})

// Test with different passwords
test('encryption with different passwords produces different results', async (t) => {
  const machineId = await getCurrentMachineId()
  const plaintext = 'Same message'
  const password1 = 'password1'
  const password2 = 'password2'
  
  const encrypted1 = await encrypt(plaintext, password1, machineId)
  const encrypted2 = await encrypt(plaintext, password2, machineId)
  
  t.not(encrypted1, encrypted2)
})

// Test decryption with wrong password
test('decrypt with wrong password should fail', async (t) => {
  const machineId = await getCurrentMachineId()
  const plaintext = 'Hello, world!'
  const password = 'correct-password'
  const wrongPassword = 'wrong-password'
  
  const encrypted = await encrypt(plaintext, password, machineId)
  
  // Should fail with decryption error
  await t.throwsAsync(async () => {
    await decrypt(encrypted, wrongPassword, machineId)
  }, { message: /Decryption failed/ })
})
