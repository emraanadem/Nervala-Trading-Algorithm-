import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProxyAgent } from 'undici';
import { routePairToAccountAndProxy } from '../../utils/accountProxyRouter.js';
import { trackApiHit } from '../../utils/usageTracker.js';

// Map timeframes from UI to Oanda format
const timeframeMap = {
  '15m': 'M15',
  '30m': 'M30',
  '1h': 'H1',
  '2h': 'H2',
  '4h': 'H4',
  'D': 'D',
  'W': 'W'
};

// Format data for the chart
function transformOandaCandles(oandaCandles) {
  if (!oandaCandles || !oandaCandles.candles || !oandaCandles.candles.length) {
    return [];
  }
  
  return oandaCandles.candles.map(candle => ({
    time: new Date(candle.time).getTime() / 1000, // Convert to seconds for lightweight-charts
    o: parseFloat(candle.mid.o),
    h: parseFloat(candle.mid.h),
    l: parseFloat(candle.mid.l),
    c: parseFloat(candle.mid.c),
    volume: candle.volume || 0
  }));
}

// Keep a list of known bad proxies to avoid using them again
const badProxies = new Set();
// Keep a list of known good proxies
const goodProxies = new Set();

// Log proxy status for debugging
function logProxyStatus() {
  console.log(`=== PROXY STATUS ===`);
  console.log(`Good proxies: ${goodProxies.size}`);
  console.log(`Bad proxies: ${badProxies.size}`);
  
  if (goodProxies.size > 0) {
    console.log(`Good proxy examples: ${Array.from(goodProxies).slice(0, 3).join(', ')}...`);
  }
  
  if (badProxies.size > 0) {
    console.log(`Bad proxy examples: ${Array.from(badProxies).slice(0, 3).join(', ')}...`);
  }
  
  console.log(`===================`);
}

