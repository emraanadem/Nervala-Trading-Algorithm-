const { ProxyAgent } = require('undici') // native fetch uses undici as underlying HTTP handler, need the agent from it

const { testfifteen } = require('./FifteenMin.js')
const { testthirtymin } = require('./ThirtyMin.js')
const { testonehour } = require('./OneHour.js')
const { testtwohour } = require('./TwoHour.js')
const { testfourhour } = require('./FourHour.js')
const { testdaily } = require('./Daily.js')
const { testweekly } = require('./Weekly.js')

async function getCandleData (baseUrl, options, timescaleLabel, instrument) {
  let retryCount = 0;
  const maxRetries = 100;
  
  while (true) {
    try {
      const params = `count=5000&granularity=${timescaleLabel[0]}`
      
      const res = await fetch(baseUrl + params, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      
      if (!res.ok) {
      }
      
      const data = await res.json()
      
      if (!data.candles || data.candles.length === 0) {
        // Retry on empty data
        retryCount++;
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        } else {
        }
      }
      
      const candleData = {}
      candleData[`${timescaleLabel[1]}`] = {}
      candleData[`${timescaleLabel[1]}`].o = data.candles.slice(Math.max(data.candles.length - 4000, 0), data.candles.length).map((x) => parseFloat(x.mid.o))
      candleData[`${timescaleLabel[1]}`].h = data.candles.slice(Math.max(data.candles.length - 4000, 0), data.candles.length).map((x) => parseFloat(x.mid.h))
      candleData[`${timescaleLabel[1]}`].l = data.candles.slice(Math.max(data.candles.length - 4000, 0), data.candles.length).map((x) => parseFloat(x.mid.l))
      candleData[`${timescaleLabel[1]}`].c = data.candles.slice(Math.max(data.candles.length - 4000, 0), data.candles.length).map((x) => parseFloat(x.mid.c))
      candleData[`${timescaleLabel[1]}_Extend`] = {}
      candleData[`${timescaleLabel[1]}_Extend`].o = data.candles.map((x) => parseFloat(x.mid.o))
      candleData[`${timescaleLabel[1]}_Extend`].h = data.candles.map((x) => parseFloat(x.mid.h))
      candleData[`${timescaleLabel[1]}_Extend`].l = data.candles.map((x) => parseFloat(x.mid.l))
      candleData[`${timescaleLabel[1]}_Extend`].c = data.candles.map((x) => parseFloat(x.mid.c))
      return candleData
    } catch (error) {
    }
  }
}

async function getAggregatedCandleData (baseUrl, options, instrument) {
  const timescaleLabels = [
    ['M5', 'Five_Min'],
    ['M15', 'Fifteen_Min'],
    ['M30', 'Thirty_Min'],
    ['H1', 'One_Hour'],
    ['H2', 'Two_Hour'],
    ['H4', 'Four_Hour'],
    ['D', 'Daily'],
    ['W', 'Weekly']
  ]

  function mergeCandles (...candleDataDicts) {
    let aggregatedCandleData = {}

    for (const candleData of candleDataDicts) {
      aggregatedCandleData = { ...aggregatedCandleData, ...candleData }
    }

    return aggregatedCandleData
  }

  try {
    
    // Process one timeframe at a time to avoid overwhelming the API
    let allCandleData = [];
    for (const timescale of timescaleLabels) {
      try {
        const candleData = await getCandleData(baseUrl, options, timescale, instrument);
        allCandleData.push(candleData);
      } catch (error) {
      }
    }
    
    return mergeCandles(...allCandleData);
  } catch (error) {
  }
}

