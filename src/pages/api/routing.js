import { getPairAccountProxyMap } from '../../utils/accountProxyRouter.js';

// List of all currency pairs supported by the application
const SUPPORTED_PAIRS = [
  'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'USD_CAD', 'AUD_USD', 'NZD_USD',
  'EUR_JPY', 'EUR_GBP', 'EUR_CHF', 'EUR_CAD', 'EUR_AUD', 'EUR_NZD',
  'GBP_JPY', 'GBP_CHF', 'GBP_CAD', 'GBP_AUD', 'GBP_NZD',
  'AUD_JPY', 'AUD_CAD', 'AUD_CHF', 'AUD_NZD',
  'NZD_JPY', 'NZD_CAD', 'NZD_CHF',
  'CAD_JPY', 'CAD_CHF', 'CHF_JPY',
  'US30_USD', 'SPX500_USD', 'NAS100_USD', 'JP225_USD', 'UK100_GBP', 'DE30_EUR',
  'XAU_USD', 'XAG_USD', 'BCO_USD', 'WTICO_USD',
  'BTC_USD', 'ETH_USD'
];

/**
 * API endpoint that returns the mapping of currency pairs to accounts and proxies
 */
export default function handler(req, res) {
  // In production, require authentication
  if (process.env.NODE_ENV === 'production') {
    // Simple API key check - in a real app, use a proper authentication system
    const apiKey = req.headers['x-api-key'];
    
    // When accessed from the frontend, we'll allow it for the chart UI
    const referer = req.headers.referer || '';
    const isFromUI = referer.includes('/') && !referer.includes('/admin');
    
    // If it's not from the chart UI and doesn't have a valid API key, block access
    if (!isFromUI && (!apiKey || apiKey !== process.env.ADMIN_API_KEY)) {
      return res.status(401).json({ error: 'Unauthorized access to routing information' });
    }
  }
  
  try {
    // Get the routing map for all pairs
    const routingMap = getPairAccountProxyMap(SUPPORTED_PAIRS);
    
    // Filter by specific pair if requested
    const { pair } = req.query;
    if (pair) {
      if (!SUPPORTED_PAIRS.includes(pair)) {
        return res.status(400).json({ error: `Invalid pair: ${pair}` });
      }
      
      return res.status(200).json({ 
        pair,
        routing: routingMap[pair] || { error: 'No routing information available for this pair' }
      });
    }
    
    // Return full routing map
    return res.status(200).json({
      pairs: SUPPORTED_PAIRS.length,
      routing: routingMap
    });
  } catch (error) {
    console.error('Error generating routing map:', error);
    return res.status(500).json({ error: 'Failed to generate routing map' });
  }
} 