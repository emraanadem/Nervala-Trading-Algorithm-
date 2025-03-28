import { spawn } from 'child_process';
import path from 'path';

// Sample trade data for development
const sampleTrades = [
  {
    id: 1,
    pair: 'EUR_USD',
    timeframe: '15m',
    direction: 'buy',
    entry: 1.0876,
    takeProfit: 1.0910,
    stopLoss: 1.0855,
    riskReward: 1.21,
    status: 'open',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    pair: 'GBP_USD',
    timeframe: '1h',
    direction: 'sell',
    entry: 1.2635,
    takeProfit: 1.2590,
    stopLoss: 1.2665,
    riskReward: 1.5,
    status: 'win',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 3,
    pair: 'USD_JPY',
    timeframe: '4h',
    direction: 'buy',
    entry: 148.50,
    takeProfit: 149.20,
    stopLoss: 148.15,
    riskReward: 2.0,
    status: 'loss',
    timestamp: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: 4,
    pair: 'BTC_USD',
    timeframe: 'D',
    direction: 'buy',
    entry: 51240,
    takeProfit: 52500,
    stopLoss: 50500,
    riskReward: 1.7,
    status: 'open',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 5,
    pair: 'EUR_USD',
    timeframe: '30m',
    direction: 'sell',
    entry: 1.0890,
    takeProfit: 1.0860,
    stopLoss: 1.0905,
    riskReward: 2.0,
    status: 'open',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

// Collection of trades from algorithm execution
let liveTradesBuffer = [];

// Function to run the algorithm and capture trade signals
function spawnAlgorithmProcess() {
  try {
    // Path to your piston.js file
    const pistonPath = path.resolve(process.cwd(), 'piston.js');
    
    // Spawn the process
    const algorithmProcess = spawn('node', [pistonPath], {
      env: { ...process.env, NODE_ENV: 'production' },
    });
    
    // Collect trade signals from stdout
    algorithmProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Parse the output for trade signals
      // This regex pattern would need to be adjusted based on your algorithm's output format
      const tradePattern = /TRADE: ([A-Z_]+) \(([0-9A-Z]+)\) (BUY|SELL) @ ([0-9.]+) SL: ([0-9.]+) TP: ([0-9.]+)/gi;
      let match;
      
      while ((match = tradePattern.exec(output)) !== null) {
        const [_, pair, timeframe, direction, entry, stopLoss, takeProfit] = match;
        
        // Calculate risk-reward ratio
        const entryPrice = parseFloat(entry);
        const slPrice = parseFloat(stopLoss);
        const tpPrice = parseFloat(takeProfit);
        const riskPips = Math.abs(entryPrice - slPrice);
        const rewardPips = Math.abs(entryPrice - tpPrice);
        const riskReward = (rewardPips / riskPips).toFixed(2);
        
        // Create trade object
        const trade = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          pair,
          timeframe,
          direction: direction.toLowerCase(),
          entry: entryPrice,
          takeProfit: tpPrice,
          stopLoss: slPrice,
          riskReward,
          status: 'open',
          timestamp: new Date().toISOString()
        };
        
        // Add to buffer
        liveTradesBuffer.push(trade);
        
        // Keep buffer size manageable
        if (liveTradesBuffer.length > 100) {
          liveTradesBuffer.shift();
        }
      }
    });
    
    // Handle errors
    algorithmProcess.stderr.on('data', (data) => {
      console.error(`Algorithm Error: ${data}`);
    });
    
    // Handle process exit
    algorithmProcess.on('close', (code) => {
      console.log(`Algorithm process exited with code ${code}`);
      // Restart the process after a delay if it crashes
      if (code !== 0) {
        setTimeout(spawnAlgorithmProcess, 5000);
      }
    });
    
    return algorithmProcess;
  } catch (error) {
    console.error('Failed to spawn algorithm process:', error);
    return null;
  }
}

// Start the algorithm in development mode if needed
let algorithmProcess = null;
if (process.env.NODE_ENV !== 'production') {
  // In development, we'll use sample data instead of running the algorithm
  console.log('Using sample trade data in development mode');
} else {
  // In production, spawn the algorithm process
  algorithmProcess = spawnAlgorithmProcess();
}

export default function handler(req, res) {
  const { pair, timeframe } = req.query;
  
  // Decide whether to use sample data or live data
  const trades = liveTradesBuffer.length > 0 ? liveTradesBuffer : sampleTrades;
  
  // Filter trades based on query parameters
  let filteredTrades = [...trades];
  
  if (pair) {
    filteredTrades = filteredTrades.filter(trade => trade.pair === pair);
  }
  
  if (timeframe) {
    filteredTrades = filteredTrades.filter(trade => trade.timeframe === timeframe);
  }
  
  // Sort by most recent first
  filteredTrades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.status(200).json({ trades: filteredTrades });
}

// Clean up process on server shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', () => {
    if (algorithmProcess) {
      algorithmProcess.kill();
    }
    process.exit(0);
  });
} 