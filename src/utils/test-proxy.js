const { ProxyAgent } = require('undici');
const fs = require('fs');
const path = require('path');

// Load accounts, proxies and proxy auth info manually
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
  
  console.log(`Loaded ${accounts.length} accounts and ${proxies.length} proxies for testing`);
} catch (error) {
  console.error('Error loading account/proxy data:', error);
  process.exit(1);
}

function routePairToAccount(pair) {
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

async function testProxyAuth(pair) {
  try {
    console.log(`Testing proxy for ${pair}...`);
    
    // Get the proxy details for this pair
    const { account, proxy, proxyAuth } = routePairToAccount(pair);
    
    if (!account || !proxy) {
      console.error('No account or proxy found for this pair');
      return false;
    }
    
    console.log(`Using account: ${account.id}`);
    console.log(`Using proxy: ${proxy.type}://${proxy.host}:${proxy.port}`);
    console.log(`Using proxy auth: ${proxyAuth.username}:****`);
    
    // Create proxy agent
    const proxyAgent = new ProxyAgent({
      uri: `${proxy.type}://${proxy.host}:${proxy.port}`,
      token: `Basic ${Buffer.from(`${proxyAuth.username}:${proxyAuth.password}`).toString('base64')}`
    });
    
    // Make a simple request to OANDA
    const baseUrl = 'https://api-fxpractice.oanda.com';
    const endpoint = `/v3/accounts/${account.id}/instruments/${pair}/candles`;
    const params = 'count=1&granularity=M1&price=M';
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${account.token}`,
        'Content-Type': 'application/json'
      },
      dispatcher: proxyAgent,
      signal: AbortSignal.timeout(30000)
    };
    
    console.log(`Making request to ${baseUrl}${endpoint}?${params}`);
    
    const response = await fetch(`${baseUrl}${endpoint}?${params}`, options);
    
    if (response.ok) {
      console.log(`Proxy authentication successful! Status: ${response.status}`);
      const data = await response.json();
      console.log(`Data received: ${JSON.stringify(data).substring(0, 200)}...`);
      return true;
    } else {
      console.error(`Request failed! Status: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    console.error('Error during proxy test:', error);
    return false;
  }
}

// Test some pairs
const pairsToTest = ['EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD'];

async function runTests() {
  for (const pair of pairsToTest) {
    console.log(`\n==== Testing ${pair} ====`);
    const result = await testProxyAuth(pair);
    console.log(`${pair} test ${result ? 'PASSED' : 'FAILED'}`);
  }
}

runTests(); 