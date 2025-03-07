import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import instrumentsForex from './data/instrumentsForex.json' assert { type: "json" };
import instrumentsStocks from './data/instrumentsStocks.json' assert { type: "json" };
import proxies from './data/proxylist.json' assert { type: "json" };
import accounts from './data/accounts.json' assert { type: "json" };
import proxyauth from './data/proxyauth.json' assert {type: "json"};

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalIterations = 0;

// Create a worker file for forex processing
// Create a new file called worker-forex.js in the project root directory
instrumentsForex.forEach((instrument, index) => {
  const account = accounts[totalIterations % accounts.length];
  const proxy = proxies[totalIterations % proxies.length];
  
  // Fork a new process for each instrument
  const child = fork(path.join(__dirname, 'worker-forex.js'));
  
  // Send data to the worker
  child.send({
    instrument,
    account,
    proxy,
    proxyauth
  });
  
  // Log any messages from the worker
  child.on('message', (message) => {
    console.log(`[${instrument}] ${message}`);
  });
  
  totalIterations++;
});

/*
// For stocks, similar approach could be used
instrumentsStocks.forEach((instrument, index) => {
  const proxy = proxies[totalIterations % proxies.length];
  
  const child = fork(path.join(__dirname, 'worker-stocks.js'));
  
  child.send({
    instrument,
    proxy,
    proxyauth
  });
  
  child.on('message', (message) => {
    console.log(`[${instrument}] ${message}`);
  });
  
  totalIterations++;
});
*/