async function getPrice (baseUrl, options) {
  let retryCount = 0;
  const maxRetries = 100;

  while (true) {
    try {
      const params = 'count=1&granularity=M1'
      const res = await fetch(baseUrl + params, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      
      if (!res.ok) {
      }
      
      const data = await res.json()
      if (!data.candles || data.candles.length === 0) {
      }
      
      return parseFloat(data.candles[0].mid.c)

    } catch (error) {
      
      retryCount++;
      if (retryCount <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      } else {
      }
    }
  }
}

module.exports = {
  checkForSignals: async function (instrument, accountInfo, proxy = null, proxyauths = null, loop = true) {
    
    const baseUrl = `https://api-fxpractice.oanda.com/v3/accounts/${accountInfo[0]}/instruments/${instrument}/candles?`
    let options = {
      headers: {
        Authorization: `Bearer ${accountInfo[1]}`
      }
    }
    if (proxy) {
      try {
        const proxyAgent = new ProxyAgent({
          uri: `http://${proxy[1]}:${proxy[2]}`,
          token: `Basic ${Buffer.from(`${proxyauths["username"]}:${proxyauths["password"]}`).toString('base64')}`,
        })
        options = {
          ...options,
          dispatcher: proxyAgent
        }
      } catch (proxyError) {
        // Continue without proxy if there's an error
      }
    }

    let cycleCount = 0;
    
    // CRITICAL FIX: Use while(true) instead of do-while to ensure true infinite loop
    while (true) {
      cycleCount++;
      try {
        
        const candleData = await getAggregatedCandleData(baseUrl, options, instrument)
        const price = await getPrice(baseUrl, options)


        if (candleData != null) {
          const timeframePairs = [
            ['Fifteen_Min', 'Fifteen_Min_Extend'],
            ['Thirty_Min', 'Thirty_Min_Extend'],
            ['One_Hour', 'One_Hour_Extend'],
            ['Two_Hour', 'Two_Hour_Extend'],
            ['Four_Hour', 'Four_Hour_Extend'],
            ['Daily', 'Daily_Extend'],
            ['Weekly', 'Weekly_Extend']
          ]

          let globalMinLength = Infinity
          for (const [regular, extended] of timeframePairs) {
            if (!candleData[regular] || !candleData[extended]) {
              continue;
            }

            const lengths = [
              candleData[regular].o?.length || 0,
              candleData[regular].h?.length || 0,
              candleData[regular].l?.length || 0,
              candleData[regular].c?.length || 0,
              candleData[extended].o?.length || 0,
              candleData[extended].h?.length || 0,
              candleData[extended].l?.length || 0,
              candleData[extended].c?.length || 0
            ]

            const minLength = Math.min(...lengths)
            globalMinLength = Math.min(globalMinLength, minLength)
          }

          if (globalMinLength === 0 || globalMinLength === Infinity) {
            continue;
          }

          for (const [regular, extended] of timeframePairs) {
            if (!candleData[regular] || !candleData[extended]) {
              continue;
            }

            // Take the last (newest) globalMinLength elements
            candleData[regular].o = candleData[regular].o.slice(-globalMinLength)
            candleData[regular].h = candleData[regular].h.slice(-globalMinLength)
            candleData[regular].l = candleData[regular].l.slice(-globalMinLength)
            candleData[regular].c = candleData[regular].c.slice(-globalMinLength)

            candleData[extended].o = candleData[extended].o.slice(-globalMinLength)
            candleData[extended].h = candleData[extended].h.slice(-globalMinLength)
            candleData[extended].l = candleData[extended].l.slice(-globalMinLength)
            candleData[extended].c = candleData[extended].c.slice(-globalMinLength)
          }

          // Run all the test functions for each timeframe
          
          try {
            testfifteen(candleData, price, instrument);
          } catch (e) {
          }
          
          try {
            testthirtymin(candleData, price, instrument);
          } catch (e) {
          }
          
          try {
            testonehour(candleData, price, instrument);
          } catch (e) {
          }
          
          try {
            testtwohour(candleData, price, instrument);
          } catch (e) {
          }
          
          try {
            testfourhour(candleData, price, instrument);
          } catch (e) {
          }
          
          try {
            testdaily(candleData, price, instrument);
          } catch (e) {
          }
          
          try {
            testweekly(candleData, price, instrument);
          } catch (e) {
          }
          
        }
      } catch (error) {
        
      }
      
      // Always add a delay between cycles to prevent API rate limiting
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds between cycles
    }
    
    // This line should never be reached
    console.log(`WARNING: Loop unexpectedly ended for ${instrument}`);
    return true;
  }
}

/* © 2024 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
have been included with this distribution. */