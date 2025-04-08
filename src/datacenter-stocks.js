import { ProxyAgent } from 'undici' // native fetch uses undici as underlying HTTP handler, need the agent from it
import moment from 'moment';

import { testfifteen } from './FifteenMin.js'
import { testthirtymin } from './ThirtyMin.js'
import { testonehour } from './OneHour.js'
import { testtwohour } from './TwoHour.js'
import { testfourhour } from './FourHour.js'
import { testdaily } from './Daily.js'
import { testweekly } from './Weekly.js'

async function getCandleData (baseUrl, options, timescaleLabel) {
  const params = `${timescaleLabel[0]}${moment().subtract(timescaleLabel[2], 'days').format().split('T')[0]}/${moment().format().split('T')[0]}?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG`

  let res = await fetch(baseUrl + params, options)
  let data = await res.json()

  const candleData = {}
  candleData[`${timescaleLabel[1]}`] = {}
  candleData[`${timescaleLabel[1]}`].o = data.results.map((x) => parseFloat(x.o))
  candleData[`${timescaleLabel[1]}`].h = data.results.map((x) => parseFloat(x.h))
  candleData[`${timescaleLabel[1]}`].l = data.results.map((x) => parseFloat(x.l))
  candleData[`${timescaleLabel[1]}`].c = data.results.map((x) => parseFloat(x.c))

  while ('next_url' in data) {
    const nextPageURL = `${data.next_url}&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG`

    res = await fetch(nextPageURL, options)
    data = await res.json()

    if ('results' in data)
    {
      candleData[`${timescaleLabel[1]}`].o = candleData[`${timescaleLabel[1]}`].o.concat(data.results.map((x) => parseFloat(x.o)))
      candleData[`${timescaleLabel[1]}`].h = candleData[`${timescaleLabel[1]}`].h.concat(data.results.map((x) => parseFloat(x.h)))
      candleData[`${timescaleLabel[1]}`].l = candleData[`${timescaleLabel[1]}`].l.concat(data.results.map((x) => parseFloat(x.l)))
      candleData[`${timescaleLabel[1]}`].c = candleData[`${timescaleLabel[1]}`].c.concat(data.results.map((x) => parseFloat(x.c)))
    }
  }

  candleData[`${timescaleLabel[1]} Extend`] = candleData[`${timescaleLabel[1]}`]

  return candleData
}

async function getAggregatedCandleData (baseUrl, options) {
  const timescaleLabels = [
    ['5/minute/', 'Five_Min', 5],
    ['15/minute/', 'Fifteen_Min', 16.25],
    ['30/minute/', 'Thirty_Min', 35],
    ['1/hour/', 'One_Hour', 69],
    ['2/hour/', 'Two_Hour', 124.5],
    ['4/hour/', 'Four_Hour', 248],
    ['1/day/', 'Daily', 1062.5],
    ['1/week/', 'Weekly', 5115]
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

async function getPrice (instrument, options) {
  const url = `https://api.polygon.io/v2/last/trade/${instrument}/?apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG`

  let res = await fetch(url, options)
  let data = await res.json()

  return data.results.p
}

function equalizeCandleSetLengths (candleData) {
  const timescaleLabels = Object.keys(candleData);
  const minLength = timescaleLabels.reduce((x, y) => Math.min(x, candleData[y].o.length), Infinity)

  for (const timescale of timescaleLabels)
  {
    const sliceEnd = candleData[timescale].o.length
    if (sliceEnd > minLength)
    {
      const sliceStart = candleData[timescale].o.length - minLength
      candleData[timescale].o = candleData[timescale].o.slice(sliceStart, sliceEnd)
      candleData[timescale].h = candleData[timescale].h.slice(sliceStart, sliceEnd)
      candleData[timescale].l = candleData[timescale].l.slice(sliceStart, sliceEnd)
      candleData[timescale].c = candleData[timescale].c.slice(sliceStart, sliceEnd)
    }
  }

  return candleData
}

export async function checkForSignals (instrument, proxy = null, proxyauths = null, loop = false) {
  const baseUrl = `https://api.polygon.io/v2/aggs/ticker/${instrument}/range/`
  let options = {}

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
    const price = await getPrice(instrument, options)
    equalizeCandleSetLengths(candleData)

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
