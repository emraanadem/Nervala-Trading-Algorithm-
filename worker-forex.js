import { checkForSignals as checkForex } from './src/datacenter-forex.js';

// Listen for messages from the parent process
process.on('message', (data) => {
  const { instrument, account, proxy, proxyauth } = data;  
  try {
    // Run the check signals function with the provided data
    checkForex(instrument, account, proxy, proxyauth);
    
    // If you want to send results back to parent process:
  
  } catch (error) {
    console.error(`Error processing ${instrument}:`, error)
  }
});

// Optional: Handle process termination
process.on('SIGTERM', () => {
  process.exit(0);
}); 