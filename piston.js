const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load JSON files
const instrumentsForex = require('./data/instrumentsForex.json');
const instrumentsStocks = require('./data/instrumentsStocks.json');
const proxies = require('./data/proxylist.json');
const accounts = require('./data/accounts.json');
const proxyauth = require('./data/proxyauth.json');

// __dirname is already defined in CommonJS

// Define the instruments to monitor continuously
const instruments = [
  'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'USD_CAD', 'AUD_USD', 'NZD_USD',
  'EUR_JPY', 'EUR_GBP', 'EUR_CHF', 'EUR_CAD', 'EUR_AUD', 'EUR_NZD',
  'GBP_JPY', 'GBP_CHF', 'GBP_CAD', 'GBP_AUD', 'GBP_NZD',
  'AUD_JPY', 'AUD_CAD', 'AUD_CHF', 'AUD_NZD',
  'NZD_JPY', 'NZD_CAD', 'NZD_CHF',
  'CAD_JPY', 'CAD_CHF', 'CHF_JPY',
  'US30_USD', 'SPX500_USD', 'NAS100_USD', 'JP225_USD', 'UK100_GBP', 'DE30_EUR',
  'XAU_USD', 'XAG_USD', 'BCO_USD', 'WTICO_USD',
  'BTC_USD', 'ETH_USD'
];

// Make sure we're looping through ALL instruments
console.log(`Will process ${instruments.length} instruments (should be 40)`);

// Configure the worker pool
const MAX_WORKERS = 40; // Adjust based on system capabilities
const workerPool = new Map(); // Track active workers by instrument
let activeWorkers = 0;

// Start a worker for a specific instrument
function startWorkerForInstrument(instrument, accountIndex, proxyIndex) {
  const account = accounts[accountIndex % accounts.length];
  const proxy = proxies[proxyIndex % proxies.length];
  
  
  // Start a worker process for this instrument
  const worker = fork(path.join(__dirname, 'worker-forex.js'), [], {
    execArgv: ['--max-old-space-size=500']
  });
  
  // Track the worker
  workerPool.set(instrument, worker);
  activeWorkers++;
  
  // Send the instrument data to worker
  worker.send({
    instrument,
    account,
    proxy,
    proxyauth
  });
  
  // Handle messages from the worker
  worker.on('message', (message) => {
    console.log(`[${instrument}] ${message}`);
  });
  
  // Handle worker crash/exit and restart it
  worker.on('exit', (code) => {
    console.log(`Worker for ${instrument} exited with code ${code}. Restarting...`);
    
    // Clean up
    workerPool.delete(instrument);
    activeWorkers--;
    
    // Run garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });
  
  // Handle errors
  worker.on('error', (error) => {
    console.error(`Worker error for ${instrument}:`, error);
  });
  
  return worker;
}

// Start workers for all instruments
function startAllWorkers() {
  console.log(`Starting workers for all ${instruments.length} instruments`);
  
  // Start a worker for EACH instrument - no MAX_WORKERS limit
  for (let i = 0; i < instruments.length; i++) {
    const instrument = instruments[i];
    startWorkerForInstrument(instrument, i, i);
  }
}

// Start all workers
startAllWorkers();

// Log status periodically
setInterval(() => {
  
  // Check if any workers have died and aren't in the pool anymore
  for (const instrument of instruments) {
    if (!workerPool.has(instrument)) {
      console.log(`Missing worker for ${instrument}, restarting...`);
      // Get a pseudo-random index for account/proxy rotation
      const randomIndex = Math.floor(Date.now() / 1000) % accounts.length;
      startWorkerForInstrument(instrument, randomIndex, randomIndex);
    }
  }
}, 60000); // Check every minute

// Handle cleanup when script exits
process.on('SIGINT', () => {
  console.log('Shutting down all workers...');
  
  // Kill all active workers
  for (const worker of workerPool.values()) {
    worker.kill();
  }
  
  console.log(`Shutting down continuous monitoring of ${instruments.length} instruments.`);
  process.exit(0);
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