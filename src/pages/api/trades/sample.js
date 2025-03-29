import { createSampleTrades } from '../../../utils/tradeStore';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Create sample trades
    const trades = createSampleTrades();
    
    // Return success
    return res.status(200).json({
      success: true,
      message: `Created ${trades.length} sample trades`,
      trades
    });
  } catch (error) {
    console.error('Error creating sample trades:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sample trades',
      error: error.message
    });
  }
} 