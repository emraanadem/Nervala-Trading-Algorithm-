const fs = require('fs')
const axios = require('axios')
const http = require('node:http')
const https = require('node:https')
let raw = fs.readFileSync('accinfo.json')
let accinfo = JSON.parse(raw)
let rawtwo = fs.readFileSync('instrument.json')
let instrument = JSON.parse(rawtwo)['instrument']
var testdaily = require('./Daily3.js')
var testfifteen = require('./FifteenMin3.js')
var testthirtymin = require('./ThirtyMin3.js')
var testonehour = require('./OneHour3.js')
var testtwohour = require('./TwoHour3.js')
var testfourhour = require('./FourHour3.js')
var testweekly = require('./Weekly3.js')

let accountID = String(accinfo[0])
let token = String(accinfo[1])
let rawthree = fs.readFileSync('proxyinfo.json')
let proxyinfo = JSON.parse(rawthree)
let proxyval =   {
      protocol: String(proxyinfo[1]),
      host: String(proxyinfo[2]),
      port: parseInt(proxyinfo[3])
}

async function test(){
const instance = axios.create({
  baseURL: "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?",
  headers: {
    Authorization: "Bearer " + token
  }, proxy: proxyval})

  let url = "count=1000&granularity=M5"
  const options = {
    headers: {
      Authorization: "Bearer " + token
    },
    maxRedirects: 100
  };
  const res = await instance.get(url, options);

}
test()