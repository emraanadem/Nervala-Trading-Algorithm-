const { fork } = require('child_process');
const path = require('path');

// Handle messages from the parent process
process.on('message', (data) => {
  const { instrument } = data;
  
  // Log what we're handling
  console.log(`Wrapper handling instrument: ${instrument}`);
  
  // Create the actual worker
  const workerPath = path.join(process.cwd(), 'worker-forex.js');
  const worker = fork(workerPath);
  
  // Forward the data to the worker
  worker.send(data);
  
  // Forward messages from worker back to parent
  worker.on('message', (message) => {
    process.send(message);
  });
  
  // Handle worker exit
  worker.on('exit', (code) => {
    if (code !== 0) {
      process.send(`Worker for ${instrument} exited with code ${code}`);
    }
    process.exit(code);
  });
}); 