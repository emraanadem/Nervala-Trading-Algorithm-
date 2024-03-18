const instruments = import('instruments.json')
const instrumentsForex = import('instrumentsForex.json')
const instrumentsStocks = import('instrumentsStocks.json')
const proxies = import('proxylist2.json')
const accounts = import('accounts.json')

import { assign as forexAssign } from './DataCenterForex'
import { assign as stocksAssign } from './DataCenterStocks'

let inputData = []

for (let i = 0; i < instruments.length; i++) {
  inputData.push([instruments[i], proxies[i % proxies.length], accounts[i % accounts.length]])
}

for (let i = 0; i < inputData.length; i++) {
  if (instrumentsForex.includes(inputData[i][0])) {
    forexAssign(...inputData[i])
  }
  if (instrumentsStocks.includes(inputData[i][0])) {
    stocksAssign(...inputData[i])
  }
}