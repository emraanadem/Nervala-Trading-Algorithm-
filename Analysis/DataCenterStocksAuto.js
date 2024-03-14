const fs = require('fs')
const axios = require('axios')
const yfin = require("yahoo-finance2").default;
var testdaily = require('./Daily.js')
var testfifteen = require('./FifteenMin.js')
var testthirtymin = require('./ThirtyMin.js')
var testonehour = require('./OneHour.js')
var testtwohour = require('./TwoHour.js')
var testfourhour = require('./FourHour.js')
var testweekly = require('./Weekly.js')
var moment = require('moment');
let yourDate = new Date()
let today = yourDate.toISOString().split('T')[0]
let refdayfive = moment().subtract(5, 'days').format().split('T')[0];
let refdayfifteen = moment().subtract(16.25, 'days').format().split('T')[0];
let refdaythirty = moment().subtract(35, 'days').format().split('T')[0];
let refdayhour = moment().subtract(69, 'days').format().split('T')[0];
let refdaytwohour = moment().subtract(124.5, 'days').format().split('T')[0];
let refdayfourhour = moment().subtract(248, 'days').format().split('T')[0];
let refdaydaily = moment().subtract(1062.5, 'days').format().split('T')[0];
let refdayweekly = moment().subtract(5115, 'days').format().split('T')[0];
var instrument = ""
var baseURL =  "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/"



values = {}

class Variables{

  five = []
  price = 0
  lenfive = 0
  fifteen = []
  lenfifteen = 0
  thirty = []
  lenthirty = 0
  onehour = []
  lenonehour = 0
  twohour = []
  lentwohour = 0
  fourhour = []
  lenfourhour = 0
  daily = []
  lendaily = 0
  weekly = []
  lenweekly = 0
  extendfive = []
  lenextendfive = 0
  extendfifteen = []
  lenextendfifteen = 0
  extendthirty = []
  lenextendthirty = 0
  extendonehour = []
  lenextendonehour = 0
  extendtwohour = []
  lenextendtwohour = 0
  extendfourhour = []
  lenextendfourhour = 0
  extenddaily = []
  lenextenddaily = 0
  extendweekly = []
  lenextendweekly = 0
  fivelow = []
  lenfivelow = 0
  fifteenlow = []
  lenfifteenlow = 0
  thirtylow = []
  lenthirtylow = 0
  onehourlow = []
  lenonehourlow = 0
  twohourlow = []
  lentwohourlow = 0
  fourhourlow = []
  lenfourhourlow = 0
  dailylow = []
  lendailylow = 0
  weeklylow = []
  lenweeklylow = 0
  extendfivelow = []
  lenextendfivelow = 0
  extendfifteenlow = []
  lenextendfifteenlow = 0
  extendthirtylow = []
  lenextendthirtylow = 0
  extendonehourlow = []
  lenextendonehourlow = 0
  extendtwohourlow = []
  lenextendtwohourlow = 0
  extendfourhourlow = []
  lenextendfourhourlow = 0
  extenddailylow = []
  lenextenddailylow = 0
  extendweeklylow = []
  lenextendweeklylow = 0
  fiveopen = []
  lenfiveopen = 0
  fifteenopen = []
  lenfifteenopen = 0
  thirtyopen = []
  lenthirtyopen = 0
  onehouropen = []
  lenonehouropen = 0
  twohouropen = []
  lentwohouropen = 0
  fourhouropen = []
  lenfourhouropen = 0
  dailyopen = []
  lendailyopen = 0
  weeklyopen = []
  lenweeklyopen = 0
  extendfiveopen = []
  lenextendfiveopen = 0
  extendfifteenopen = []
  lenextendfifteenopen = 0
  extendthirtyopen = []
  lenextendthirtyopen = 0
  extendonehouropen = []
  lenextendonehouropen = 0
  extendtwohouropen = []
  lenextendtwohouropen = 0
  extendfourhouropen = []
  lenextendfourhouropen = 0
  extenddailyopen = []
  lenextenddailyopen = 0
  extendweeklyopen = []
  lenextendweeklyopen = 0
  fivehigh = []
  lenfivehigh = 0
  fifteenhigh = []
  lenfifteenhigh = 0
  thirtyhigh = []
  lenthirtyhigh = 0
  onehourhigh = []
  lenonehourhigh = 0
  twohourhigh = []
  lentwohourhigh = 0
  fourhourhigh = []
  lenfourhourhigh = 0
  dailyhigh = []
  lendailyhigh = 0
  weeklyhigh = []
  lenweeklyhigh = 0
  extendfivehigh = []
  lenextendfivehigh = 0
  extendfifteenhigh = []
  lenextendfifteenhigh = 0
  extendthirtyhigh = []
  lenextendthirtyhigh = 0
  extendonehourhigh = []
  lenextendonehourhigh = 0
  extendtwohourhigh = []
  lenextendtwohourhigh = 0
  extendfourhourhigh = []
  lenextendfourhourhigh = 0
  extenddailyhigh = []
  lenextenddailyhigh = 0
  extendweeklyhigh = []
  lenextendweeklyhigh = 0





}

