const fs = require('fs');
const path = require('path');
const { addTrade, updateTrade } = require('./utils/index.js');

// Configuration
const COMMANDS_FILE = 'mt5_commands.txt';
const RESPONSES_FILE = 'mt5_responses.txt';

// Find the common files directory
// For Windows: Usually in C:\Users\{username}\AppData\Roaming\MetaQuotes\Terminal\Common\Files
// For Mac/Wine: Check within the Wine environment
const findCommonFilesDir = () => {
  // Mac-specific path for MetaTrader 5 running under Wine/CrossOver
  const macMT5Path = '/Users/emraan.adem/Library/Application Support/MetaTrader 5/Bottles/metatrader5/drive_c/Program Files/MetaTrader 5/MQL5/Files';
  
  if (process.env.MT5_COMMON_FILES) {
    return process.env.MT5_COMMON_FILES;
  }
  
  if (fs.existsSync(macMT5Path)) {
    return macMT5Path;
  }
  
  return '.';
};

class MetaTraderConnector {
  constructor() {
    this.commonFilesDir = findCommonFilesDir();
    this.commandsFile = path.join(this.commonFilesDir, COMMANDS_FILE);
    this.responsesFile = path.join(this.commonFilesDir, RESPONSES_FILE);
    this.connected = false;
    this.lastResponse = null;
    this.polling = false;
    this.pollInterval = null;
  }
  
