import { ProxyAgent } from 'undici' // native fetch uses undici as underlying HTTP handler, need the agent from it

import { testfifteen } from './FifteenMin.js'
import { testthirtymin } from './ThirtyMin.js'
import { testonehour } from './OneHour.js'
import { testtwohour } from './TwoHour.js'
import { testfourhour } from './FourHour.js'
import { testdaily } from './Daily.js'
import { testweekly } from './Weekly.js'

async function getCandleData (baseUrl, options, timescaleLabel) {
  const params = `count=2500&granularity=${timescaleLabel[0]}`

  const res = await fetch(baseUrl + params, options)
  const data = await res.json()

  const candleData = {}
  candleData[`${timescaleLabel[1]}`] = {}
  candleData[`${timescaleLabel[1]}`].o = data.candles.slice(Math.max(data.candles.length - 1000, 0), data.candles.length).map((x) => parseFloat(x.mid.o))
  candleData[`${timescaleLabel[1]}`].h = data.candles.slice(Math.max(data.candles.length - 1000, 0), data.candles.length).map((x) => parseFloat(x.mid.h))
  candleData[`${timescaleLabel[1]}`].l = data.candles.slice(Math.max(data.candles.length - 1000, 0), data.candles.length).map((x) => parseFloat(x.mid.l))
  candleData[`${timescaleLabel[1]}`].c = data.candles.slice(Math.max(data.candles.length - 1000, 0), data.candles.length).map((x) => parseFloat(x.mid.c))
  candleData[`${timescaleLabel[1]} Extend`] = {}
  candleData[`${timescaleLabel[1]} Extend`].o = data.candles.map((x) => parseFloat(x.mid.o))
  candleData[`${timescaleLabel[1]} Extend`].h = data.candles.map((x) => parseFloat(x.mid.h))
  candleData[`${timescaleLabel[1]} Extend`].l = data.candles.map((x) => parseFloat(x.mid.l))
  candleData[`${timescaleLabel[1]} Extend`].c = data.candles.map((x) => parseFloat(x.mid.c))
  return candleData
}

async function getAggregatedCandleData (baseUrl, options) {
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

  const candleDataDicts = await Promise.all(timescaleLabels.map(x => getCandleData(baseUrl, options, x)))

  return mergeCandles(...candleDataDicts)
}

async function getPrice (baseUrl, options) {
  const params = 'count=1&granularity=M1'

  const res = await fetch(baseUrl + params, options)
  const data = await res.json()

  return parseFloat(data.candles[0].mid.c)
}

export async function checkForSignals (instrument, accountInfo, proxy = null, proxyauths = null, loop = true) {
  const baseUrl = `https://api-fxpractice.oanda.com/v3/accounts/${accountInfo[0]}/instruments/${instrument}/candles?`
  let options = {
    headers: {
      Authorization: `Bearer ${accountInfo[1]}`
    }
  }
  if (proxy) {
    const proxyAgent = new ProxyAgent({
      uri: `http://${proxy[1]}:${proxy[2]}`,
      token: `Basic ${Buffer.from(`${proxyauths["username"]}:${proxyauths["password"]}`).toString('base64')}`,

    })
    options = {
      ...options,
      dispatcher: proxyAgent
    }
  }

  do {
    const candleData = await getAggregatedCandleData(baseUrl, options)
    const price = await getPrice(baseUrl, options)
    testfifteen(candleData, price, instrument)
    testthirtymin(candleData, price, instrument)
    testonehour(candleData, price, instrument)
    testtwohour(candleData, price, instrument)
    testfourhour(candleData, price, instrument)
    testdaily(candleData, price, instrument)
    testweekly(candleData, price, instrument)
  } while (loop)
}

/* © 2024 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
have been included with this distribution. */