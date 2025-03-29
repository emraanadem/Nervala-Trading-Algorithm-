// tradeStore.js - Central store for algorithm-generated trades
import fs from 'fs';
import path from 'path';

// Path to store trades
const TRADE_FILE = path.join(process.cwd(), 'trade-data.json');

// Store structure
let tradeStore = {
  trades: [],
  lastUpdated: null
};

// Initialize the store
function initStore() {
  try {
    if (fs.existsSync(TRADE_FILE)) {
      const data = fs.readFileSync(TRADE_FILE, 'utf8');
      tradeStore = JSON.parse(data);
    } else {
      // Create empty store
      saveStore();
    }
  } catch (error) {
    console.error('Error initializing trade store:', error);
  }
}

// Save the store to disk
function saveStore() {
  try {
    tradeStore.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TRADE_FILE, JSON.stringify(tradeStore, null, 2));
  } catch (error) {
    console.error('Error saving trade store:', error);
  }
}

// Add a new trade to the store
export function addTrade(trade) {
  // Load latest data
  initStore();
  
  // Generate ID if not provided
  if (!trade.id) {
    trade.id = Date.now() + Math.floor(Math.random() * 1000);
  }
  
  // Set timestamp if not provided
  if (!trade.timestamp) {
    trade.timestamp = new Date().toISOString();
  }
  
  // Add to store
  tradeStore.trades.push(trade);
  
  // Keep store size manageable (limit to latest 500 trades)
  if (tradeStore.trades.length > 500) {
    tradeStore.trades = tradeStore.trades.slice(-500);
  }
  
  // Save changes
  saveStore();
  
  return trade;
}

// Update a trade in the store
export function updateTrade(id, updates) {
  // Load latest data
  initStore();
  
  // Find and update the trade
  const index = tradeStore.trades.findIndex(t => t.id === id);
  if (index !== -1) {
    tradeStore.trades[index] = {
      ...tradeStore.trades[index],
      ...updates
    };
    
    // Save changes
    saveStore();
    
    return tradeStore.trades[index];
  }
  
  return null;
}

// Get all trades
export function getAllTrades() {
  // Load latest data
  initStore();
  return tradeStore.trades;
}

// Get filtered trades
export function getFilteredTrades(filters = {}) {
  // Load latest data
  initStore();
  
  // Apply filters
  let result = [...tradeStore.trades];
  
  if (filters.pair) {
    result = result.filter(trade => trade.pair === filters.pair);
  }
  
  if (filters.timeframe) {
    result = result.filter(trade => trade.timeframe === filters.timeframe);
  }
  
  if (filters.status) {
    result = result.filter(trade => trade.status === filters.status);
  }
  
  // Sort by most recent first
  result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return result;
}

// Export the store methods
export default {
  addTrade,
  updateTrade,
  getAllTrades,
  getFilteredTrades
}; 