/**
 * MetaTrader API Connector
 * Handles communication between trading algorithms and MetaTrader platform
 * Processes signals from timeframe analysis files and executes trades accordingly
 */

import zeromq from 'zeromq';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Optional - Winston for better logging
import winston from 'winston';

// Signal handlers
const signalHandlers = new Map();
let activeOrders = new Map();
let activePositions = new Map();

// Configuration
const config = {
  // ZeroMQ socket configuration - MetaTrader needs to run a compatible expert advisor
  zmq: {
    // Default ports - adjust based on your MT expert advisor settings
    pullPort: 5557,   // Port to receive data from MT
    pushPort: 5558,   // Port to send commands to MT
    pubPort: 5559,    // Port for MT to publish market data
    timeout: 1000,    // Socket timeout in milliseconds
    retryInterval: 5000, // Reconnection interval in milliseconds
  },
  
  // Trade parameters
  trade: {
    defaultVolume: 0.01,    // Default lot size
    maxSlippage: 5,         // Maximum allowed slippage in points
    maxSpread: 20,          // Maximum allowed spread in points
    emergencyCloseSpread: 50, // Emergency close if spread exceeds this
    magicNumber: 12345,     // Magic number to identify trades
  },
  
  // Risk management
  risk: {
    maxPositions: 5,        // Maximum number of open positions
    maxDrawdown: 5.0,       // Maximum drawdown percentage before halting
    maxDailyLoss: 3.0,      // Maximum daily loss percentage
    dailyProfitTarget: 5.0, // Daily profit target percentage
  },
  
  // Reconnection configuration
  reconnection: {
    enabled: true,
    maxAttempts: -1,        // -1 for infinite attempts
    initialDelay: 5000,     // 5 seconds initial delay
    maxDelay: 300000,       // Max 5 minutes between reconnection attempts
    backoffFactor: 1.5      // Exponential backoff
  }
};

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'metatrader-connector.log' })
  ]
});

// Initialize ZeroMQ sockets
let pullSocket;
let pushSocket;
let subSocket;
let connected = false;
let reconnectTimer = null;
let reconnectAttempts = 0; // Track reconnection attempts

// Add a signal queue for when MetaTrader is not available
const pendingSignals = [];

/**
 * Initialize connection to MetaTrader via ZeroMQ
 */
