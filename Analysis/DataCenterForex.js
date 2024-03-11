const fs = require('fs')
const { ProxyAgent } = require('undici') // native fetch uses undici as underlying HTTP handler, need the agent from it
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




// Set up common connection parameters; once you hit a rate limit and want to rotate proxies or if you want
// to randomize, you need to construct proxyAgent again with the new proxy details
const baseURL = `https://api-fxpractice.oanda.com/v3/accounts/${accountID}/instruments/${instrument}/candles?`
const proxyAgent = new ProxyAgent({
  uri: `http://${proxyinfo[2]}:${proxyinfo[3]}`
});
const options = {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  dispatcher: proxyAgent
};



values = {}
let price = 0

function Assigner(){
  values = {}
  let timeperiods = ["Five_Min", "Fifteen_Min", "Thirty_Min", "One_Hour", "Two_Hour", "Four_Hour", "Daily", "Weekly", "Five_Min Extend", "Fifteen_Min Extend", "Thirty_Min Extend", "One_Hour Extend", "Two_Hour Extend", "Four_Hour Extend", "Daily Extend", "Weekly Extend"]
  for(let item = 0; item < timeperiods.length; item++){
  values[timeperiods[item]] = {}
  values[timeperiods[item]]['o'] = []
  values[timeperiods[item]]['h'] = []
  values[timeperiods[item]]['l'] = []
  values[timeperiods[item]]['c'] = []

  }
}

