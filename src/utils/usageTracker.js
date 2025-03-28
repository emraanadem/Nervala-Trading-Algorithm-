import fs from 'fs';
import path from 'path';

const USAGE_FILE = path.join(process.cwd(), 'data', 'apiUsage.json');

// Initialize the usage file if it doesn't exist
function ensureUsageFile() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(USAGE_FILE)) {
      fs.writeFileSync(USAGE_FILE, JSON.stringify({
        accounts: {},
        proxies: {},
        pairs: {},
        lastReset: new Date().toISOString(),
        dailyStats: []
      }, null, 2));
    }
    return true;
  } catch (error) {
    console.error('Error initializing usage file:', error);
    return false;
  }
}

// Track API hit for an account/proxy combination
export function trackApiHit(pair, accountId, proxyHost) {
  try {
    if (!ensureUsageFile()) return;
    
    // Read the current usage data
    const usageData = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Check if we need to archive daily stats (once per day)
    const lastReset = new Date(usageData.lastReset);
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      
      // Archive current stats to dailyStats
      usageData.dailyStats.push({
        date: lastReset.toISOString().split('T')[0],
        accounts: { ...usageData.accounts },
        proxies: { ...usageData.proxies },
        pairs: { ...usageData.pairs }
      });
      
      // Keep only the last 30 days of stats
      if (usageData.dailyStats.length > 30) {
        usageData.dailyStats = usageData.dailyStats.slice(-30);
      }
      
      // Reset counters
      usageData.accounts = {};
      usageData.proxies = {};
      usageData.pairs = {};
      usageData.lastReset = timestamp;
    }
    
    // Increment account usage
    if (accountId) {
      if (!usageData.accounts[accountId]) {
        usageData.accounts[accountId] = {
          hits: 0,
          lastHit: null,
          pairs: {}
        };
      }
      
      usageData.accounts[accountId].hits++;
      usageData.accounts[accountId].lastHit = timestamp;
      
      // Track pairs used with this account
      if (!usageData.accounts[accountId].pairs[pair]) {
        usageData.accounts[accountId].pairs[pair] = 0;
      }
      usageData.accounts[accountId].pairs[pair]++;
    }
    
    // Increment proxy usage
    if (proxyHost) {
      if (!usageData.proxies[proxyHost]) {
        usageData.proxies[proxyHost] = {
          hits: 0,
          lastHit: null,
          pairs: {}
        };
      }
      
      usageData.proxies[proxyHost].hits++;
      usageData.proxies[proxyHost].lastHit = timestamp;
      
      // Track pairs used with this proxy
      if (!usageData.proxies[proxyHost].pairs[pair]) {
        usageData.proxies[proxyHost].pairs[pair] = 0;
      }
      usageData.proxies[proxyHost].pairs[pair]++;
    }
    
    // Track pair request frequency
    if (!usageData.pairs[pair]) {
      usageData.pairs[pair] = {
        hits: 0,
        lastHit: null
      };
    }
    
    usageData.pairs[pair].hits++;
    usageData.pairs[pair].lastHit = timestamp;
    
    // Save the updated usage data
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usageData, null, 2));
    
  } catch (error) {
    console.error('Error tracking API hit:', error);
  }
}

// Get current usage statistics
export function getUsageStats() {
  try {
    if (!ensureUsageFile()) return {};
    
    const usageData = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    return usageData;
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {};
  }
}

// Calculate the load distribution percentage for accounts
export function getLoadDistribution() {
  try {
    const stats = getUsageStats();
    const totalHits = Object.values(stats.accounts || {}).reduce((sum, account) => sum + account.hits, 0);
    
    if (totalHits === 0) return { accounts: {}, proxies: {} };
    
    const accountDistribution = {};
    Object.entries(stats.accounts || {}).forEach(([accountId, data]) => {
      accountDistribution[accountId] = {
        percentage: (data.hits / totalHits) * 100,
        hits: data.hits,
        pairs: data.pairs
      };
    });
    
    const totalProxyHits = Object.values(stats.proxies || {}).reduce((sum, proxy) => sum + proxy.hits, 0);
    const proxyDistribution = {};
    Object.entries(stats.proxies || {}).forEach(([proxyHost, data]) => {
      proxyDistribution[proxyHost] = {
        percentage: (data.hits / totalProxyHits) * 100,
        hits: data.hits,
        pairs: data.pairs
      };
    });
    
    return { 
      accounts: accountDistribution, 
      proxies: proxyDistribution,
      pairs: stats.pairs || {},
      lastReset: stats.lastReset,
      dailyStats: stats.dailyStats || []
    };
  } catch (error) {
    console.error('Error calculating load distribution:', error);
    return { accounts: {}, proxies: {} };
  }
} 