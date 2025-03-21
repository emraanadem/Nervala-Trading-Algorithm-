import { checkForSignals as checkForex } from './src/datacenter-forex.js';

// Listen for messages from the parent process
process.on('message', async (data) => {
  const { instrument, account, proxy, proxyauth } = data;
  
  // Log the instrument being processed
  
  try {
    // CRITICAL FIX: Remove the await - we DON'T want to wait for this to complete
    // since it's an infinite loop that will never resolve
    
    // Start the infinite loop without awaiting it
    checkForex(instrument, account, proxy, proxyauth, true)
      .catch(err => {
        // This should never happen since we handle errors inside checkForex
        process.send(`CRITICAL ERROR: Main loop for ${instrument} failed: ${err.message}`);
        
        // If somehow the main loop exits, try to restart it
        setTimeout(() => {
          process.send(`Attempting to restart main loop for ${instrument}`);
          checkForex(instrument, account, proxy, proxyauth, true).catch(e => {
            process.send(`Failed to restart ${instrument}: ${e.message}`);
          });
        }, 5000);
      });
      
    // This keeps the worker process running without exiting
    // We don't want to exit as we're running the loop in the background
  } catch (error) {
    process.send(`Error initializing ${instrument}: ${error.message}`);
    
    // Try to restart after a delay
    setTimeout(() => {
      process.send(`Restarting analysis for ${instrument} after initialization error`);
      try {
        checkForex(instrument, account, proxy, proxyauth, true).catch(e => {
          process.send(`Continuous error in ${instrument}: ${e.message}`);
        });
      } catch (continueError) {
        process.send(`Failed to restart ${instrument}: ${continueError.message}`);
      }
    }, 10000);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  process.exit(0);
}); 