async function Five_Min(){
  let params = "count=1000&granularity=M5"

  const response = await fetch(baseURL + params, options); // fetch is a native global, no module needed
  const data = await response.json(); // Parsing the response stream is async, this returns a Promise

  for (let item = 0; item < data.candles.length; item++){
    values["Five_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
  }// Print what we got to confirm
}

  async function Fifteen_Min(){
  
    let params = "count=1000&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Thirty_Min(){
  
    let params = "count=1000&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function One_Hour(){
  
    let params = "count=1000&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Two_Hour(){
  
    let params = "count=1000&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Two_Hour']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Four_Hour(){
  
    let params = "count=1000&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Daily(){
  
    let params = "count=1000&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Weekly(){
  
    let params = "count=1000&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Five_Min_Extend(){
  
    let params = "count=2500&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Fifteen_Min_Extend(){
  
    let params = "count=2500&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Thirty_Min_Extend(){
  
    let params = "count=2500&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function One_Hour_Extend(){
  
    let params = "count=2500&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Two_Hour_Extend(){
  
    let params = "count=2500&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Four_Hour_Extend(){
  
    let params = "count=2500&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Four_Hour Extend']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Daily_Extend(){
  
    let params = "count=2500&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Daily Extend']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Weekly_Extend(){
  
    let params = "count=2500&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Five_Min_High(){
  
    let params = "count=1000&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Fifteen_Min_High(){
  
    let params = "count=1000&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Thirty_Min_High(){
  
    let params = "count=1000&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function One_Hour_High(){
  
    let params = "count=1000&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Two_Hour_High(){
  
    let params = "count=1000&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Four_Hour_High(){
  
    let params = "count=1000&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Daily_High(){
  
    let params = "count=1000&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Weekly_High(){
  
    let params = "count=1000&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Five_Min_Extend_High(){
  
    let params = "count=2500&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Fifteen_Min_Extend_High(){
  
    let params = "count=2500&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Thirty_Min_Extend_High(){
  
    let params = "count=2500&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function One_Hour_Extend_High(){
  
    let params = "count=2500&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Two_Hour_Extend_High(){
  
    let params = "count=2500&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Four_Hour_Extend_High(){
  
    let params = "count=2500&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Daily_Extend_High(){
  
    let params = "count=2500&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Weekly_Extend_High(){
  
    let params = "count=2500&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Five_Min_Open(){
  
    let params = "count=1000&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Fifteen_Min_Open(){
  
    let params = "count=1000&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Thirty_Min_Open(){
  
    let params = "count=1000&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function One_Hour_Open(){
  
    let params = "count=1000&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Two_Hour_Open(){
  
    let params = "count=1000&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Four_Hour_Open(){
  
    let params = "count=1000&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Daily_Open(){
  
    let params = "count=1000&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Weekly_Open(){
  
    let params = "count=1000&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Five_Min_Extend_Open(){
  
    let params = "count=2500&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Fifteen_Min_Extend_Open(){
  
    let params = "count=2500&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Thirty_Min_Extend_Open(){
  
    let params = "count=2500&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Thirty_Min Extend']['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function One_Hour_Extend_Open(){
  
    let params = "count=2500&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Two_Hour_Extend_Open(){
  
    let params = "count=2500&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Four_Hour_Extend_Open(){
  
    let params = "count=2500&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Daily_Extend_Open(){
  
    let params = "count=2500&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Weekly_Extend_Open(){
  
    let params = "count=2500&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Five_Min_Low(){
  
    let params = "count=1000&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Fifteen_Min_Low(){
  
    let params = "count=1000&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Thirty_Min_Low(){
  
    let params = "count=1000&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]["l"].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function One_Hour_Low(){
  
    let params = "count=1000&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Two_Hour_Low(){
  
    let params = "count=1000&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Four_Hour_Low(){
  
    let params = "count=1000&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Daily_Low(){
  
    let params = "count=1000&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Weekly_Low(){
  
    let params = "count=1000&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Five_Min_Extend_Low(){
  
    let params = "count=2500&granularity=M5"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Fifteen_Min_Extend_Low(){
  
    let params = "count=2500&granularity=M15"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Thirty_Min_Extend_Low(){
  
    let params = "count=2500&granularity=M30"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function One_Hour_Extend_Low(){
  
    let params = "count=2500&granularity=H1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Two_Hour_Extend_Low(){
  
    let params = "count=2500&granularity=H2"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Two_Hour Extend']['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Four_Hour_Extend_Low(){
  
    let params = "count=2500&granularity=H4"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Daily_Extend_Low(){
  
    let params = "count=2500&granularity=D"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Weekly_Extend_Low(){
  
    let params = "count=2500&granularity=W"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
      }

  async function Price(){
  
    let params = "count=1&granularity=M1"
    
    const res = await fetch(baseURL + params, options);
    const data = await res.json();
    price = parseFloat(data.candles[0].mid['c']
    )
        }

async function Assign(){
  Assigner()
  Five_Min()
  Fifteen_Min()
  Thirty_Min()
  One_Hour()
  Two_Hour()
  Four_Hour()
  Daily()
  Weekly()
  Five_Min_Extend()
  Fifteen_Min_Extend()
  Thirty_Min_Extend()
  One_Hour_Extend()
  Two_Hour_Extend()
  Four_Hour_Extend()
  Daily_Extend()
  Weekly_Extend()
  Five_Min_High()
  Fifteen_Min_High()
  Thirty_Min_High()
  One_Hour_High()
  Two_Hour_High()
  Four_Hour_High()
  Daily_High()
  Weekly_High()
  Five_Min_Extend_High()
  Fifteen_Min_Extend_High()
  Thirty_Min_Extend_High()
  One_Hour_Extend_High()
  Two_Hour_Extend_High()
  Four_Hour_Extend_High()
  Daily_Extend_High()
  Weekly_Extend_High()
  Five_Min_Open()
  Fifteen_Min_Open()
  Thirty_Min_Open()
  One_Hour_Open()
  Two_Hour_Open()
  Four_Hour_Open()
  Daily_Open()
  Weekly_Open()
  Five_Min_Extend_Open()
  Fifteen_Min_Extend_Open()
  Thirty_Min_Extend_Open()
  One_Hour_Extend_Open()
  Two_Hour_Extend_Open()
  Four_Hour_Extend_Open()
  Daily_Extend_Open()
  Weekly_Extend_Open()
  Five_Min_Low()
  Fifteen_Min_Low()
  Thirty_Min_Low()
  One_Hour_Low()
  Two_Hour_Low()
  Four_Hour_Low()
  Daily_Low()
  Weekly_Low()
  Five_Min_Extend_Low()
  Fifteen_Min_Extend_Low()
  Thirty_Min_Extend_Low()
  One_Hour_Extend_Low()
  await Two_Hour_Extend_Low()
  await Four_Hour_Extend_Low()
  await Daily_Extend_Low()
  await Weekly_Extend_Low()
  await Price()
  console.log(values)
  console.log(price)
  testdaily.testdaily(values, price)
  testfifteen.testfifteenmin(values, price)
  testfourhour.testfourhour(values, price)
  testtwohour.testtwohour(values, price)
  testonehour.testonehour(values, price)
  testthirtymin.testthirtymin(values, price)
  testweekly.testweekly(values, price)
}

// Just running the first method in this dev branch as proof-of-concept
Assign()

/* © 2024 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
have been included with this distribution. */