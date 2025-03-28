import { getUsageStats, getLoadDistribution } from '../../utils/usageTracker.js';

export default async function handler(req, res) {
  // Only allow authorized requests in production
  if (process.env.NODE_ENV === 'production') {
    // Simple API key check - in a real app, use a proper authentication system
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  try {
    // Get the type of stats requested
    const { type = 'summary' } = req.query;
    
    if (type === 'raw') {
      // Return raw usage statistics
      const stats = getUsageStats();
      res.status(200).json(stats);
    } else {
      // Return load distribution statistics
      const distribution = getLoadDistribution();
      res.status(200).json(distribution);
    }
  } catch (error) {
    console.error('Error retrieving usage statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve usage statistics' });
  }
} 