values = {}

function Assigner(){
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
  let aggs = []
  let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Five_Min"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Five_Min"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.five = values['Five_Min']['c']
  Variables.lenfive = Variables.five.length
  }

async function Fifteen_Min(){
  let aggs = []
  let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Fifteen_Min"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Fifteen_Min"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.fifteen = values["Fifteen_Min"]['c']
  Variables.lenfifteen = Variables.fifteen.length
}

async function Thirty_Min(){
  let aggs = []
  let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Thirty_Min"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Thirty_Min"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.thirty = values["Thirty_Min"]['c']
  Variables.lenthirty = Variables.thirty.length
}

async function One_Hour(){
  let aggs = []
  let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["One_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["One_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.onehour = values["One_Hour"]['c']
  Variables.lenonehour = Variables.onehour.length
            }


async function Two_Hour(){
  let aggs = []
  let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Two_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Two_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.twohour = values["Two_Hour"]['c']
  Variables.lentwohour = Variables.twohour.length
}

async function Four_Hour(){
  let aggs = []
  let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Four_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Four_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.fourhour = values["Four_Hour"]['c']
  Variables.lenfourhour = Variables.fourhour.length
}

async function Daily(){
  let aggs = []
  let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Daily"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Daily"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.daily = values["Daily"]['c']
  Variables.lendaily = Variables.daily.length
}

async function Weekly(){
  let aggs = []
  let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Weekly"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Weekly"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.weekly = values["Weekly"]['c']
  Variables.lenweekly = Variables.weekly.length
}
async function Five_Min_Extend(){
  let aggs = []
  let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Five_Min Extend"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Five_Min Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.extendfive = values["Five_Min Extend"]['c']
  Variables.lenextendfive = Variables.extendfive.length
    }

async function Fifteen_Min_Extend(){
  let aggs = []
  let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Fifteen_Min Extend"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Fifteen_Min Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.extendfifteen = values["Fifteen_Min Extend"]['c']
  Variables.lenextendfifteen = Variables.extendfifteen.length
}

async function Thirty_Min_Extend(){
  let aggs = []
  let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Thirty_Min Extend"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Thirty_Min Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.extendthirty = values["Thirty_Min Extend"]['c']
  Variables.lenextendthirty = Variables.extendthirty.length
}

async function One_Hour_Extend(){
  let aggs = []
  let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["One_Hour Extend"]['c'].push(parseFloat(data['results'][item]['c']))
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["One_Hour Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
  Variables.extendhour = values["One_Hour Extend"]['c']
  Variables.lenextendhour = Variables.extendhour.length
}

async function Two_Hour_Extend(){
  let aggs = []
  let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Two_Hour Extend"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Two_Hour Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.extendtwohour = values["Two_Hour Extend"]['c']
  Variables.lenextendtwohour = Variables.extendtwohour.length
}

async function Four_Hour_Extend(){
  let aggs = []
  let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Four_Hour Extend"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Four_Hour Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.extendfourhour = values["Four_Hour Extend"]['c']
  Variables.lenextendfourhour = Variables.extendfourhour.length
}

async function Daily_Extend(){
  let aggs = []
  let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Daily Extend"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Daily Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.extenddaily = values["Daily Extend"]['c']
  Variables.lenextenddaily = Variables.extenddaily.length
  }

async function Weekly_Extend(){
  let aggs = []
  let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(baseURL+url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Weekly Extend"]['c'].push(parseFloat(data['results'][item]['c']))
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
        if ('results' in data){
            for(let item = 0; item < data['results'].length; item++){
                values["Weekly Extend"]['c'].push(parseFloat(data['results'][item]['c']))
                }
              }}}
  Variables.extendweekly = values["Weekly Extend"]['c']
  Variables.lenextendweekly = Variables.extendweekly.length
  }
async function Five_Min_Low(){
    let aggs = []
    let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Five_Min"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Five_Min"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.fivelow = values["Five_Min"]['l']
    Variables.lenfivelow = Variables.fivelow.length
    }
  
async function Fifteen_Min_Low(){
    let aggs = []
    let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Fifteen_Min"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Fifteen_Min"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}} 
    Variables.fifteenlow = values["Fifteen_Min"]['l']
    Variables.lenfifteenlow = Variables.fifteenlow.length
  }
  
async function Thirty_Min_Low(){
    let aggs = []
    let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Thirty_Min"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Thirty_Min"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.thirtylow = values["Thirty_Min"]['l']
    Variables.lenthirtylow = Variables.thirtylow.length
  }
  
async function One_Hour_Low(){
    let aggs = []
    let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["One_Hour"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["One_Hour"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.hourlow = values["One_Hour"]['l']
    Variables.lenhourlow = Variables.hourlow.length
    }
  
async function Two_Hour_Low(){
    let aggs = []
    let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Two_Hour"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Two_Hour"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.twohourlow = values["Two_Hour"]['l']
    Variables.lentwohourlow = Variables.twohourlow.length
  }
  
async function Four_Hour_Low(){
    let aggs = []
    let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Four_Hour"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Four_Hour"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.fourhourlow = values["Four_Hour"]['l']
    Variables.lenfourhourlow = Variables.fourhourlow.length
  }
  
async function Daily_Low(){
    let aggs = []
    let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Daily"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Daily"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.dailylow = values["Daily"]['l']
    Variables.lendailylow = Variables.dailylow.length
  }
  
async function Weekly_Low(){
    let aggs = []
    let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Weekly"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Weekly"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.weeklylow = values["Weekly"]['l']
    Variables.lenweeklylow = Variables.weeklylow.length
  }
async function Five_Min_Extend_Low(){
    let aggs = []
    let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Five_Min Extend"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Five_Min Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.extendfivelow = values["Five_Min Extend"]['l']
    Variables.lenextendfivelow = Variables.extendfivelow.length
      }
  
async function Fifteen_Min_Extend_Low(){
    let aggs = []
    let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Fifteen_Min Extend"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Fifteen_Min Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.extendfifteenlow = values["Fifteen_Min Extend"]['l']
    Variables.lenextendfifteenlow = Variables.extendfifteenlow.length
  }
  
async function Thirty_Min_Extend_Low(){
    let aggs = []
    let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Thirty_Min Extend"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Thirty_Min Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.extendthirtylow = values["Thirty_Min Extend"]['l']
    Variables.lenextendthirtylow = Variables.extendthirtylow.length
  }
  
async function One_Hour_Extend_Low(){
    let aggs = []
    let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["One_Hour Extend"]['l'].push(parseFloat(data['results'][item]['l']))
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["One_Hour Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                    }
                  }}}
    Variables.extendhourlow = values["One_Hour Extend"]['l']
    Variables.lenextendhourlow = Variables.extendhourlow.length
  }
  
async function Two_Hour_Extend_Low(){
    let aggs = []
    let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Two_Hour Extend"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Two_Hour Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.extendtwohourlow = values["Two_Hour Extend"]['l']
    Variables.lenextendtwohourlow = Variables.extendtwohourlow.length
  }
  
async function Four_Hour_Extend_Low(){
    let aggs = []
    let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Four_Hour Extend"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Four_Hour Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.extendfourhourlow = values["Four_Hour Extend"]['l']
    Variables.lenextendfourhourlow = Variables.extendfourhourlow.length
  }
  
async function Daily_Extend_Low(){
    let aggs = []
    let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Daily Extend"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Daily Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.extenddailylow = values["Daily Extend"]['l']
    Variables.lenextenddailylow = Variables.extenddailylow.length
    }
  
async function Weekly_Extend_Low(){
    let aggs = []
    let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(baseURL+url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Weekly Extend"]['l'].push(parseFloat(data['results'][item]['l']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(baseURL+url);
          var data = await res.json();
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["Weekly Extend"]['l'].push(parseFloat(data['results'][item]['l']))
                  }
                }}}
    Variables.extendweeklylow = values["Weekly Extend"]['l']
    Variables.lenextendweeklylow = Variables.extendweeklylow.length
    }

    async function Five_Min_High(){
      let aggs = []
      let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Five_Min"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Five_Min"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.fivehigh = values["Five_Min"]['h']
      Variables.lenfivehigh = Variables.fivehigh.length
      }
    
  async function Fifteen_Min_High(){
      let aggs = []
      let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Fifteen_Min"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Fifteen_Min"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}} 
      Variables.fifteenhigh = values["Fifteen_Min"]['h']
      Variables.lenfifteenhigh = Variables.fifteenhigh.length
    }
    
  async function Thirty_Min_High(){
      let aggs = []
      let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Thirty_Min"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Thirty_Min"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.thirtyhigh = values["Thirty_Min"]['h']
      Variables.lenthirtyhigh = Variables.thirtyhigh.length
    }
    
  async function One_Hour_High(){
      let aggs = []
      let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["One_Hour"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["One_Hour"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.hourhigh = values["One_Hour"]['h']
      Variables.lenhourhigh = Variables.hourhigh.length
      }
    
  async function Two_Hour_High(){
      let aggs = []
      let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Two_Hour"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Two_Hour"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.twohourhigh = values["Two_Hour"]['h']
      Variables.lentwohourhigh = Variables.twohourhigh.length
    }
    
  async function Four_Hour_High(){
      let aggs = []
      let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Four_Hour"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Four_Hour"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.fourhourhigh = values["Four_Hour"]['h']
      Variables.lenfourhourhigh = Variables.fourhourhigh.length
    }
    
  async function Daily_High(){
      let aggs = []
      let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Daily"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Daily"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.dailyhigh = values["Daily"]['h']
      Variables.lendailyhigh = Variables.dailyhigh.length
    }
    
  async function Weekly_High(){
      let aggs = []
      let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Weekly"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Weekly"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.weeklyhigh = values["Weekly"]['h']
      Variables.lenweeklyhigh = Variables.weeklyhigh.length
    }
  async function Five_Min_Extend_High(){
      let aggs = []
      let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Five_Min Extend"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Five_Min Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.extendfivehigh = values["Five_Min Extend"]['h']
      Variables.lenextendfivehigh = Variables.extendfivehigh.length
        }
    
  async function Fifteen_Min_Extend_High(){
      let aggs = []
      let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Fifteen_Min Extend"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Fifteen_Min Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.extendfifteenhigh = values["Fifteen_Min Extend"]['h']
      Variables.lenextendfifteenhigh = Variables.extendfifteenhigh.length
    }
    
  async function Thirty_Min_Extend_High(){
      let aggs = []
      let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Thirty_Min Extend"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Thirty_Min Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.extendthirtyhigh = values["Thirty_Min Extend"]['h']
      Variables.lenextendthirtyhigh = Variables.extendthirtyhigh.length
    }
    
  async function One_Hour_Extend_High(){
      let aggs = []
      let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["One_Hour Extend"]['h'].push(parseFloat(data['results'][item]['h']))
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["One_Hour Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                      }
                    }}}
      Variables.extendhourhigh = values["One_Hour Extend"]['h']
      Variables.lenextendhourhigh = Variables.extendhourhigh.length
    }
    
  async function Two_Hour_Extend_High(){
      let aggs = []
      let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Two_Hour Extend"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Two_Hour Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.extendtwohourhigh = values["Two_Hour Extend"]['h']
      Variables.lenextendtwohourhigh = Variables.extendtwohourhigh.length
    }
    
  async function Four_Hour_Extend_High(){
      let aggs = []
      let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Four_Hour Extend"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Four_Hour Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.extendfourhourhigh = values["Four_Hour Extend"]['h']
      Variables.lenextendfourhourhigh = Variables.extendfourhourhigh.length
    }
    
  async function Daily_Extend_High(){
      let aggs = []
      let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Daily Extend"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Daily Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.extenddailyhigh = values["Daily Extend"]['h']
      Variables.lenextenddailyhigh = Variables.extenddailyhigh.length
      }
    
    async function Weekly_Extend_High(){
      let aggs = []
      let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(baseURL+url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Weekly Extend"]['h'].push(parseFloat(data['results'][item]['h']))
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(baseURL+url);
            var data = await res.json();
            if ('results' in data){
                for(let item = 0; item < data['results'].length; item++){
                    values["Weekly Extend"]['h'].push(parseFloat(data['results'][item]['h']))
                    }
                  }}}
      Variables.extendweeklyhigh = values["Weekly Extend"]['h']
      Variables.lenextendweeklyhigh = Variables.extendweeklyhigh.length
      }
    async function Five_Min_Open(){
        let aggs = []
        let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["Five_Min"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["Five_Min"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.fiveopen = values["Five_Min"]['o']
        Variables.lenfiveopen = Variables.fiveopen.length
        }
      
    async function Fifteen_Min_Open(){
        let aggs = []
        let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["Fifteen_Min"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["Fifteen_Min"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}} 
        Variables.fifteenopen = values["Fifteen_Min"]['o']
        Variables.lenfifteenopen = Variables.fifteenopen.length
      }
      
    async function Thirty_Min_Open(){
        let aggs = []
        let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["Thirty_Min"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["Thirty_Min"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.thirtyopen = values["Thirty_Min"]['o']
        Variables.lenthirtyopen = Variables.thirtyopen.length
      }
      
    async function One_Hour_Open(){
        let aggs = []
        let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["One_Hour"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["One_Hour"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.houropen = values["One_Hour"]['o']
        Variables.lenhouropen = Variables.houropen.length
        }
      
    async function Two_Hour_Open(){
        let aggs = []
        let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Two_Hour"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Two_Hour"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.twohouropen = values["Two_Hour"]['o']
        Variables.lentwohouropen = Variables.twohouropen.length
      }
      
    async function Four_Hour_Open(){
        let aggs = []
        let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Four_Hour"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Four_Hour"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.fourhouropen = values["Four_Hour"]['o']
        Variables.lenfourhouropen = Variables.fourhouropen.length
      }
      
    async function Daily_Open(){
        let aggs = []
        let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Daily"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Daily"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.dailyopen = values["Daily"]['o']
        Variables.lendailyopen = Variables.dailyopen.length
      }
      
    async function Weekly_Open(){
        let aggs = []
        let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Weekly"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Weekly"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.weeklyopen = values["Weekly"]['o']
        Variables.lenweeklyopen = Variables.weeklyopen.length
      }
    async function Five_Min_Extend_Open(){
        let aggs = []
        let url = "5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["Five_Min Extend"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["Five_Min Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.extendfiveopen = values["Five_Min Extend"]['o']
        Variables.lenextendfiveopen = Variables.extendfiveopen.length
          }
      
    async function Fifteen_Min_Extend_Open(){
        let aggs = []
        let url = "15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["Fifteen_Min Extend"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["Fifteen_Min Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.extendfifteenopen = values["Fifteen_Min Extend"]['o']
        Variables.lenextendfifteenopen = Variables.extendfifteenopen.length
      }
      
    async function Thirty_Min_Extend_Open(){
        let aggs = []
        let url = "30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["Thirty_Min Extend"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["Thirty_Min Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.extendthirtyopen = values["Thirty_Min Extend"]['o']
        Variables.lenextendthirtyopen = Variables.extendthirtyopen.length
      }
      
    async function One_Hour_Extend_Open(){
        let aggs = []
        let url = "1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
            for(let item = 0; item < data['results'].length; item++){
              values["One_Hour Extend"]['o'].push(parseFloat(data['results'][item]['o']))
            }
        while('next_url' in data){
              if('next_url' in data){
                let id = data['next_url'].split('/')[10]
                url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
                var res = await fetch(baseURL+url);
                var data = await res.json();
                if ('results' in data){
                    for(let item = 0; item < data['results'].length; item++){
                        values["One_Hour Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                        }
                      }}}
        Variables.extendhouropen = values["One_Hour Extend"]['o']
        Variables.lenextendhouropen = Variables.extendhouropen.length
      }
      
    async function Two_Hour_Extend_Open(){
        let aggs = []
        let url = "2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Two_Hour Extend"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Two_Hour Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.extendtwohouropen = values["Two_Hour Extend"]['o']
        Variables.lenextendtwohouropen = Variables.extendtwohouropen.length
      }
      
    async function Four_Hour_Extend_Open(){
        let aggs = []
        let url = "4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Four_Hour Extend"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Four_Hour Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.extendfourhouropen = values["Four_Hour Extend"]['o']
        Variables.lenextendfourhouropen = Variables.extendfourhouropen.length
      }
      
    async function Daily_Extend_Open(){
        let aggs = []
        let url = "1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Daily Extend"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Daily Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.extenddailyopen = values["Daily Extend"]['o']
        Variables.lenextenddailyopen = Variables.extenddailyopen.length
        }
      
    async function Weekly_Extend_Open(){
        let aggs = []
        let url = "1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(baseURL+url);
        var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Weekly Extend"]['o'].push(parseFloat(data['results'][item]['o']))
          }
        while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(baseURL+url);
              var data = await res.json();
              if ('results' in data){
                  for(let item = 0; item < data['results'].length; item++){
                      values["Weekly Extend"]['o'].push(parseFloat(data['results'][item]['o']))
                      }
                    }}}
        Variables.extendweeklyopen = values["Weekly Extend"]['o']
        Variables.lenextendweeklyopen = Variables.extendweeklyopen.length
        }
    async function Price(inst){
      const pricelist = await yfin.quoteSummary(inst)
      const prices = pricelist.price.regularMarketPrice
      Variables.price = parseFloat(prices)
      }


function equalizer(){
  let listoflens = []
  listoflens.push(Variables.lenfivehigh)
  listoflens.push(Variables.lenfifteenhigh)
  listoflens.push(Variables.lenthirtyhigh)
  listoflens.push(Variables.lenhourhigh)
  listoflens.push(Variables.lentwohourhigh)
  listoflens.push(Variables.lenfourhourhigh)
  listoflens.push(Variables.lendailyhigh)
  listoflens.push(Variables.lenweeklyhigh)
  let listofitems = []
  listofitems.push(Variables.fivehigh)
  listofitems.push(Variables.fifteenhigh)
  listofitems.push(Variables.thirtyhigh)
  listofitems.push(Variables.hourhigh)
  listofitems.push(Variables.twohourhigh)
  listofitems.push(Variables.fourhourhigh)
  listofitems.push(Variables.dailyhigh)
  listofitems.push(Variables.weeklyhigh)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
          for(let x = 0; x < item.length-minlen; x++){
            item.splice(0, 1)
          }}}
  values["Five_Min"]['h'] = listofitems[0]
  values["Fifteen_Min"]['h'] = listofitems[1]
  values["Thirty_Min"]['h'] = listofitems[2]
  values["One_Hour"]['h'] = listofitems[3]
  values["Two_Hour"]['h'] = listofitems[4]
  values["Four_Hour"]['h'] = listofitems[5]
  values["Daily"]['h'] = listofitems[6]
  values["Weekly"]['h'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.extendlenfivehigh)
  listoflens.push(Variables.extendlenfifteenhigh)
  listoflens.push(Variables.extendlenthirtyhigh)
  listoflens.push(Variables.extendlenhourhigh)
  listoflens.push(Variables.extendlentwohourhigh)
  listoflens.push(Variables.extendlenfourhourhigh)
  listoflens.push(Variables.extendlendailyhigh)
  listoflens.push(Variables.extendlenweeklyhigh)
  listofitems = []
  listofitems.push(Variables.extendfivehigh)
  listofitems.push(Variables.extendfifteenhigh)
  listofitems.push(Variables.extendthirtyhigh)
  listofitems.push(Variables.extendhourhigh)
  listofitems.push(Variables.extendtwohourhigh)
  listofitems.push(Variables.extendfourhourhigh)
  listofitems.push(Variables.extenddailyhigh)
  listofitems.push(Variables.extendweeklyhigh)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min Extend"]['h'] = listofitems[0]
  values["Fifteen_Min Extend"]['h'] = listofitems[1]
  values["Thirty_Min Extend"]['h'] = listofitems[2]
  values["One_Hour Extend"]['h'] = listofitems[3]
  values["Two_Hour Extend"]['h'] = listofitems[4]
  values["Four_Hour Extend"]['h'] = listofitems[5]
  values["Daily Extend"]['h'] = listofitems[6]
  values["Weekly Extend"]['h'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.lenfivelow)
  listoflens.push(Variables.lenfifteenlow)
  listoflens.push(Variables.lenthirtylow)
  listoflens.push(Variables.lenhourlow)
  listoflens.push(Variables.lentwohourlow)
  listoflens.push(Variables.lenfourhourlow)
  listoflens.push(Variables.lendailylow)
  listoflens.push(Variables.lenweeklylow)
  listofitems = []
  listofitems.push(Variables.fivelow)
  listofitems.push(Variables.fifteenlow)
  listofitems.push(Variables.thirtylow)
  listofitems.push(Variables.hourlow)
  listofitems.push(Variables.twohourlow)
  listofitems.push(Variables.fourhourlow)
  listofitems.push(Variables.dailylow)
  listofitems.push(Variables.weeklylow)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min"]['l'] = listofitems[0]
  values["Fifteen_Min"]['l'] = listofitems[1]
  values["Thirty_Min"]['l'] = listofitems[2]
  values["One_Hour"]['l'] = listofitems[3]
  values["Two_Hour"]['l'] = listofitems[4]
  values["Four_Hour"]['l'] = listofitems[5]
  values["Daily"]['l'] = listofitems[6]
  values["Weekly"]['l'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.extendlenfivelow)
  listoflens.push(Variables.extendlenfifteenlow)
  listoflens.push(Variables.extendlenthirtylow)
  listoflens.push(Variables.extendlenhourlow)
  listoflens.push(Variables.extendlentwohourlow)
  listoflens.push(Variables.extendlenfourhourlow)
  listoflens.push(Variables.extendlendailylow)
  listoflens.push(Variables.extendlenweeklylow)
  listofitems = []
  listofitems.push(Variables.extendfivelow)
  listofitems.push(Variables.extendfifteenlow)
  listofitems.push(Variables.extendthirtylow)
  listofitems.push(Variables.extendhourlow)
  listofitems.push(Variables.extendtwohourlow)
  listofitems.push(Variables.extendfourhourlow)
  listofitems.push(Variables.extenddailylow)
  listofitems.push(Variables.extendweeklylow)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min Extend"]['l'] = listofitems[0]
  values["Fifteen_Min Extend"]['l'] = listofitems[1]
  values["Thirty_Min Extend"]['l'] = listofitems[2]
  values["One_Hour Extend"]['l'] = listofitems[3]
  values["Two_Hour Extend"]['l'] = listofitems[4]
  values["Four_Hour Extend"]['l'] = listofitems[5]
  values["Daily Extend"]['l'] = listofitems[6]
  values["Weekly Extend"]['l'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.lenfiveopen)
  listoflens.push(Variables.lenfifteenopen)
  listoflens.push(Variables.lenthirtyopen)
  listoflens.push(Variables.lenhouropen)
  listoflens.push(Variables.lentwohouropen)
  listoflens.push(Variables.lenfourhouropen)
  listoflens.push(Variables.lendailyopen)
  listoflens.push(Variables.lenweeklyopen)
  listofitems = []
  listofitems.push(Variables.fiveopen)
  listofitems.push(Variables.fifteenopen)
  listofitems.push(Variables.thirtyopen)
  listofitems.push(Variables.houropen)
  listofitems.push(Variables.twohouropen)
  listofitems.push(Variables.fourhouropen)
  listofitems.push(Variables.dailyopen)
  listofitems.push(Variables.weeklyopen)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min"]['o'] = listofitems[0]
  values["Fifteen_Min"]['o'] = listofitems[1]
  values["Thirty_Min"]['o'] = listofitems[2]
  values["One_Hour"]['o'] = listofitems[3]
  values["Two_Hour"]['o'] = listofitems[4]
  values["Four_Hour"]['o'] = listofitems[5]
  values["Daily"]['o'] = listofitems[6]
  values["Weekly"]['o'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.extendlenfiveopen)
  listoflens.push(Variables.extendlenfifteenopen)
  listoflens.push(Variables.extendlenthirtyopen)
  listoflens.push(Variables.extendlenhouropen)
  listoflens.push(Variables.extendlentwohouropen)
  listoflens.push(Variables.extendlenfourhouropen)
  listoflens.push(Variables.extendlendailyopen)
  listoflens.push(Variables.extendlenweeklyopen)
  listofitems = []
  listofitems.push(Variables.extendfiveopen)
  listofitems.push(Variables.extendfifteenopen)
  listofitems.push(Variables.extendthirtyopen)
  listofitems.push(Variables.extendhouropen)
  listofitems.push(Variables.extendtwohouropen)
  listofitems.push(Variables.extendfourhouropen)
  listofitems.push(Variables.extenddailyopen)
  listofitems.push(Variables.extendweeklyopen)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min Extend"]['o'] = listofitems[0]
  values["Fifteen_Min Extend"]['o'] = listofitems[1]
  values["Thirty_Min Extend"]['o'] = listofitems[2]
  values["One_Hour Extend"]['o'] = listofitems[3]
  values["Two_Hour Extend"]['o'] = listofitems[4]
  values["Four_Hour Extend"]['o'] = listofitems[5]
  values["Daily Extend"]['o'] = listofitems[6]
  values["Weekly Extend"]['o'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.lenfive)
  listoflens.push(Variables.lenfifteen)
  listoflens.push(Variables.lenthirty)
  listoflens.push(Variables.lenonehour)
  listoflens.push(Variables.lentwohour)
  listoflens.push(Variables.lenfourhour)
  listoflens.push(Variables.lendaily)
  listoflens.push(Variables.lenweekly)
  listofitems = []
  listofitems.push(Variables.five)
  listofitems.push(Variables.fifteen)
  listofitems.push(Variables.thirty)
  listofitems.push(Variables.onehour)
  listofitems.push(Variables.twohour)
  listofitems.push(Variables.fourhour)
  listofitems.push(Variables.daily)
  listofitems.push(Variables.weekly)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min"]['c'] = listofitems[0]
  values["Fifteen_Min"]['c'] = listofitems[1]
  values["Thirty_Min"]['c'] = listofitems[2]
  values["One_Hour"]['c'] = listofitems[3]
  values["Two_Hour"]['c'] = listofitems[4]
  values["Four_Hour"]['c'] = listofitems[5]
  values["Daily"]['c'] = listofitems[6]
  values["Weekly"]['c'] = listofitems[7]
  listoflens = []
  listoflens.push(Variables.extendlenfive)
  listoflens.push(Variables.extendlenfifteen)
  listoflens.push(Variables.extendlenthirty)
  listoflens.push(Variables.extendlenhour)
  listoflens.push(Variables.extendlentwohour)
  listoflens.push(Variables.extendlenfourhour)
  listoflens.push(Variables.extendlendaily)
  listoflens.push(Variables.extendlenweekly)
  listofitems = []
  listofitems.push(Variables.extendfive)
  listofitems.push(Variables.extendfifteen)
  listofitems.push(Variables.extendthirty)
  listofitems.push(Variables.extendhour)
  listofitems.push(Variables.extendtwohour)
  listofitems.push(Variables.extendfourhour)
  listofitems.push(Variables.extenddaily)
  listofitems.push(Variables.extendweekly)
  minlen = Math.min(...listoflens)
  for(const item in listofitems){
      if(item.length > minlen){
        for(let x = 0; x < item.length-minlen; x++){
          item.splice(0, 1)
          }}}
  values["Five_Min Extend"]['c'] = listofitems[0]
  values["Fifteen_Min Extend"]['c'] = listofitems[1]
  values["Thirty_Min Extend"]['c'] = listofitems[2]
  values["One_Hour Extend"]['c'] = listofitems[3]
  values["Two_Hour Extend"]['c'] = listofitems[4]
  values["Four_Hour Extend"]['c'] = listofitems[5]
  values["Daily Extend"]['c'] = listofitems[6]
  values["Weekly Extend"]['c'] = listofitems[7]

}




async function caller(instrum, proxy, accinfo){
  instrument = instrum
  proxyinfo = proxy
  accountID = String(accinfo[0])
  token = String(accinfo[1])
  baseURL = "https://api.polygon.io/v2/aggs/ticker/"+instrum+"/range/"
  let g = 0
  while(g == 0){
    Assigner()
    Price(instrum)
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
    Two_Hour_Extend_Low()
    Four_Hour_Extend_Low()
    Daily_Extend_Low()
    Weekly_Extend_Low()
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
    await Four_Hour_Extend_Open()
    await Daily_Extend_Open()
    await Weekly_Extend_Open()
    equalizer()
    testdaily.testdaily(values, Variables.price)
    testfifteen.testfifteenmin(values, Variables.price)
    testfourhour.testfourhour(values, Variables.price)
    testtwohour.testtwohour(values, Variables.price)
    testonehour.testonehour(values, Variables.price)
    testthirtymin.testthirtymin(values, Variables.price)
    testweekly.testweekly(values, Variables.price)
  
  }
}


module.exports = { assigning: function(instrum, proxy, accinfo){caller(instrum, proxy, accinfo)} }
/* © 2024 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
 have been included with this distribution. */