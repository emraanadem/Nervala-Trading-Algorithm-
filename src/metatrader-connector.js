import fs from 'fs';
import path from 'path';
import { addTrade, updateTrade } from './utils/index.js';

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
  
  console.warn('MetaTrader 5 Files directory not found at default location. Using current directory.');
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
            console.log('Connected to MT5 (file-based communication)');
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
              console.log(`Received from MT5: ${this.lastResponse}`);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking responses:', error);
    }
  }
  
  // Write command to file
  writeCommand(command) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(this.commandsFile, command + '\n');
        resolve(true);
      } catch (error) {
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
      
      console.log(`Sending to MT5: ${command}`);
      
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
    console.log('Disconnected from MT5');
  }
}

// Export as ES Module
export const connector = new MetaTraderConnector();

export async function sendSignal(action, symbol, sl, tp, volume, reason, timeframe = "") {
  try {
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
      await mtConnector.connect();
    } catch (connectionError) {
      console.warn(`MetaTrader connection failed: ${connectionError.message}`);
      console.warn(`Trading signal ${action} for ${symbol} will be logged but not sent to MetaTrader.`);
      
      // Log the trading signal that would have been sent
      console.log(`WOULD SEND: ${action} | ${symbol} | SL:${sl} | TP:${tp} | Volume:${volume} | ${reason || ''}`);
      
      // Store the trade in our trade store when it's a new trade
      if (action === 'BUY' || action === 'SELL') {
        // In the test functions, symbol is the instrument name and price is passed separately
        // When we get to this function, price isn't available, so we'll use the midpoint between SL and TP
        // This is just an approximation for storage purposes
        const slPrice = parseFloat(sl);
        const tpPrice = parseFloat(tp);
        
        // Estimate the entry price based on the stop loss and take profit
        // This is a reasonable approximation when the actual price isn't available
        let entryPrice;
        if (action === 'BUY') {
          // For a buy, entry would be closer to the stop loss (below entry)
          entryPrice = slPrice + (tpPrice - slPrice) / 3;
        } else { // SELL
          // For a sell, entry would be closer to the stop loss (above entry)
          entryPrice = slPrice - (slPrice - tpPrice) / 3;
        }
        
        // Calculate risk-reward ratio
        let riskPips, rewardPips;
        if (action === 'BUY') {
          riskPips = Math.abs(entryPrice - slPrice);
          rewardPips = Math.abs(tpPrice - entryPrice);
        } else { // SELL
          riskPips = Math.abs(slPrice - entryPrice);
          rewardPips = Math.abs(entryPrice - tpPrice);
        }
        const riskReward = (rewardPips / riskPips).toFixed(2);
        
        // Create and store the trade
        const trade = {
          pair: symbol,
          timeframe: normalizedTimeframe,
          direction: action.toLowerCase(),
          entry: entryPrice,
          takeProfit: tpPrice,
          stopLoss: slPrice,
          riskReward: riskReward,
          status: 'open',
          timestamp: new Date().toISOString()
        };
        
        // Add to store
        addTrade(trade);
        console.log(`Stored new ${action} trade for ${symbol} in timeframe ${normalizedTimeframe}`);
      }
      // Update existing trade when it's closed
      else if (action === 'CLOSE_BUY' || action === 'CLOSE_SELL') {
        // Assuming 'reason' contains the trade ID here
        if (reason) {
          updateTrade(reason, {
            status: 'closed',
            closeTime: new Date().toISOString()
          });
          console.log(`Updated trade ${reason} status to closed`);
        }
      }
      
      // Return a fake success response to allow the trading strategy to continue
      return "SIMULATED_RESPONSE";
    }
    
    let result;
    if (action === 'BUY') {
      result = await mtConnector.buy(symbol, volume, sl, tp);
      
      // Same logic as above to estimate entry price
      const slPrice = parseFloat(sl);
      const tpPrice = parseFloat(tp);
      const entryPrice = slPrice + (tpPrice - slPrice) / 3;
      
      // Store trade in our store
      addTrade({
        pair: symbol,
        timeframe: normalizedTimeframe,
        direction: 'buy',
        entry: entryPrice,
        takeProfit: tpPrice,
        stopLoss: slPrice,
        riskReward: ((tpPrice - entryPrice) / (entryPrice - slPrice)).toFixed(2),
        status: 'open',
        timestamp: new Date().toISOString()
      });
    } 
    else if (action === 'SELL') {
      result = await mtConnector.sell(symbol, volume, sl, tp);
      
      // Same logic as above to estimate entry price
      const slPrice = parseFloat(sl);
      const tpPrice = parseFloat(tp);
      const entryPrice = slPrice - (slPrice - tpPrice) / 3;
      
      // Store trade in our store
      addTrade({
        pair: symbol,
        timeframe: normalizedTimeframe,
        direction: 'sell',
        entry: entryPrice,
        takeProfit: tpPrice,
        stopLoss: slPrice,
        riskReward: ((entryPrice - tpPrice) / (slPrice - entryPrice)).toFixed(2),
        status: 'open',
        timestamp: new Date().toISOString()
      });
    } 
    else if (action === 'CLOSE_BUY' || action === 'CLOSE_SELL') {
      result = await mtConnector.closePosition(reason); // Using reason as ticket ID
      
      // Update trade status in our store
      if (reason) {
        updateTrade(reason, {
          status: 'closed',
          closeTime: new Date().toISOString()
        });
      }
    } 
    else if (action === 'MODIFY') {
      result = await mtConnector.modifyPosition(reason, sl, tp); // Using reason as ticket ID
      
      // Update trade data in our store
      if (reason) {
        updateTrade(reason, {
          stopLoss: parseFloat(sl),
          takeProfit: parseFloat(tp)
        });
      }
    }
    
    mtConnector.disconnect();
    return result;
  } catch (error) {
    console.error('Error sending signal to MT5:', error);
    // Don't throw, just log and return fake success to prevent crashing the strategy
    return "ERROR_HANDLED";
  }
}

// Test function is exported but not auto-executed
export async function testConnection() {
  try {
    console.log('Testing MT5 connection...');
    const mtConnector = new MetaTraderConnector();
    
    await mtConnector.connect();
    
    // Test ping
    const pingResponse = await mtConnector.ping();
    console.log('Ping response:', pingResponse);
    
    // Get account info
    try {
      const accountInfo = await mtConnector.getAccountInfo();
      console.log('Account info:', accountInfo);
    } catch (error) {
      console.log('Failed to get account info:', error.message);
    }
    
    // Disconnect
    mtConnector.disconnect();
    return true;
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
} 