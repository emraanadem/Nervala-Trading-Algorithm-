// Test script for MetaTrader connection
import { testConnection, sendSignal } from './src/metatrader-connector.js';
import fs from 'fs';
import path from 'path';

async function checkMT5Files() {
  console.log("Checking MetaTrader 5 file paths...");
  
  // Check common paths for MT5 on MacOS
  const basePath = '/Users/emraan.adem/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Files';
  
  console.log(`Base path: ${basePath}`);
  console.log(`Exists: ${fs.existsSync(basePath)}`);
  
  // Check if we can create and write to command file
  const cmdFile = path.join(basePath, 'mt5_commands.txt');
  try {
    fs.writeFileSync(cmdFile, 'PING\n');
    console.log(`Successfully wrote to command file: ${cmdFile}`);
  } catch (error) {
    console.error(`Failed to write to command file: ${error.message}`);
  }
  
  // List files in directory
  try {
    const files = fs.readdirSync(basePath);
    console.log(`Files in directory: ${JSON.stringify(files)}`);
  } catch (error) {
    console.error(`Failed to list directory: ${error.message}`);
  }
}

async function runTest() {
  console.log("=== MetaTrader 5 Connection Test ===");
  
  // First check file paths
  await checkMT5Files();
  
  // Now test the connection
  console.log("\nTesting connection to MetaTrader 5...");
  const result = await testConnection();
  
  if (result) {
    console.log("✅ Connection successful!");
  } else {
    console.log("❌ Connection failed!");
    console.log("\nTroubleshooting steps:");
    console.log("1. Make sure MetaTrader 5 is running");
    console.log("2. Verify the MT5-Simple-Bridge EA is attached to a chart");
    console.log("3. Check that 'Allow DLL imports' is enabled in the EA settings");
    console.log("4. Ensure the MT5/MQL5/Files directory has proper permissions");
  }
  
  // Send a test signal
  console.log("\nSending a test trading signal...");
  try {
    const signal = await sendSignal('BUY', 'EURUSD', 1.0500, 1.0800, 0.01, 'Test');
    console.log(`Signal response: ${signal}`);
  } catch (error) {
    console.error(`Error sending signal: ${error.message}`);
  }
}

runTest().catch(error => {
  console.error("Test failed:", error);
}); 