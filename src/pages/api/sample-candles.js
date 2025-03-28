// Sample candle data endpoint that serves as a fallback
// when the real API data cannot be fetched

/**
 * Generate sample candle data for chart testing
 * @param {string} pair Currency pair like EUR_USD
 * @param {string} timeframe Timeframe like 15m, 1h, etc.
 * @param {number} count Number of candles to generate
 * @returns {object} Sample candle data
 */
function generateSampleData(pair, timeframe, count = 100) {
  // Base values differ by pair to make them look realistic
  const baseValues = {
    'EUR_USD': 1.08,
    'GBP_USD': 1.25,
    'USD_JPY': 150.0,
    'USD_CHF': 0.9,
    'USD_CAD': 1.35,
    'AUD_USD': 0.65,
    'NZD_USD': 0.60,
    'XAU_USD': 2200.0,
    'BTC_USD': 65000.0,
  };
  
  // Use a default if the pair isn't in our mapping
  const baseValue = baseValues[pair] || 1.0;
  
  // Volatility differs by pair and timeframe
  const volatility = pair.includes('JPY') ? 0.5 : 
                     pair.includes('XAU') ? 15 : 
                     pair.includes('BTC') ? 1000 : 0.002;
  
  // Adjust volatility based on timeframe
  const timeframeMultiplier = 
    timeframe === '15m' ? 0.5 :
    timeframe === '30m' ? 0.7 :
    timeframe === '1h' ? 1.0 :
    timeframe === '4h' ? 1.5 :
    timeframe === 'D' ? 2.0 : 1.0;
  
  const finalVolatility = volatility * timeframeMultiplier;
  
  // Generate candles
  const now = new Date();
  let candles = [];
  
  // Current price that we'll modify as we go
  let currentPrice = baseValue;
  
  // Generate realistic candles
  for (let i = 0; i < count; i++) {
    // Time for this candle, going backwards from now
    const timeOffset = getTimeOffsetForTimeframe(timeframe, i);
    const time = Math.floor((now.getTime() - timeOffset) / 1000); // In seconds for chart
    
    // Generate a random price movement
    const movement = (Math.random() - 0.5) * 2 * finalVolatility;
    currentPrice += movement;
    
    // Make sure price stays positive
    if (currentPrice <= 0) currentPrice = baseValue;
    
    // Generate open, high, low, close
    const open = currentPrice;
    const range = finalVolatility * Math.random();
    const close = open + (Math.random() - 0.5) * range;
    const high = Math.max(open, close) + Math.random() * range;
    const low = Math.min(open, close) - Math.random() * range;
    
    // Generate volume - higher on big moves
    const volumeBase = 50 + Math.random() * 150;
    const volumeMultiplier = 1 + Math.abs(close - open) / finalVolatility * 5;
    const volume = Math.floor(volumeBase * volumeMultiplier);
    
    candles.push({
      time,
      o: toFixed(open, pair),
      h: toFixed(high, pair),
      l: toFixed(low, pair), 
      c: toFixed(close, pair),
      volume
    });
  }
  
  // Sort candles by time ascending
  candles.sort((a, b) => a.time - b.time);
  
  return {
    candles,
    currentPrice: toFixed(currentPrice, pair),
    source: 'sample'
  };
}

/**
 * Helper to round numbers to appropriate decimals for the pair
 */
function toFixed(num, pair) {
  // JPY pairs have fewer decimal places
  const precision = pair.includes('JPY') ? 3 : 5;
  return parseFloat(num.toFixed(precision));
}

/**
 * Calculate time offset based on timeframe and position
 */
function getTimeOffsetForTimeframe(timeframe, position) {
  // Base time unit in milliseconds
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  // Get the right offset for each timeframe
  switch (timeframe) {
    case '15m':
      return position * 15 * minute;
    case '30m':
      return position * 30 * minute;
    case '1h':
      return position * hour;
    case '2h':
      return position * 2 * hour;
    case '4h':
      return position * 4 * hour;
    case 'D':
      return position * day;
    case 'W':
      return position * 7 * day;
    default:
      return position * hour;
  }
}

/**
 * API handler to serve sample candle data
 */
export default function handler(req, res) {
  // Get request parameters
  const { pair, timeframe, mode } = req.query;
  
  if (!pair || !timeframe) {
    return res.status(400).json({ error: 'Missing pair or timeframe parameter' });
  }

  try {
    // Generate sample data
    const count = mode === 'latest' ? 1 : 100;
    const data = generateSampleData(pair, timeframe, count);
    
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    // Return only the latest candle if in latest mode
    if (mode === 'latest') {
      const latestCandle = data.candles[data.candles.length - 1];
      return res.status(200).json({
        latestCandle,
        currentPrice: data.currentPrice,
        source: 'sample',
        timestamp: Date.now()
      });
    }
    
    // Return full sample data
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Error generating sample data:', error);
    return res.status(500).json({ error: 'Failed to generate sample data' });
  }
} 