async function initializeConnection() {
  try {
    logger.info('Initializing connection to MetaTrader...');
    
    // Socket to receive data from MetaTrader
    pullSocket = new zeromq.Pull();
    pullSocket.connect(`tcp://localhost:${config.zmq.pullPort}`);
    
    // Socket to send commands to MetaTrader
    pushSocket = new zeromq.Push();
    pushSocket.connect(`tcp://localhost:${config.zmq.pushPort}`);
    
    // Socket to subscribe to market data from MetaTrader
    subSocket = new zeromq.Subscriber();
    subSocket.connect(`tcp://localhost:${config.zmq.pubPort}`);
    
    // Subscribe to all messages
    subSocket.subscribe('');
    
    connected = true;
    logger.info('Connected to MetaTrader');
    
    // Start message handling
    handleMessages();
    
    // Send test message
    sendCommand({
      action: 'PING',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Connection error: ${error.message}`);
    await reconnect();
  }
}

/**
 * Handle reconnection
 */
async function reconnect() {
  if (reconnectTimer) return;
  
  connected = false;
  reconnectAttempts++;
  
  const delay = Math.min(
    config.reconnection.initialDelay * Math.pow(config.reconnection.backoffFactor, reconnectAttempts-1),
    config.reconnection.maxDelay
  );
  
  logger.info(`Reconnection attempt ${reconnectAttempts} in ${delay/1000} seconds...`);
  
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    logger.info("Attempting to reconnect to MetaTrader...");
    
    try {
      await initializeConnection();
      // If successful, reset attempts counter
      if (connected) reconnectAttempts = 0;
    } catch (error) {
      logger.error(`Reconnection failed: ${error.message}`);
      
      // Only stop trying if max attempts reached and it's not infinite
      if (config.reconnection.maxAttempts > 0 && reconnectAttempts >= config.reconnection.maxAttempts) {
        logger.error("Maximum reconnection attempts reached. Giving up.");
        return;
      }
      
      // Try again
      reconnect();
    }
  }, delay);
}

/**
 * Handle incoming messages from MetaTrader
 */
async function handleMessages() {
  try {
    // Handle messages from pullSocket (responses from MT)
    for await (const [msg] of pullSocket) {
      try {
        const message = JSON.parse(msg.toString());
        processMetaTraderMessage(message);
      } catch (error) {
        logger.error(`Error processing message: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Pull socket error: ${error.message}`);
    await reconnect();
  }
  
  try {
    // Handle messages from subscription socket (market data)
    for await (const [topic, msg] of subSocket) {
      try {
        const topicStr = topic.toString();
        const message = JSON.parse(msg.toString());
        processMarketData(topicStr, message);
      } catch (error) {
        logger.error(`Error processing market data: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Sub socket error: ${error.message}`);
    await reconnect();
  }
}

/**
 * Process messages from MetaTrader
 */
function processMetaTraderMessage(message) {
  logger.debug(`Received message: ${JSON.stringify(message)}`);
  
  switch (message.type) {
    case 'TRADE_RESPONSE':
      handleTradeResponse(message);
      break;
    
    case 'ACCOUNT_INFO':
      updateAccountInfo(message.data);
      break;
      
    case 'ERROR':
      logger.error(`MetaTrader error: ${message.message}`);
      break;
      
    case 'PONG':
      logger.debug('Received PONG from MetaTrader');
      break;
      
    default:
      logger.debug(`Unknown message type: ${message.type}`);
  }
}

/**
 * Process market data
 */
function processMarketData(topic, data) {
  // Handle market data updates (price ticks, etc.)
  if (topic === 'PRICE') {
    // Update local price cache
    updatePrice(data);
    
    // Check for spread-based emergencies
    checkSpreadEmergency(data);
  }
}

/**
 * Update local price data
 */
function updatePrice(data) {
  // Update local price cache
  // This would be used by the trading algorithms
  // Consider using a Redis or in-memory store for high frequency updates
}

/**
 * Check for emergency spread conditions
 */
function checkSpreadEmergency(data) {
  if (data.spread > config.trade.emergencyCloseSpread) {
    logger.warn(`Emergency spread condition detected: ${data.symbol} - ${data.spread} points`);
    closeAllPositions('Emergency spread condition');
  }
}

/**
 * Handle trade responses
 */
function handleTradeResponse(response) {
  const { requestId, success, orderId, positionId, message } = response;
  
  if (success) {
    logger.info(`Trade executed successfully: ${orderId || positionId}`);
    
    // Track the order/position
    if (orderId) {
      activeOrders.set(orderId, response);
    }
    if (positionId) {
      activePositions.set(positionId, response);
    }
  } else {
    logger.error(`Trade execution failed: ${message}`);
  }
}

/**
 * Update account information
 */
function updateAccountInfo(accountInfo) {
  // Check for risk management conditions
  if (accountInfo.drawdown > config.risk.maxDrawdown) {
    logger.warn(`Maximum drawdown reached: ${accountInfo.drawdown.toFixed(2)}%`);
    haltTrading('Maximum drawdown reached');
  }
  
  if (accountInfo.dailyProfitLoss < -config.risk.maxDailyLoss) {
    logger.warn(`Maximum daily loss reached: ${accountInfo.dailyProfitLoss.toFixed(2)}%`);
    haltTrading('Maximum daily loss reached');
  }
  
  if (accountInfo.dailyProfitLoss > config.risk.dailyProfitTarget) {
    logger.info(`Daily profit target reached: ${accountInfo.dailyProfitLoss.toFixed(2)}%`);
    // Optional: close all positions to secure profit
    // closeAllPositions('Daily profit target reached');
  }
}

/**
 * Halt all trading activity
 */
function haltTrading(reason) {
  logger.warn(`Trading halted: ${reason}`);
  closeAllPositions(reason);
  // Additional code to prevent new trades
}

/**
 * Close all open positions
 */
async function closeAllPositions(reason) {
  logger.info(`Closing all positions: ${reason}`);
  
  for (const [positionId, position] of activePositions.entries()) {
    await closePosition(positionId, position.symbol);
  }
}

/**
 * Send command to MetaTrader
 */
async function sendCommand(command) {
  try {
    logger.debug(`Sending command: ${JSON.stringify(command)}`);
    
    if (!connected) {
      logger.error('Cannot send command: not connected');
      return false;
    }
    
    await pushSocket.send(JSON.stringify(command));
    return true;
  } catch (error) {
    logger.error(`Error sending command: ${error.message}`);
    await reconnect();
    return false;
  }
}

/**
 * Open a new market order
 */
async function openMarketOrder(symbol, orderType, volume = config.trade.defaultVolume, stopLoss = 0, takeProfit = 0, comment = '') {
  const requestId = Date.now().toString();
  
  const command = {
    action: 'OPEN_ORDER',
    requestId,
    data: {
      symbol,
      type: orderType, // 'BUY' or 'SELL'
      volume,
      stopLoss,
      takeProfit,
      magicNumber: config.trade.magicNumber,
      comment: comment || `Signal from ${new Date().toISOString()}`,
      maxSlippage: config.trade.maxSlippage
    }
  };
  
  await sendCommand(command);
}

/**
 * Close a specific position
 */
async function closePosition(positionId, symbol) {
  const requestId = Date.now().toString();
  
  const command = {
    action: 'CLOSE_POSITION',
    requestId,
    data: {
      positionId,
      symbol,
      magicNumber: config.trade.magicNumber
    }
  };
  
  await sendCommand(command);
}

/**
 * Modify stop loss and/or take profit on an existing position
 */
async function modifyPosition(positionId, symbol, stopLoss, takeProfit) {
  const requestId = Date.now().toString();
  
  const command = {
    action: 'MODIFY_POSITION',
    requestId,
    data: {
      positionId,
      symbol,
      stopLoss,
      takeProfit,
      magicNumber: config.trade.magicNumber
    }
  };
  
  await sendCommand(command);
}

/**
 * Register a signal handler for a specific timeframe
 */
function registerSignalHandler(timeframe, handler) {
  signalHandlers.set(timeframe, handler);
  logger.info(`Registered signal handler for ${timeframe}`);
}

/**
 * Process trading signal from algorithm
 */
async function processSignal(timeframe, signal) {
  logger.info(`Processing signal from ${timeframe}: ${JSON.stringify(signal)}`);
  
  // Check if we're under position limit
  if (activePositions.size >= config.risk.maxPositions) {
    logger.warn(`Maximum positions limit reached (${config.risk.maxPositions}), ignoring signal`);
    return;
  }
  
  // Process based on signal type
  switch (signal.action) {
    case 'BUY':
      await openMarketOrder(
        signal.symbol,
        'BUY',
        signal.volume || config.trade.defaultVolume,
        signal.stopLoss,
        signal.takeProfit,
        `${timeframe} ${signal.reason || ''}`
      );
      break;
      
    case 'SELL':
      await openMarketOrder(
        signal.symbol,
        'SELL',
        signal.volume || config.trade.defaultVolume,
        signal.stopLoss,
        signal.takeProfit,
        `${timeframe} ${signal.reason || ''}`
      );
      break;
      
    case 'CLOSE':
      if (signal.positionId) {
        await closePosition(signal.positionId, signal.symbol);
      } else {
        // Close all positions for this symbol
        for (const [posId, pos] of activePositions.entries()) {
          if (pos.symbol === signal.symbol) {
            await closePosition(posId, signal.symbol);
          }
        }
      }
      break;
      
    case 'MODIFY':
      await modifyPosition(
        signal.positionId,
        signal.symbol,
        signal.stopLoss,
        signal.takeProfit
      );
      break;
      
    default:
      logger.warn(`Unknown signal action: ${signal.action}`);
  }
}

/**
 * Connect signals from the trading algorithms
 */
function connectAlgorithms() {
  // Create emitter/listener pattern for each algorithm file
  
  // OneHour.js - setup listener
  registerSignalHandler('OneHour', (signal) => {
    processSignal('OneHour', signal);
  });
  
  // FifteenMin.js - setup listener
  registerSignalHandler('FifteenMin', (signal) => {
    processSignal('FifteenMin', signal);
  });
  
  // ThirtyMin.js - setup listener
  registerSignalHandler('ThirtyMin', (signal) => {
    processSignal('ThirtyMin', signal);
  });
  
  // TwoHour.js - setup listener
  registerSignalHandler('TwoHour', (signal) => {
    processSignal('TwoHour', signal);
  });
  
  // FourHour.js - setup listener
  registerSignalHandler('FourHour', (signal) => {
    processSignal('FourHour', signal);
  });
  
  // Daily.js - setup listener
  registerSignalHandler('Daily', (signal) => {
    processSignal('Daily', signal);
  });
  
  // Weekly.js - setup listener
  registerSignalHandler('Weekly', (signal) => {
    processSignal('Weekly', signal);
  });
}

/**
 * Modify the export functions in trading algorithm files to send signals
 * to the MetaTrader connector
 */
function setupAlgorithmCallbacks() {
  // Example modification for OneHour.js to communicate with this connector
  
  // Original export from OneHour.js:
  // export function testonehour(data, price, instrument) {
  //   instrum = instrument
  //   liveprice = price
  //   dataset = data
  //   One_Hour_Nexus.controlMain()
  // }
  
  // We need to modify to include signal processing:
  /*
   For OneHour.js, add:
   
   import { sendSignal } from './metatrader-connector.js';
   
   // Inside One_Hour_Nexus.buy() method:
   sendSignal('OneHour', {
     action: 'BUY',
     symbol: One_Hour_Nexus.pair, 
     stopLoss: One_Hour_Nexus.sl,
     takeProfit: One_Hour_Nexus.tp,
     reason: 'Buy signal from One Hour timeframe'
   });
   
   // Inside One_Hour_Nexus.sell() method:
   sendSignal('OneHour', {
     action: 'SELL',
     symbol: One_Hour_Nexus.pair,
     stopLoss: One_Hour_Nexus.sl,
     takeProfit: One_Hour_Nexus.tp,
     reason: 'Sell signal from One Hour timeframe'
   });
   
   // Inside One_Hour_Nexus.closePosTP() and closePosSL() methods:
   sendSignal('OneHour', {
     action: 'CLOSE',
     symbol: One_Hour_Nexus.pair,
     reason: 'Close signal from One Hour timeframe'
   });
  */
}

/**
 * Public API to send signals from algorithm files
 */
export function sendSignal(timeframe, signal) {
  if (!connected) {
    logger.warn(`MetaTrader not connected. Queuing ${signal.action} signal for ${signal.symbol}`);
    pendingSignals.push({
      timeframe,
      signal,
      timestamp: Date.now()
    });
    return false;
  }
  
  const handler = signalHandlers.get(timeframe);
  
  if (handler) {
    handler(signal);
  } else {
    logger.warn(`No handler registered for ${timeframe} signals`);
  }
}

/**
 * Get current active positions
 */
export function getActivePositions() {
  return Array.from(activePositions.values());
}

/**
 * Get current active orders
 */
export function getActiveOrders() {
  return Array.from(activeOrders.values());
}

/**
 * Initialize the MetaTrader connector
 */
export async function initialize() {
  logger.info('Initializing MetaTrader connector...');
  
  await initializeConnection();
  connectAlgorithms();
  
  logger.info('MetaTrader connector initialized');
  
  return {
    sendSignal,
    getActivePositions,
    getActiveOrders,
    openMarketOrder,
    closePosition,
    modifyPosition,
    closeAllPositions
  };
}

// Auto-initialize if this is the main file
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initialize().catch(error => {
    logger.error(`Initialization error: ${error.message}`);
    process.exit(1);
  });
}

// Add a function to load stored signals on startup
function loadStoredSignals() {
  if (!fs.existsSync('pending_signals.json')) return;
  
  const signals = fs.readFileSync('pending_signals.json', 'utf8')
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));
  
  // Add to pendingSignals array
  pendingSignals.push(...signals);
  
  // Backup and clear the file
  fs.renameSync('pending_signals.json', `pending_signals_${Date.now()}.bak`);
  fs.writeFileSync('pending_signals.json', '', 'utf8');
  
  logger.info(`Loaded ${signals.length} stored signals`);
}

// Add function to process queued signals when connection is restored
function processPendingSignals() {
  if (pendingSignals.length === 0) return;
  
  logger.info(`Processing ${pendingSignals.length} pending signals`);
  
  // Process signals, possibly with some filtering of outdated ones
  const currentTime = Date.now();
  const validSignals = pendingSignals.filter(item => 
    // Only process signals less than 1 hour old
    (currentTime - item.timestamp) < 3600000
  );
  
  validSignals.forEach(item => {
    logger.info(`Sending queued ${item.signal.action} signal for ${item.signal.symbol}`);
    sendSignal(item.timeframe, item.signal);
  });
  
  // Clear the queue
  pendingSignals.length = 0;
} 