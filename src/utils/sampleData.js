// Generate sample candle data for testing
export function generateSampleData(pair, timeframe, count = 500) {
  // Seed the random data based on pair name for consistency
  const seedValue = pair.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min, max) => {
    // Simple deterministic random number generator
    const x = Math.sin(seedValue + count) * 10000;
    return (x - Math.floor(x)) * (max - min) + min;
  };

  // Set the base price based on the currency pair
  let basePrice = 1.0;
  if (pair.includes('JPY')) basePrice = 140;
  else if (pair.includes('BTC')) basePrice = 50000;
  else if (pair.includes('ETH')) basePrice = 3000;
  else if (pair.includes('XAU')) basePrice = 1800;
  
  // Calculate time increments based on timeframe
  let timeIncrement = 60 * 15; // 15 minutes in seconds
  switch (timeframe) {
    case '15m': timeIncrement = 60 * 15; break;
    case '30m': timeIncrement = 60 * 30; break;
    case '1h': timeIncrement = 60 * 60; break;
    case '2h': timeIncrement = 60 * 60 * 2; break;
    case '4h': timeIncrement = 60 * 60 * 4; break;
    case 'D': timeIncrement = 60 * 60 * 24; break;
    case 'W': timeIncrement = 60 * 60 * 24 * 7; break;
    default: timeIncrement = 60 * 15;
  }
  
  // Generate candles
  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - (count * timeIncrement);
  
  const candles = [];
  let currentPrice = basePrice;
  let volatility = 0.002; // Adjust based on the pair
  
  if (pair.includes('JPY')) volatility = 0.2;
  else if (pair.includes('BTC')) volatility = 500;
  else if (pair.includes('ETH')) volatility = 50;
  else if (pair.includes('XAU')) volatility = 5;
  
  for (let i = 0; i < count; i++) {
    const time = startTime + (i * timeIncrement);
    
    // Generate a realistic candle
    const changePercent = (random(0, 200) - 100) * volatility;
    const range = currentPrice * volatility;
    const close = currentPrice * (1 + changePercent / 100);
    const open = currentPrice;
    const high = Math.max(open, close) + random(0, range / 2);
    const low = Math.min(open, close) - random(0, range / 2);
    const volume = Math.floor(random(100, 1000));
    
    candles.push({
      timestamp: time * 1000, // Convert back to milliseconds
      o: open,
      h: high,
      l: low,
      c: close,
      volume
    });
    
    // Update the current price for the next candle
    currentPrice = close;
  }
  
  return candles;
} 