const net = require('net');

// Configuration
const MT5_HOST = '127.0.0.1';
const MT5_PORT = 5555;

class MetaTraderConnector {
  constructor() {
    this.client = new net.Socket();
    this.connected = false;
    this.lastResponse = null;
    this.responseQueue = [];
    this.requestQueue = [];
    this.processing = false;
    
    // Set up event handlers
    this.client.on('data', this.handleData.bind(this));
    this.client.on('close', this.handleClose.bind(this));
    this.client.on('error', this.handleError.bind(this));
  }
  
  // Connect to MetaTrader
  connect() {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to MT5 at ${MT5_HOST}:${MT5_PORT}...`);
      
      this.client.connect(MT5_PORT, MT5_HOST, () => {
        this.connected = true;
        console.log('Connected to MT5');
        resolve(true);
      });
      
      // Set a timeout for connection
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }
  
  // Handle data from MetaTrader
  handleData(data) {
    const message = data.toString().trim();
    console.log(`Received from MT5: ${message}`);
    
    // Add to response queue
    this.responseQueue.push(message);
    this.lastResponse = message;
    
    // Process next command if any
    this.processQueue();
  }
  
  // Handle connection close
  handleClose() {
    console.log('Connection to MT5 closed');
    this.connected = false;
  }
  
  // Handle errors
  handleError(error) {
    console.error('MT5 connection error:', error);
  }
  
  // Process command queue
  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    const request = this.requestQueue.shift();
    
    try {
      await this.sendCommand(request.command);
      if (request.resolve) request.resolve(this.lastResponse);
    } catch (error) {
      if (request.reject) request.reject(error);
    }
    
    this.processing = false;
    this.processQueue();
  }
  
  // Send a command to MetaTrader
  sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to MT5'));
        return;
      }
      
      console.log(`Sending to MT5: ${command}`);
      this.client.write(command + '\n');
      
      // Wait for response with a timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, 10000);
      
      const checkResponse = () => {
        if (this.responseQueue.length > 0) {
          clearTimeout(timeoutId);
          resolve(this.responseQueue.shift());
        } else {
          setTimeout(checkResponse, 100);
        }
      };
      
      checkResponse();
    });
  }
  
  // Queue a command for execution
  queueCommand(command) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        command,
        resolve,
        reject
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  // API Methods
  
  // Test connection with a ping
  async ping() {
    return this.queueCommand('PING');
  }
  
  // Place a buy order
  async buy(symbol, volume, stopLoss, takeProfit) {
    return this.queueCommand(`BUY|${symbol}|${volume}|${stopLoss}|${takeProfit}`);
  }
  
  // Place a sell order
  async sell(symbol, volume, stopLoss, takeProfit) {
    return this.queueCommand(`SELL|${symbol}|${volume}|${stopLoss}|${takeProfit}`);
  }
  
  // Close a position
  async closePosition(ticket) {
    return this.queueCommand(`CLOSE|${ticket}`);
  }
  
  // Modify a position
  async modifyPosition(ticket, stopLoss, takeProfit) {
    return this.queueCommand(`MODIFY|${ticket}|${stopLoss}|${takeProfit}`);
  }
  
  // Get account information
  async getAccountInfo() {
    const response = await this.queueCommand('ACCOUNT');
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
    if (this.connected) {
      this.client.destroy();
      this.connected = false;
    }
  }
}

// Export the connector
module.exports = {
  MetaTraderConnector,
  sendSignal: async function(action, symbol, sl, tp, volume, reason) {
    try {
      const connector = new MetaTraderConnector();
      await connector.connect();
      
      let result;
      if (action === 'BUY') {
        result = await connector.buy(symbol, volume, sl, tp);
      } else if (action === 'SELL') {
        result = await connector.sell(symbol, volume, sl, tp);
      } else if (action === 'CLOSE_BUY' || action === 'CLOSE_SELL') {
        result = await connector.closePosition(reason); // Using reason as ticket ID
      } else if (action === 'MODIFY') {
        result = await connector.modifyPosition(reason, sl, tp); // Using reason as ticket ID
      }
      
      connector.disconnect();
      return result;
    } catch (error) {
      console.error('Error sending signal to MT5:', error);
      throw error;
    }
  }
};

// Example usage
if (require.main === module) {
  const test = async () => {
    try {
      const connector = new MetaTraderConnector();
      await connector.connect();
      
      // Test ping
      const pingResponse = await connector.ping();
      console.log('Ping response:', pingResponse);
      
      // Get account info
      const accountInfo = await connector.getAccountInfo();
      console.log('Account info:', accountInfo);
      
      // Disconnect
      connector.disconnect();
    } catch (error) {
      console.error('Test error:', error);
    }
  };
  
  test();
} 