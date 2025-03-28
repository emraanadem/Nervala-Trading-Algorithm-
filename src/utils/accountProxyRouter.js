import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load accounts, proxies and proxy auth info
let accounts = [];
let proxies = [];
let proxyAuth = {};

try {
  // Load accounts
  const accountsPath = path.join(__dirname, '../../data/accounts.json');
  const accountsData = fs.readFileSync(accountsPath, 'utf8');
  accounts = JSON.parse(accountsData);
  
  // Load proxies
  const proxiesPath = path.join(__dirname, '../../data/proxylist.json');
  const proxiesData = fs.readFileSync(proxiesPath, 'utf8');
  proxies = JSON.parse(proxiesData);
  
  // Load proxy authentication
  const proxyAuthPath = path.join(__dirname, '../../data/proxyauth.json');
  const proxyAuthData = fs.readFileSync(proxyAuthPath, 'utf8');
  proxyAuth = JSON.parse(proxyAuthData);
  
  console.log(`Loaded ${accounts.length} accounts and ${proxies.length} proxies for routing`);
} catch (error) {
  console.error('Error loading account/proxy data:', error);
}

/**
 * Routes a currency pair to a specific account and proxy combination
 * Uses a deterministic algorithm based on the currency pair name
 */
export function routePairToAccountAndProxy(pair) {
  if (!accounts.length || !proxies.length) {
    console.warn('No accounts or proxies available for routing');
    return {
      account: null,
      proxy: null,
      proxyAuth
    };
  }
  
  // Use a hash of the pair name to consistently route the same pair to the same account/proxy
  const pairHash = pair.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0);
  
  // Use absolute value in case of negative hash
  const positiveHash = Math.abs(pairHash);
  
  // Select account and proxy based on the hash
  const accountIndex = positiveHash % accounts.length;
  const proxyIndex = positiveHash % proxies.length;
  
  const account = accounts[accountIndex];
  const proxy = proxies[proxyIndex];
  
  // Return the selected resources
  return {
    account: {
      id: account[0],
      token: account[1]
    },
    proxy: {
      type: proxy[0],
      host: proxy[1],
      port: proxy[2],
      id: proxy[3]
    },
    proxyAuth
  };
}

/**
 * Get a list of all available pairs with their assigned accounts and proxies
 * Useful for debugging and monitoring
 */
export function getPairAccountProxyMap(pairs) {
  const mapping = {};
  
  pairs.forEach(pair => {
    const { account, proxy } = routePairToAccountAndProxy(pair);
    
    if (account && proxy) {
      mapping[pair] = {
        accountId: account.id,
        proxyHost: `${proxy.host}:${proxy.port}`
      };
    }
  });
  
  return mapping;
} 