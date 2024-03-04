// Making a request using axios: https://github.com/axios/axios#example
const axios = require('axios');
const http = require('node:http')
const https = require('node:https')
const fs = require('fs')
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

const url =  'https://proxy.scrapeops.io/v1/?api_key=f0bdfa08-797b-45ae-bc06-da63d2e8b732&url=https://api-fxpractice.oanda.com/v3/accounts/101-001-28245478-001/instruments/GBP_HKD/candles?/count=1000&granularity=H2'

axios.get(url, { headers: { Authorization: "Bearer " + token } })
  .then(function (response) {
    // print out the page response
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });