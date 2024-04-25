import { checkForSignals as checkForex } from './src/datacenter-forex.js'
import { checkForSignals as checkStock } from './src/datacenter-stocks.js'
import instrumentsForex from './data/instrumentsForex.json' assert { type: "json" };
import instrumentsStocks from './data/instrumentsStocks.json' assert { type: "json" };
import proxies from './data/proxylist.json' assert { type: "json" };
import accounts from './data/accounts.json' assert { type: "json" };
import proxyauth from './data/proxyauth.json' assert {type: "json"};

let totalIterations = 0

for (let i = 0; i < instrumentsForex.length; i++, totalIterations++) {
  checkForex(instrumentsForex[i], accounts[totalIterations % accounts.length], proxies[totalIterations % proxies.length], proxyauth)
}

for (let i = 0; i < instrumentsStocks.length; i++, totalIterations++) {
  checkStock(instrumentsStocks[i], proxies[totalIterations % proxies.length], proxyauth) 
}