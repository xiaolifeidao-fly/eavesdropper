// Direct load test for macOS
const path = require('path');

try {
  const nativeBinding = require('./darwin-x64/algorithm.darwin-x64.node');
  console.log('Successfully loaded native module!');
  console.log('Available functions:', Object.keys(nativeBinding));
  
  // Try to get machine ID if that function exists
  if (nativeBinding.getCurrentMachineId) {
    try {
      const machineId = nativeBinding.getCurrentMachineId();
      console.log(`Current machine ID: ${machineId}`);
    } catch (err) {
      console.error('Error getting machine ID:', err);
    }
  }
  
  // Simple test with the sum function if it exists
  if (nativeBinding.sum) {
    const result = nativeBinding.sum(5, 7);
    console.log(`Sum result: 5 + 7 = ${result}`);
  }
} catch (error) {
  console.error('Failed to load native module:', error);
} 