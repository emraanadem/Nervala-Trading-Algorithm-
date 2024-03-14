const fs = require('fs')
let raw = fs.readFileSync('instrumentsAll.json')
let rawtwo = fs.readFileSync('instrumentsForex.json')
let rawfour = fs.readFileSync('instrumentsStocks.json')
let rawthree = fs.readFileSync('proxylist2.json')
let rawfive = fs.readFileSync('accounts.json')
var testforex = require('./DataCenterForex.js')
var teststocks = require('./DataCenterStocks.js')
let proxies = JSON.parse(rawthree)
let instrumentsAll = JSON.parse(raw)
let forex = JSON.parse(rawtwo)['instruments']
let stocks = JSON.parse(rawfour)['instruments']
let accounts = JSON.parse(rawfive)
let importantinfo = []


async function Hub(){
    let reversecount = 0
    let reversecounttwo = 0
    let reversecountthree = 0
    let reversecountfour = 0
    for(var count = 0; count < instrumentsAll['instruments'].length; count++){
        if(count < 50){
        importantinfo.push([instrumentsAll['instruments'][count], proxies[count], accounts[count]])}
        if(100 > count && count > 49){
            importantinfo.push([instrumentsAll['instruments'][count], proxies[count], accounts[reversecount]])
            reversecount += 1
        }
        if(count > 99 && count < 150){
            importantinfo.push([instrumentsAll['instruments'][count], proxies[reversecounttwo], accounts[reversecountthree]])
            reversecounttwo += 1
            reversecountthree += 1
        }
        if(count > 150){
            importantinfo.push([instrumentsAll['instruments'][count], proxies[reversecounttwo], accounts[reversecountfour]])
            reversecounttwo += 1
            reversecountfour += 1
        }
    }
    for(var count = 0; count < importantinfo.length; count++){
        if(forex.includes(importantinfo[count][0])){
            testforex.assigning(importantinfo[count][0], importantinfo[count][1], importantinfo[count][2])}
        if(stocks.includes(importantinfo[count][0])){
            teststocks.assigning(importantinfo[count][0], importantinfo[count][1], importantinfo[count][2])}
        
}}
Hub()