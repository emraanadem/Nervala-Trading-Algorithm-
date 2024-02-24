const fs = require('fs');
const regression = require('ml-regression-simple-linear');
const emas = require('technicalindicators').EMA
const rsis = require('technicalindicators').RSI
const macds = require('technicalindicators').MACD
const rocs = require('technicalindicators').ROC;
const bolls = require('technicalindicators').BollingerBands;
const smas = require('technicalindicators').SMA;
const tr = require('technicalindicators').ATR;
const { createModel } = require('polynomial-regression');
const nerdamer = require("nerdamer/all.min");
const roots = require('kld-polynomial');
const { onerror } = require('q');
const { disconnect } = require('process');
const createClient = require('@supabase/supabase-js').createClient;
const datass = require("./HistAssign.js").results;
const datasets = require("./HistAssign.js").center;
const https = require('https')
// Create a single supabase client for interacting with your database
const supabase = createClient('https://nvlbmpghemfunkpnhwee.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY')

async function test(){
var { data, error } = await supabase
  .from('One_Hour')
  .select('Data')
  .eq('Instrument', "EUR_USD")
  .eq("OHLC", 'c')

  console.log(data)
}
test()