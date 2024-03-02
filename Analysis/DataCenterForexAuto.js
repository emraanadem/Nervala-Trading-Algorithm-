const fs = require('fs')
const axios = require('axios')
const fetch = require('node-fetch')
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

  async function Five_Min(instrument){
      let accountID = String(accinfo[0])
      let token = String(accinfo[1])
      let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M5"
      const options = {
        headers: {
          Authorization: "Bearer " + token
        }
      };
      const res = await fetch(url, options);
      const data = await res.json();
          for(let item = 0; item < data.candles.length; item++){
            values["Five_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
          }
          
        }
  async function Fifteen_Min(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Thirty_Min(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function One_Hour(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Two_Hour(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Two_Hour']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Four_Hour(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Daily(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Weekly(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Five_Min_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Fifteen_Min_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Thirty_Min_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function One_Hour_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Two_Hour_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Four_Hour_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Four_Hour Extend']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Daily_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Daily Extend']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Weekly_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Five_Min_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Fifteen_Min_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Thirty_Min_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function One_Hour_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Two_Hour_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Four_Hour_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Daily_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Weekly_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Five_Min_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Fifteen_Min_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Thirty_Min_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function One_Hour_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Two_Hour_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Four_Hour_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Daily_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Weekly_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Five_Min_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Fifteen_Min_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Thirty_Min_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function One_Hour_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Two_Hour_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Four_Hour_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Daily_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Weekly_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Five_Min_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Fifteen_Min_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Thirty_Min_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Thirty_Min Extend']['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function One_Hour_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Two_Hour_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Four_Hour_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Daily_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Weekly_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Five_Min_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Fifteen_Min_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Thirty_Min_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]["l"].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function One_Hour_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Two_Hour_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Four_Hour_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Daily_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Weekly_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Five_Min_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Fifteen_Min_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Thirty_Min_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function One_Hour_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Two_Hour_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values['Two_Hour Extend']['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Four_Hour_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Daily_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Weekly_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
      }

  async function Price(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?count=1&granularity=M1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await fetch(url, options);
    const data = await res.json();
    price = parseFloat(data.candles[0].mid['c'])
        }


async function Assign(){
  let g = 0
  while(g == 0){
    Assigner()
    await Five_Min(instrument)
    await Fifteen_Min(instrument)
    await Thirty_Min(instrument)
    await One_Hour(instrument)
    await Two_Hour(instrument)
    await Four_Hour(instrument)
    await Daily(instrument)
    await Weekly(instrument)
    await Five_Min_Extend(instrument)
    await Fifteen_Min_Extend(instrument)
    await Thirty_Min_Extend(instrument)
    await One_Hour_Extend(instrument)
    await Two_Hour_Extend(instrument)
    await Four_Hour_Extend(instrument)
    await Daily_Extend(instrument)
    await Weekly_Extend(instrument)
    await Five_Min_High(instrument)
    await Fifteen_Min_High(instrument)
    await Thirty_Min_High(instrument)
    await One_Hour_High(instrument)
    await Two_Hour_High(instrument)
    await Four_Hour_High(instrument)
    await Daily_High(instrument)
    await Weekly_High(instrument)
    await Five_Min_Extend_High(instrument)
    await Fifteen_Min_Extend_High(instrument)
    await Thirty_Min_Extend_High(instrument)
    await One_Hour_Extend_High(instrument)
    await Two_Hour_Extend_High(instrument)
    await Four_Hour_Extend_High(instrument)
    await Daily_Extend_High(instrument)
    await Weekly_Extend_High(instrument)
    await Five_Min_Open(instrument)
    await Fifteen_Min_Open(instrument)
    await Thirty_Min_Open(instrument)
    await One_Hour_Open(instrument)
    await Two_Hour_Open(instrument)
    await Four_Hour_Open(instrument)
    await Daily_Open(instrument)
    await Weekly_Open(instrument)
    await Five_Min_Extend_Open(instrument)
    await Fifteen_Min_Extend_Open(instrument)
    await Thirty_Min_Extend_Open(instrument)
    await One_Hour_Extend_Open(instrument)
    await Two_Hour_Extend_Open(instrument)
    await Four_Hour_Extend_Open(instrument)
    await Daily_Extend_Open(instrument)
    await Weekly_Extend_Open(instrument)
    await Five_Min_Low(instrument)
    await Fifteen_Min_Low(instrument)
    await Thirty_Min_Low(instrument)
    await One_Hour_Low(instrument)
    await Two_Hour_Low(instrument)
    await Four_Hour_Low(instrument)
    await Daily_Low(instrument)
    await Weekly_Low(instrument)
    await Five_Min_Extend_Low(instrument)
    await Fifteen_Min_Extend_Low(instrument)
    await Thirty_Min_Extend_Low(instrument)
    await One_Hour_Extend_Low(instrument)
    await Two_Hour_Extend_Low(instrument)
    await Four_Hour_Extend_Low(instrument)
    await Daily_Extend_Low(instrument)
    await Weekly_Extend_Low(instrument)
    await Price(instrument)
    testdaily.testdaily(values, price)
    testfifteen.testfifteenmin(values, price)
    testfourhour.testfourhour(values, price)
    testtwohour.testtwohour(values, price)
    testonehour.testonehour(values, price)
    testthirtymin.testthirtymin(values, price)
    testweekly.testweekly(values, price)
  }
}
Assign()