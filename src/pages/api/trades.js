import { getFilteredTrades, getAllTrades } from '../../utils/tradeStore.js';

export default function handler(req, res) {
  // Check if the request is for all trades
  if (req.query.all === 'true') {
    // Get all trades with no filters
    const allTrades = getAllTrades();
    
    // Sort by most recent first
    allTrades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return res.status(200).json({ trades: allTrades });
  }
  
  // Otherwise, get trades filtered by pair and timeframe
  const { pair, timeframe } = req.query;
  
  // Get trades from the store with filters
  const trades = getFilteredTrades({ pair, timeframe });
  
  // Sort by most recent first
  trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.status(200).json({ trades });
} 