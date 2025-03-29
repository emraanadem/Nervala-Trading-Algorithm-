import { getFilteredTrades } from '../../utils/tradeStore.js';

export default function handler(req, res) {
  const { pair, timeframe } = req.query;
  
  // Get trades from the store with filters
  const trades = getFilteredTrades({ pair, timeframe });
  
  // Sort by most recent first
  trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.status(200).json({ trades });
} 