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

const instance = axios.create({
  baseURL: "https://"+"api-fxpractice.oanda.com"+"/v3/accounts/"+accountID+"/instruments/"+instrument+"/candles?",
  headers: {
    Authorization: "Bearer " + token
  }
  })




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
      let url = "count=1000&granularity=M5"
      const options = {
        headers: {
          Authorization: "Bearer " + token
        }
      };
      const res = await instance.get(url, options);
      const data = await res.data;
          for(let item = 0; item < data.candles.length; item++){
            values["Five_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
          }
          
        }
  async function Fifteen_Min(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Thirty_Min(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function One_Hour(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Two_Hour(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values['Two_Hour']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Four_Hour(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Daily(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Weekly(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Five_Min_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Fifteen_Min_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Thirty_Min_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function One_Hour_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Two_Hour_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Four_Hour_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values['Four_Hour Extend']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Daily_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values['Daily Extend']['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Weekly_Extend(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['c'].push(parseFloat(data.candles[item].mid['c']))
        }
        
      }
  async function Five_Min_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Fifteen_Min_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Thirty_Min_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function One_Hour_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Two_Hour_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Four_Hour_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Daily_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Weekly_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Five_Min_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Fifteen_Min_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Thirty_Min_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function One_Hour_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Two_Hour_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Four_Hour_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Daily_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Weekly_Extend_High(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['h'].push(parseFloat(data.candles[item].mid['h']))
        }
        
      }
  async function Five_Min_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Fifteen_Min_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Thirty_Min_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function One_Hour_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Two_Hour_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Four_Hour_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Daily_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Weekly_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Five_Min_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Fifteen_Min_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Thirty_Min_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values['Thirty_Min Extend']['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function One_Hour_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Two_Hour_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Four_Hour_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Daily_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Weekly_Extend_Open(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['o'].push(parseFloat(data.candles[item].mid['o']))
        }
        
      }
  async function Five_Min_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Fifteen_Min_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Thirty_Min_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min"]["l"].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function One_Hour_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Two_Hour_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Two_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Four_Hour_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Daily_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Weekly_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1000&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Five_Min_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M5"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Five_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Fifteen_Min_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M15"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Fifteen_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Thirty_Min_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=M30"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Thirty_Min Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function One_Hour_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["One_Hour Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Two_Hour_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H2"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values['Two_Hour Extend']['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Four_Hour_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=H4"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Four_Hour Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Daily_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=D"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Daily Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
        
      }
  async function Weekly_Extend_Low(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=2500&granularity=W"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
        for(let item = 0; item < data.candles.length; item++){
          values["Weekly Extend"]['l'].push(parseFloat(data.candles[item].mid['l']))
        }
      }

  async function Price(instrument){
    let accountID = String(accinfo[0])
    let token = String(accinfo[1])
    let url = "count=1&granularity=M1"
    const options = {
      headers: {
        Authorization: "Bearer " + token
      }
    };
    const res = await instance.get(url, options);
    const data = await res.data;
    price = parseFloat(data.candles[0].mid['c']
    )
        }

async function Assign(){
  Assigner()
  Five_Min(instrument)
  Fifteen_Min(instrument)
  Thirty_Min(instrument)
  One_Hour(instrument)
  Two_Hour(instrument)
  Four_Hour(instrument)
  Daily(instrument)
  Weekly(instrument)
  Five_Min_Extend(instrument)
  Fifteen_Min_Extend(instrument)
  Thirty_Min_Extend(instrument)
  One_Hour_Extend(instrument)
  Two_Hour_Extend(instrument)
  Four_Hour_Extend(instrument)
  Daily_Extend(instrument)
  Weekly_Extend(instrument)
  Five_Min_High(instrument)
  Fifteen_Min_High(instrument)
  Thirty_Min_High(instrument)
  One_Hour_High(instrument)
  Two_Hour_High(instrument)
  Four_Hour_High(instrument)
  Daily_High(instrument)
  Weekly_High(instrument)
  Five_Min_Extend_High(instrument)
  Fifteen_Min_Extend_High(instrument)
  Thirty_Min_Extend_High(instrument)
  One_Hour_Extend_High(instrument)
  Two_Hour_Extend_High(instrument)
  Four_Hour_Extend_High(instrument)
  Daily_Extend_High(instrument)
  Weekly_Extend_High(instrument)
  Five_Min_Open(instrument)
  Fifteen_Min_Open(instrument)
  Thirty_Min_Open(instrument)
  One_Hour_Open(instrument)
  Two_Hour_Open(instrument)
  Four_Hour_Open(instrument)
  Daily_Open(instrument)
  Weekly_Open(instrument)
  Five_Min_Extend_Open(instrument)
  Fifteen_Min_Extend_Open(instrument)
  Thirty_Min_Extend_Open(instrument)
  One_Hour_Extend_Open(instrument)
  Two_Hour_Extend_Open(instrument)
  Four_Hour_Extend_Open(instrument)
  Daily_Extend_Open(instrument)
  Weekly_Extend_Open(instrument)
  Five_Min_Low(instrument)
  Fifteen_Min_Low(instrument)
  Thirty_Min_Low(instrument)
  One_Hour_Low(instrument)
  Two_Hour_Low(instrument)
  Four_Hour_Low(instrument)
  Daily_Low(instrument)
  Weekly_Low(instrument)
  Five_Min_Extend_Low(instrument)
  Fifteen_Min_Extend_Low(instrument)
  Thirty_Min_Extend_Low(instrument)
  One_Hour_Extend_Low(instrument)
  Two_Hour_Extend_Low(instrument)
  Four_Hour_Extend_Low(instrument)
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
Assign()

/* © 2024 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
have been included with this distribution. */