import { spawn } from 'child_process';
import path from 'path';

// Track the algorithm process globally
let algorithmProcess = null;

// Function to handle algorithm output and parse trade signals
function handleAlgorithmOutput(data) {
  console.log(`Algorithm output: ${data}`);
  
  // No need to parse trade signals here as each algorithm test function
  // will call sendSignal which will handle storing trades in the tradeStore
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // If the algorithm is already running, don't start it again
  if (algorithmProcess) {
    return res.status(200).json({ 
      status: 'Already running',
      message: 'Trading algorithm is already running'
    });
  }

  try {
    // Path to piston.js entry point
    const pistonPath = path.resolve(process.cwd(), 'piston.js');
    
    // Spawn the algorithm process
    algorithmProcess = spawn('node', [pistonPath], {
      env: { ...process.env, NODE_ENV: 'production' },
      detached: true, // Run in the background
    });
    
    // Log process information
    console.log(`Started trading algorithm process with PID: ${algorithmProcess.pid}`);
    
    // Handle process output
    algorithmProcess.stdout.on('data', (data) => {
      handleAlgorithmOutput(data);
    });
    
    // Handle process errors
    algorithmProcess.stderr.on('data', (data) => {
      console.error(`Algorithm error: ${data}`);
    });
    
    // Handle process exit
    algorithmProcess.on('close', (code) => {
      console.log(`Algorithm process exited with code ${code}`);
      
      // Reset the process variable
      algorithmProcess = null;
      
      // Attempt to restart the algorithm if it crashes
      if (code !== 0) {
        setTimeout(() => {
          // Restart the algorithm process
          const restartPath = path.resolve(process.cwd(), 'piston.js');
          algorithmProcess = spawn('node', [restartPath], {
            env: { ...process.env, NODE_ENV: 'production' },
            detached: true,
          });
          
          console.log(`Restarted algorithm process with PID: ${algorithmProcess.pid}`);
          
          // Set up event handlers for the restarted process
          algorithmProcess.stdout.on('data', handleAlgorithmOutput);
          
          algorithmProcess.stderr.on('data', (data) => {
            console.error(`Algorithm error after restart: ${data}`);
          });
          
          algorithmProcess.on('close', (code) => {
            console.log(`Restarted algorithm process exited with code ${code}`);
            algorithmProcess = null;
          });
        }, 5000); // Wait 5 seconds before restarting
      }
    });
    
    // Return success response
    return res.status(200).json({ 
      status: 'Started',
      message: 'Trading algorithm started successfully',
      pid: algorithmProcess.pid
    });
  } catch (error) {
    console.error('Error starting algorithm:', error);
    
    // Reset the process variable if there was an error
    algorithmProcess = null;
    
    return res.status(500).json({ 
      error: 'Failed to start trading algorithm',
      message: error.message
    });
  }
}

// Ensure the process is cleaned up on server shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    if (algorithmProcess) {
      algorithmProcess.kill();
      algorithmProcess = null;
    }
  });
  
  process.on('SIGINT', () => {
    if (algorithmProcess) {
      algorithmProcess.kill();
      algorithmProcess = null;
    }
  });
} 