// Fetch candles from Oanda API with proxy fallback
async function fetchOandaCandles(pair, timeframe, count = 500, timestamp = Date.now()) {
  let retryCount = 0;
  const maxRetries = 50;
  
  // Try with the default proxy first
  let { account, proxy, proxyAuth } = routePairToAccountAndProxy(pair);
  
  // If this proxy is known to be bad, try to get another one immediately
  if (proxy && badProxies.has(`${proxy.host}:${proxy.port}`)) {
    console.log(`Skipping known bad proxy ${proxy.host}:${proxy.port} for ${pair}`);
    // Try to find a different proxy
    proxy = getAlternativeProxy(proxy);
  }
  
  // If this proxy is known to be good, log it
  if (proxy && goodProxies.has(`${proxy.host}:${proxy.port}`)) {
    console.log(`Using known good proxy ${proxy.host}:${proxy.port} for ${pair}`);
  }
  
  const accountId = account?.id || process.env.OANDA_ACCOUNT_ID_1;
  const apiToken = account?.token || process.env.OANDA_API_TOKEN_1;
  
  if (!accountId || !apiToken) {
    throw new Error('Oanda API credentials not found');
  }
  
  while (retryCount < maxRetries) {
    try {
      trackApiHit(pair, accountId, proxy?.host);
      
      const granularity = timeframeMap[timeframe] || 'M15';
      const baseUrl = 'https://api-fxpractice.oanda.com';
      const endpoint = `/v3/accounts/${accountId}/instruments/${pair}/candles`;
      
      const params = new URLSearchParams({
        count: count.toString(),
        granularity: granularity,
        price: 'M',
        t: timestamp.toString()
      }).toString();

      // Set up request options 
      let options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      };
      
      // Configure proxy EXACTLY like in datacenter-forex.js
      if (proxy && proxyAuth) {
        console.log(`Using proxy for ${pair}: ${proxy.type}://${proxy.host}:${proxy.port} (attempt ${retryCount + 1})`);
        
        const proxyAgent = new ProxyAgent({
          uri: `${proxy.type}://${proxy.host}:${proxy.port}`,
          token: `Basic ${Buffer.from(`${proxyAuth.username}:${proxyAuth.password}`).toString('base64')}`
        });
        
        options.dispatcher = proxyAgent;
      } else {
        console.log(`No proxy available for ${pair}, trying direct connection (attempt ${retryCount + 1})`);
      }
      
      console.log(`Fetching ${pair} data, attempt ${retryCount + 1}...`);
      const response = await fetch(`${baseUrl}${endpoint}?${params}`, options);
      
      if (!response.ok) {
        throw new Error(`Oanda API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mark this proxy as good since it worked
      if (proxy) {
        const proxyId = `${proxy.host}:${proxy.port}`;
        if (!goodProxies.has(proxyId)) {
          console.log(`Marking proxy ${proxyId} as good`);
          goodProxies.add(proxyId);
          // Log proxy status periodically
          if (goodProxies.size % 5 === 0) {
            logProxyStatus();
          }
        }
      }
      
      return data;

    } catch (error) {
      console.error(`Error fetching data from Oanda for ${pair} (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
      
      // Mark the current proxy as bad
      if (proxy) {
        const proxyId = `${proxy.host}:${proxy.port}`;
        console.log(`Marking proxy ${proxyId} as bad`);
        badProxies.add(proxyId);
        
        // Log proxy status periodically
        if (badProxies.size % 5 === 0) {
          logProxyStatus();
        }
      }
      
      // Always try a different proxy on next attempt, regardless of error type
      proxy = getAlternativeProxy(proxy);
      
      if (!proxy) {
        console.warn('No alternative proxies available, continuing without proxy');
        // Set proxy to null to try direct connection
        proxy = null;
      }
      
      retryCount++;
      console.log(`Retrying in 2 seconds with ${proxy ? 'new proxy' : 'direct connection'}... (${retryCount}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error(`Failed to fetch ${pair} data after ${maxRetries} attempts`);
}

// Helper function to get an alternative proxy
function getAlternativeProxy(currentProxy) {
  try {
    // Read available proxies from file
    const fs = require('fs');
    const path = require('path');
    const proxiesPath = path.join(process.cwd(), 'data/proxylist.json');
    const proxiesData = fs.readFileSync(proxiesPath, 'utf8');
    const proxies = JSON.parse(proxiesData);
    
    // Create proxy ID of current proxy to filter it out
    const currentProxyId = currentProxy ? `${currentProxy.host}:${currentProxy.port}` : '';
    
    // First, try known good proxies
    if (goodProxies.size > 0) {
      // Get a list of known good proxies
      const knownGoodProxies = Array.from(goodProxies);
      const randomGoodProxy = knownGoodProxies[Math.floor(Math.random() * knownGoodProxies.length)];
      
      // Don't return the same proxy we just tried
      if (randomGoodProxy !== currentProxyId) {
        console.log(`Using known good proxy: ${randomGoodProxy}`);
        
        // Find this proxy in the original list to get all the details
        for (const proxy of proxies) {
          const proxyId = `${proxy[1]}:${proxy[2]}`;
          if (proxyId === randomGoodProxy) {
            return {
              type: proxy[0],
              host: proxy[1],
              port: proxy[2],
              id: proxy[3]
            };
          }
        }
      }
    }
    
    // Filter out the current proxy and any known bad proxies
    const availableProxies = proxies.filter(proxy => {
      const proxyId = `${proxy[1]}:${proxy[2]}`;
      return proxyId !== currentProxyId && !badProxies.has(proxyId);
    });
    
    if (availableProxies.length === 0) {
      console.warn('No available proxies found');
      return null;
    }
    
    // Select a random available proxy
    const randomProxy = availableProxies[Math.floor(Math.random() * availableProxies.length)];
    console.log(`Selected new proxy: ${randomProxy[1]}:${randomProxy[2]}`);
    
    return {
      type: randomProxy[0],
      host: randomProxy[1],
      port: randomProxy[2],
      id: randomProxy[3]
    };
  } catch (error) {
    console.error('Error finding alternative proxy:', error);
    return null;
  }
}

export default async function handler(req, res) {
  const { pair, timeframe, mode } = req.query;
  
  if (!pair || !timeframe) {
    return res.status(400).json({ error: 'Missing pair or timeframe parameter' });
  }

  // Add some request tracking to diagnose 
  console.log(`Processing request for ${pair} with timeframe ${timeframe}, mode=${mode || 'full'}`);
  
  try {
    // Get the routed account for this pair first
    const { account, proxy, proxyAuth } = routePairToAccountAndProxy(pair);
    
    console.log(`Routing ${pair} to account ${account?.id} with proxy ${proxy?.host}:${proxy?.port}`);
    
    // Add a cache buster parameter to ensure we're getting fresh data
    const timestamp = Date.now();
    
    // For latest mode, we only need the most recent candle
    const count = mode === 'latest' ? 1 : 500;
    
    // Fetch data from Oanda API
    const oandaData = await fetchOandaCandles(pair, timeframe, count, timestamp);
    
    // Transform data for chart
    const transformedCandles = transformOandaCandles(oandaData);
    
    // Get the current price (use the last candle's close price)
    const currentPrice = transformedCandles.length > 0 
      ? transformedCandles[transformedCandles.length - 1].c 
      : null;
    
    // Return the data with a cache control header to prevent browser caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    // If mode is 'latest', just return the latest candle and current price
    if (mode === 'latest') {
      return res.status(200).json({ 
        latestCandle: transformedCandles.length > 0 ? transformedCandles[transformedCandles.length - 1] : null,
        currentPrice,
        source: 'oanda',
        timestamp: timestamp
      });
    }
    
    // Otherwise return full candle data
    return res.status(200).json({ 
      candles: transformedCandles, 
      currentPrice,
      source: 'oanda',
      routedAccount: {
        accountId: account?.id,
        proxyHost: proxy?.host,
        pair: pair,
        timestamp: timestamp // Include timestamp to prevent client-side caching
      }
    });
  } catch (error) {
    console.error(`Error in candles API for ${pair}:`, error);
    
    // Extract more detailed error info for debugging
    const errorDetails = {
      message: error.message,
      cause: error.cause?.code || error.cause?.message || 'unknown',
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    };
    
    console.error(`Detailed error for ${pair}:`, JSON.stringify(errorDetails));
    
    // Return a proper error response
    return res.status(500).json({ 
      error: 'Failed to fetch candle data',
      details: errorDetails,
      pair: pair
    });
  }
} 