  // Connect to MetaTrader (start polling)
  connect() {
    return new Promise((resolve, reject) => {
      
      // Test connection with a ping
      this.sendCommand('PING')
        .then(response => {
          if (response && response.startsWith('PONG')) {
            this.connected = true;
            // Start polling for responses
            this.startPolling();
            resolve(true);
          } else {
            reject(new Error('MT5 did not respond to ping'));
          }
        })
        .catch(err => {
          reject(new Error(`Failed to connect to MT5: ${err.message}`));
        });
      
      // Set a timeout for connection
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }
  
  // Start polling for responses
  startPolling() {
    if (this.polling) return;
    
    this.polling = true;
    this.pollInterval = setInterval(() => {
      this.checkForResponses();
    }, 500);
  }
  
  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.polling = false;
  }
  
  // Check for responses from MT5
  checkForResponses() {
    try {
      if (fs.existsSync(this.responsesFile)) {
        const content = fs.readFileSync(this.responsesFile, 'utf8');
        fs.unlinkSync(this.responsesFile); // Delete after reading
        
        if (content && content.trim() !== '') {
          const lines = content.trim().split('\n');
          lines.forEach(line => {
            if (line.trim() !== '') {
              this.lastResponse = line.trim();
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error checking for MT5 responses: ${error.message}`);
    }
  }
  
  // Write command to file
  writeCommand(command) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(this.commandsFile, command + '\n');
        resolve(true);
      } catch (error) {
        console.error(`Error writing command to file: ${error.message}`);
        reject(error);
      }
    });
  }
  
  // Send a command to MetaTrader
  sendCommand(command, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.connected && command !== 'PING') {
        reject(new Error('Not connected to MT5'));
        return;
      }
      
      
      // Store current response for comparison
      const currentResponse = this.lastResponse;
      
      // Write the command to file
      this.writeCommand(command)
        .then(() => {
          let attempts = 0;
          const checkInterval = 250; // Check every 250ms
          const maxAttempts = Math.floor(timeout / checkInterval);
          
          // Check for response
          const checkForResponse = () => {
            attempts++;
            if (this.lastResponse !== currentResponse) {
              // We got a new response
              resolve(this.lastResponse);
            } else if (attempts >= maxAttempts) {
              reject(new Error('Command timeout'));
            } else {
              setTimeout(checkForResponse, checkInterval);
            }
          };
          
          // Start checking
          setTimeout(checkForResponse, checkInterval);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  
  // API Methods
  
  // Test connection with a ping
  async ping() {
    return this.sendCommand('PING');
  }
  
  // Place a buy order
  async buy(symbol, volume, stopLoss, takeProfit) {
    return this.sendCommand(`BUY|${symbol}|${volume}|${stopLoss}|${takeProfit}`);
  }
  
  // Place a sell order
  async sell(symbol, volume, stopLoss, takeProfit) {
    return this.sendCommand(`SELL|${symbol}|${volume}|${stopLoss}|${takeProfit}`);
  }
  
  // Close a position
  async closePosition(ticket) {
    return this.sendCommand(`CLOSE|${ticket}`);
  }
  
  // Modify a position
  async modifyPosition(ticket, stopLoss, takeProfit) {
    return this.sendCommand(`MODIFY|${ticket}|${stopLoss}|${takeProfit}`);
  }
  
  // Get account information
  async getAccountInfo() {
    const response = await this.sendCommand('ACCOUNT');
    const parts = response.split('|');
    
    if (parts[0] === 'ACCOUNT' && parts.length >= 9) {
      return {
        broker: parts[1],
        server: parts[2],
        accountNumber: parts[3],
        currency: parts[4],
        balance: parseFloat(parts[5]),
        equity: parseFloat(parts[6]),
        margin: parseFloat(parts[7]),
        profit: parseFloat(parts[8])
      };
    }
    
    throw new Error('Invalid account info response');
  }
  
  // Close the connection
  disconnect() {
    this.stopPolling();
    this.connected = false;
  }
}

// Create a single instance of the connector
const connector = new MetaTraderConnector();

// Convert to regular async functions
async function sendSignal(action, symbol, sl, tp, volume, reason, timeframe = "") {
  try {
    console.log(`[SIGNAL] Received ${action} signal for ${symbol} on ${timeframe} timeframe`);
    
    const mtConnector = new MetaTraderConnector();
    
    // Map the timeframe format used in the algorithm to the web app format
    const timeframeMap = {
      'FifteenMin': '15m',
      'Fifteen_Min': '15m',
      'ThirtyMin': '30m',
      'Thirty_Min': '30m',
      'OneHour': '1h',
      'One_Hour': '1h',
      'TwoHour': '2h',
      'Two_Hour': '2h',
      'FourHour': '4h',
      'Four_Hour': '4h',
      'Daily': 'D',
      'Weekly': 'W'
    };
    
    // Normalize the timeframe value
    const normalizedTimeframe = timeframeMap[timeframe] || timeframe;
    
    try {
      console.log(`[SIGNAL] Attempting to connect to MT5 for ${symbol}`);
      await mtConnector.connect();
      console.log(`[SIGNAL] Connected to MT5 for ${symbol}`);
    } catch (connectionError) {
      console.error(`[SIGNAL] Failed to connect to MT5: ${connectionError.message}`);
      
      // Log the trading signal that would have been sent
      console.log(`[SIGNAL] Would have sent ${action} for ${symbol} (SL: ${sl}, TP: ${tp})`);
      
      // Store the trade in our trade store when it's a new trade
      if (action === 'BUY' || action === 'SELL') {
        // In the test functions, symbol is the instrument name and price is passed separately
        // When we get to this function, price isn't available, so we'll use the midpoint between SL and TP
        try {
          // Calculate an estimated entry price
          const slNum = parseFloat(sl);
          const tpNum = parseFloat(tp);
          const direction = action === 'BUY' ? 1 : -1;
          const entryPrice = action === 'BUY' ? 
            slNum + ((tpNum - slNum) / 2) : 
            slNum - ((slNum - tpNum) / 2);
          
          const trade = {
            id: `algo_${Date.now()}`,
            pair: symbol,
            direction: action === 'BUY' ? 'buy' : 'sell',
            entryPrice: entryPrice.toFixed(5),
            stopLoss: sl,
            takeProfit: tp,
            timeframe: normalizedTimeframe,
            status: 'open',
            timestamp: new Date().toISOString(),
            strategy: reason
          };
          
          console.log(`[SIGNAL] Adding simulated trade: ${JSON.stringify(trade)}`);
          // If addTrade function exists, use it
          if (typeof addTrade === 'function') {
            addTrade(trade);
          } else {
            console.error('[SIGNAL] addTrade function not available');
          }
        } catch (storeError) {
          console.error(`[SIGNAL] Error storing trade: ${storeError.message}`);
        }
      }
      
      return null;
    }
    
    let result = null;
    
    // Send the action to MetaTrader
    try {
      console.log(`[SIGNAL] Sending ${action} command to MT5 for ${symbol}`);
      
      if (action === 'BUY') {
        result = await mtConnector.buy(symbol, volume || 0.01, sl, tp);
      } else if (action === 'SELL') {
        result = await mtConnector.sell(symbol, volume || 0.01, sl, tp);
      } else if (action === 'CLOSE') {
        result = await mtConnector.closePosition(symbol); // In this case, symbol is the ticket
      }
      
      console.log(`[SIGNAL] MT5 response: ${result}`);
      
      // If we get a ticket back, store the trade
      if (result && result.startsWith('TICKET|')) {
        const ticket = result.split('|')[1];
        console.log(`[SIGNAL] Trade executed with ticket: ${ticket}`);
        
        // Store in our trade database
        if (action === 'BUY' || action === 'SELL') {
          const trade = {
            id: ticket,
            pair: symbol,
            direction: action === 'BUY' ? 'buy' : 'sell',
            entryPrice: 'MT5', // MT5 will handle the actual execution price
            stopLoss: sl,
            takeProfit: tp,
            timeframe: normalizedTimeframe,
            status: 'open',
            timestamp: new Date().toISOString(),
            strategy: reason
          };
          
          // If addTrade function exists, use it
          if (typeof addTrade === 'function') {
            addTrade(trade);
          } else {
            console.error('[SIGNAL] addTrade function not available');
          }
        }
      }
    } catch (actionError) {
      console.error(`[SIGNAL] Error sending ${action} command to MT5: ${actionError.message}`);
    } finally {
      // Always disconnect
      mtConnector.disconnect();
    }
    
    return result;
  } catch (error) {
    console.error(`[SIGNAL] Error in sendSignal: ${error.message}`);
    return null;
  }
}

async function testConnection() {
  try {
    const mtConnector = new MetaTraderConnector();
    await mtConnector.connect();
    const result = await mtConnector.ping();
    mtConnector.disconnect();
    return result === 'PONG';
  } catch (error) {
    console.error('MT5 connection test failed:', error);
    return false;
  }
}

module.exports = {
  sendSignal,
  testConnection,
  MetaTraderConnector
}; 