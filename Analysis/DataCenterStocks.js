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


values = {}

class Variables{

  five = []
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
  values[timeperiods[item]]['c'] = []
  values[timeperiods[item]]['o'] = []
  values[timeperiods[item]]['h'] = []
  values[timeperiods[item]]['l'] = []

}
}

async function Five_Min(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Five_Min"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Five_Min"]['c'].push(item['c'])
                  }
                }}}
  Variables.five = aggs
  Variables.lenfive = Variables.five.length
  }

async function Fifteen_Min(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Fifteen_Min"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Fifteen_Min"]['c'].push(item['c'])
                  }
                }}}
  Variables.fifteen = aggs
  Variables.lenfifteen = Variables.fifteen.length
}

async function Thirty_Min(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Thirty_Min"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Thirty_Min"]['c'].push(item['c'])
                  }
                }}}
  Variables.thirty = aggs
  Variables.lenthirty = Variables.thirty.length
}

async function One_Hour(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["One_Hour"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["One_Hour"]['c'].push(item['c'])
                  }
                }}}
  Variables.hour = aggs
  Variables.lenhour = Variables.hour.length
  }

async function Two_Hour(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Two_Hour"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Two_Hour"]['c'].push(item['c'])
                }
              }}}
  Variables.twohour = aggs
  Variables.lentwohour = Variables.twohour.length
}

async function Four_Hour(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Four_Hour"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Four_Hour"]['c'].push(item['c'])
                }
              }}}
  Variables.fourhour = aggs
  Variables.lenfourhour = Variables.fourhour.length
}

async function Daily(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Daily"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Daily"]['c'].push(item['c'])
                }
              }}}
  Variables.daily = aggs
  Variables.lendaily = Variables.daily.length
}

async function Weekly(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Weekly"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Weekly"]['c'].push(item['c'])
                }
              }}}
  Variables.weekly = aggs
  Variables.lenweekly = Variables.weekly.length
}
async function Five_Min_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Five_Min Extend"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Five_Min Extend"]['c'].push(item['c'])
                  }
                }}}
  Variables.extendfive = aggs
  Variables.lenextendfive = Variables.extendfive.length
    }

async function Fifteen_Min_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Fifteen_Min Extend"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Fifteen_Min Extend"]['c'].push(item['c'])
                  }
                }}}
  Variables.extendfifteen = aggs
  Variables.lenextendfifteen = Variables.extendfifteen.length
}

async function Thirty_Min_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Thirty_Min Extend"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Thirty_Min Extend"]['c'].push(item['c'])
                  }
                }}}
  Variables.extendthirty = aggs
  Variables.lenextendthirty = Variables.extendthirty.length
}

async function One_Hour_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["One_Hour Extend"]['c'].push(data['results'][item]['c'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["One_Hour Extend"]['c'].push(item['c'])
                  }
                }}}
  Variables.extendhour = aggs
  Variables.lenextendhour = Variables.extendhour.length
}

async function Two_Hour_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Two_Hour Extend"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Two_Hour Extend"]['c'].push(item['c'])
                }
              }}}
  Variables.extendtwohour = aggs
  Variables.lenextendtwohour = Variables.extendtwohour.length
}

async function Four_Hour_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Four_Hour_Extend"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Four_Hour_Extend"]['c'].push(item['c'])
                }
              }}}
  Variables.extendfourhour = aggs
  Variables.lenextendfourhour = Variables.extendfourhour.length
}

async function Daily_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Daily Extend"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Daily Extend"]['c'].push(item['c'])
                }
              }}}
  Variables.extenddaily = aggs
  Variables.lenextenddaily = Variables.extenddaily.length
  }

async function Weekly_Extend(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
    for(let item = 0; item < data['results'].length; item++){
      values["Weekly Extend"]['c'].push(data['results'][item]['c'])
    }
  while('next_url' in data){
      if('next_url' in data){
        let id = data['next_url'].split('/')[10]
        url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
        var res = await fetch(url);
        var data = await res.json();
        if ('results' in data){
            for(const item in data['results']){
                values["Weekly Extend"]['c'].push(item['c'])
                }
              }}}
  Variables.extendweekly = aggs
  Variables.lenextendweekly = Variables.extendweekly.length
  }
async function Five_Min_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Five_Min"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Five_Min"]['l'].push(item['l'])
                    }
                  }}}
    Variables.fivelow = aggs
    Variables.lenfivelow = Variables.fivelow.length
    }
  
async function Fifteen_Min_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Fifteen_Min"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Fifteen_Min"]['l'].push(item['l'])
                    }
                  }}} 
    Variables.fifteenlow = aggs
    Variables.lenfifteenlow = Variables.fifteenlow.length
  }
  
async function Thirty_Min_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Thirty_Min"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Thirty_Min"]['l'].push(item['l'])
                    }
                  }}}
    Variables.thirtylow = aggs
    Variables.lenthirtylow = Variables.thirtylow.length
  }
  
async function One_Hour_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["One_Hour"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["One_Hour"]['l'].push(item['l'])
                    }
                  }}}
    Variables.hourlow = aggs
    Variables.lenhourlow = Variables.hourlow.length
    }
  
async function Two_Hour_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Two_Hour"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Two_Hour"]['l'].push(item['l'])
                  }
                }}}
    Variables.twohourlow = aggs
    Variables.lentwohourlow = Variables.twohourlow.length
  }
  
async function Four_Hour_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Four_Hour"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Four_Hour"]['l'].push(item['l'])
                  }
                }}}
    Variables.fourhourlow = aggs
    Variables.lenfourhourlow = Variables.fourhourlow.length
  }
  
async function Daily_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Daily"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Daily"]['l'].push(item['l'])
                  }
                }}}
    Variables.dailylow = aggs
    Variables.lendailylow = Variables.dailylow.length
  }
  
async function Weekly_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Weekly"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Weekly"]['l'].push(item['l'])
                  }
                }}}
    Variables.weeklylow = aggs
    Variables.lenweeklylow = Variables.weeklylow.length
  }
async function Five_Min_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Five_Min Extend"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Five_Min Extend"]['l'].push(item['l'])
                    }
                  }}}
    Variables.extendfivelow = aggs
    Variables.lenextendfivelow = Variables.extendfivelow.length
      }
  
async function Fifteen_Min_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Fifteen_Min Extend"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Fifteen_Min Extend"]['l'].push(item['l'])
                    }
                  }}}
    Variables.extendfifteenlow = aggs
    Variables.lenextendfifteenlow = Variables.extendfifteenlow.length
  }
  
async function Thirty_Min_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Thirty_Min Extend"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Thirty_Min Extend"]['l'].push(item['l'])
                    }
                  }}}
    Variables.extendthirtylow = aggs
    Variables.lenextendthirtylow = Variables.extendthirtylow.length
  }
  
async function One_Hour_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["One_Hour Extend"]['l'].push(data['results'][item]['l'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["One_Hour Extend"]['l'].push(item['l'])
                    }
                  }}}
    Variables.extendhourlow = aggs
    Variables.lenextendhourlow = Variables.extendhourlow.length
  }
  
async function Two_Hour_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Two_Hour Extend"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Two_Hour Extend"]['l'].push(item['l'])
                  }
                }}}
    Variables.extendtwohourlow = aggs
    Variables.lenextendtwohourlow = Variables.extendtwohourlow.length
  }
  
async function Four_Hour_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Four_Hour_Extend"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Four_Hour_Extend"]['l'].push(item['l'])
                  }
                }}}
    Variables.extendfourhourlow = aggs
    Variables.lenextendfourhourlow = Variables.extendfourhourlow.length
  }
  
async function Daily_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Daily Extend"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Daily Extend"]['l'].push(item['l'])
                  }
                }}}
    Variables.extenddailylow = aggs
    Variables.lenextenddailylow = Variables.extenddailylow.length
    }
  
async function Weekly_Extend_Low(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Weekly Extend"]['l'].push(data['results'][item]['l'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Weekly Extend"]['l'].push(item['l'])
                  }
                }}}
    Variables.extendweeklylow = aggs
    Variables.lenextendweeklylow = Variables.extendweeklylow.length
    }

    async function Five_Min_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Five_Min"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["Five_Min"]['h'].push(item['h'])
                      }
                    }}}
      Variables.fivehigh = aggs
      Variables.lenfivehigh = Variables.fivehigh.length
      }
    
  async function Fifteen_Min_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Fifteen_Min"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["Fifteen_Min"]['h'].push(item['h'])
                      }
                    }}} 
      Variables.fifteenhigh = aggs
      Variables.lenfifteenhigh = Variables.fifteenhigh.length
    }
    
  async function Thirty_Min_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Thirty_Min"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["Thirty_Min"]['h'].push(item['h'])
                      }
                    }}}
      Variables.thirtyhigh = aggs
      Variables.lenthirtyhigh = Variables.thirtyhigh.length
    }
    
  async function One_Hour_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["One_Hour"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["One_Hour"]['h'].push(item['h'])
                      }
                    }}}
      Variables.hourhigh = aggs
      Variables.lenhourhigh = Variables.hourhigh.length
      }
    
  async function Two_Hour_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Two_Hour"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Two_Hour"]['h'].push(item['h'])
                    }
                  }}}
      Variables.twohourhigh = aggs
      Variables.lentwohourhigh = Variables.twohourhigh.length
    }
    
  async function Four_Hour_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Four_Hour"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Four_Hour"]['h'].push(item['h'])
                    }
                  }}}
      Variables.fourhourhigh = aggs
      Variables.lenfourhourhigh = Variables.fourhourhigh.length
    }
    
  async function Daily_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Daily"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Daily"]['h'].push(item['h'])
                    }
                  }}}
      Variables.dailyhigh = aggs
      Variables.lendailyhigh = Variables.dailyhigh.length
    }
    
  async function Weekly_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Weekly"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Weekly"]['h'].push(item['h'])
                    }
                  }}}
      Variables.weeklyhigh = aggs
      Variables.lenweeklyhigh = Variables.weeklyhigh.length
    }
  async function Five_Min_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Five_Min Extend"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["Five_Min Extend"]['h'].push(item['h'])
                      }
                    }}}
      Variables.extendfivehigh = aggs
      Variables.lenextendfivehigh = Variables.extendfivehigh.length
        }
    
  async function Fifteen_Min_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Fifteen_Min Extend"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["Fifteen_Min Extend"]['h'].push(item['h'])
                      }
                    }}}
      Variables.extendfifteenhigh = aggs
      Variables.lenextendfifteenhigh = Variables.extendfifteenhigh.length
    }
    
  async function Thirty_Min_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["Thirty_Min Extend"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["Thirty_Min Extend"]['h'].push(item['h'])
                      }
                    }}}
      Variables.extendthirtyhigh = aggs
      Variables.lenextendthirtyhigh = Variables.extendthirtyhigh.length
    }
    
  async function One_Hour_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
          for(let item = 0; item < data['results'].length; item++){
            values["One_Hour Extend"]['h'].push(data['results'][item]['h'])
          }
      while('next_url' in data){
            if('next_url' in data){
              let id = data['next_url'].split('/')[10]
              url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
              var res = await fetch(url);
              var data = await res.json();
              if ('results' in data){
                  for(const item in data['results']){
                      values["One_Hour Extend"]['h'].push(item['h'])
                      }
                    }}}
      Variables.extendhourhigh = aggs
      Variables.lenextendhourhigh = Variables.extendhourhigh.length
    }
    
  async function Two_Hour_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Two_Hour Extend"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Two_Hour Extend"]['h'].push(item['h'])
                    }
                  }}}
      Variables.extendtwohourhigh = aggs
      Variables.lenextendtwohourhigh = Variables.extendtwohourhigh.length
    }
    
  async function Four_Hour_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Four_Hour_Extend"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Four_Hour_Extend"]['h'].push(item['h'])
                    }
                  }}}
      Variables.extendfourhourhigh = aggs
      Variables.lenextendfourhourhigh = Variables.extendfourhourhigh.length
    }
    
  async function Daily_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Daily Extend"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Daily Extend"]['h'].push(item['h'])
                    }
                  }}}
      Variables.extenddailyhigh = aggs
      Variables.lenextenddailyhigh = Variables.extenddailyhigh.length
      }
    
  async function Weekly_Extend_High(instrument){
      let aggs = []
      let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
      var res = await fetch(url);
      var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Weekly Extend"]['h'].push(data['results'][item]['h'])
        }
      while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Weekly Extend"]['h'].push(item['h'])
                    }
                  }}}
      Variables.extendweeklyhigh = aggs
      Variables.lenextendweeklyhigh = Variables.extendweeklyhigh.length
      }
async function Five_Min_Open(instrument){
  let aggs = []
  let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
  var res = await fetch(url);
  var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Five_Min"]['o'].push(data['results'][item]['o'])
      }
  while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Five_Min"]['o'].push(item['o'])
                  }
                }}}
  Variables.fiveopen = aggs
  Variables.lenfiveopen = Variables.fiveopen.length
  }
  
async function Fifteen_Min_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Fifteen_Min"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Fifteen_Min"]['o'].push(item['o'])
                    }
                  }}} 
    Variables.fifteenopen = aggs
    Variables.lenfifteenopen = Variables.fifteenopen.length
  }
  
async function Thirty_Min_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Thirty_Min"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Thirty_Min"]['o'].push(item['o'])
                    }
                  }}}
    Variables.thirtyopen = aggs
    Variables.lenthirtyopen = Variables.thirtyopen.length
  }
  
async function One_Hour_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["One_Hour"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["One_Hour"]['o'].push(item['o'])
                    }
                  }}}
    Variables.houropen = aggs
    Variables.lenhouropen = Variables.houropen.length
    }
  
async function Two_Hour_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Two_Hour"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Two_Hour"]['o'].push(item['o'])
                  }
                }}}
    Variables.twohouropen = aggs
    Variables.lentwohouropen = Variables.twohouropen.length
  }
  
async function Four_Hour_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Four_Hour"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Four_Hour"]['o'].push(item['o'])
                  }
                }}}
    Variables.fourhouropen = aggs
    Variables.lenfourhouropen = Variables.fourhouropen.length
  }
  
async function Daily_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Daily"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Daily"]['o'].push(item['o'])
                  }
                }}}
    Variables.dailyopen = aggs
    Variables.lendailyopen = Variables.dailyopen.length
  }
  
async function Weekly_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Weekly"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Weekly"]['o'].push(item['o'])
                  }
                }}}
    Variables.weeklyopen = aggs
    Variables.lenweeklyopen = Variables.weeklyopen.length
  }
async function Five_Min_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(refdayfive)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Five_Min Extend"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/5/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Five_Min Extend"]['o'].push(item['o'])
                    }
                  }}}
    Variables.extendfiveopen = aggs
    Variables.lenextendfiveopen = Variables.extendfiveopen.length
      }
  
async function Fifteen_Min_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(refdayfifteen)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Fifteen_Min Extend"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/15/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Fifteen_Min Extend"]['o'].push(item['o'])
                    }
                  }}}
    Variables.extendfifteenopen = aggs
    Variables.lenextendfifteenopen = Variables.extendfifteenopen.length
  }
  
async function Thirty_Min_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(refdaythirty)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["Thirty_Min Extend"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/30/minute/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["Thirty_Min Extend"]['o'].push(item['o'])
                    }
                  }}}
    Variables.extendthirtyopen = aggs
    Variables.lenextendthirtyopen = Variables.extendthirtyopen.length
  }
  
async function One_Hour_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(refdayhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
        for(let item = 0; item < data['results'].length; item++){
          values["One_Hour Extend"]['o'].push(data['results'][item]['o'])
        }
    while('next_url' in data){
          if('next_url' in data){
            let id = data['next_url'].split('/')[10]
            url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
            var res = await fetch(url);
            var data = await res.json();
            if ('results' in data){
                for(const item in data['results']){
                    values["One_Hour Extend"]['o'].push(item['o'])
                    }
                  }}}
    Variables.extendhouropen = aggs
    Variables.lenextendhouropen = Variables.extendhouropen.length
  }
  
async function Two_Hour_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(refdaytwohour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Two_Hour Extend"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/2/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Two_Hour Extend"]['o'].push(item['o'])
                  }
                }}}
    Variables.extendtwohouropen = aggs
    Variables.lenextendtwohouropen = Variables.extendtwohouropen.length
  }
  
async function Four_Hour_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(refdayfourhour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Four_Hour_Extend"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/4/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Four_Hour_Extend"]['o'].push(item['o'])
                  }
                }}}
    Variables.extendfourhouropen = aggs
    Variables.lenextendfourhouropen = Variables.extendfourhouropen.length
  }
  
async function Daily_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(refdaydaily)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Daily Extend"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/day/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Daily Extend"]['o'].push(item['o'])
                  }
                }}}
    Variables.extenddailyopen = aggs
    Variables.lenextenddailyopen = Variables.extenddailyopen.length
    }
  
async function Weekly_Extend_Open(instrument){
    let aggs = []
    let url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(refdayweekly)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await fetch(url);
    var data = await res.json();
      for(let item = 0; item < data['results'].length; item++){
        values["Weekly Extend"]['o'].push(data['results'][item]['o'])
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "https://api.polygon.io/v2/aggs/ticker/"+instrument+"/range/1/week/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await fetch(url);
          var data = await res.json();
          if ('results' in data){
              for(const item in data['results']){
                  values["Weekly Extend"]['o'].push(item['o'])
                  }
                }}}
    Variables.extendweeklyopen = aggs
    Variables.lenextendweeklyopen = Variables.extendweeklyopen.length
    }



function equalizer(){
  let listoflens = []
  listoflens.append(Variables.lenfivehigh)
  listoflens.append(Variables.lenfifteenhigh)
  listoflens.append(Variables.lenthirtyhigh)
  listoflens.append(Variables.lenhourhigh)
  listoflens.append(Variables.lentwohourhigh)
  listoflens.append(Variables.lenfourhourhigh)
  listoflens.append(Variables.lendailyhigh)
  listoflens.append(Variables.lenweeklyhigh)
  let listofitems = []
  listofitems.append(Variables.fivehigh)
  listofitems.append(Variables.fifteenhigh)
  listofitems.append(Variables.thirtyhigh)
  listofitems.append(Variables.hourhigh)
  listofitems.append(Variables.twohourhigh)
  listofitems.append(Variables.fourhourhigh)
  listofitems.append(Variables.dailyhigh)
  listofitems.append(Variables.weeklyhigh)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
          for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.extendlenfivehigh)
  listoflens.append(Variables.extendlenfifteenhigh)
  listoflens.append(Variables.extendlenthirtyhigh)
  listoflens.append(Variables.extendlenhourhigh)
  listoflens.append(Variables.extendlentwohourhigh)
  listoflens.append(Variables.extendlenfourhourhigh)
  listoflens.append(Variables.extendlendailyhigh)
  listoflens.append(Variables.extendlenweeklyhigh)
  listofitems = []
  listofitems.append(Variables.extendfivehigh)
  listofitems.append(Variables.extendfifteenhigh)
  listofitems.append(Variables.extendthirtyhigh)
  listofitems.append(Variables.extendhourhigh)
  listofitems.append(Variables.extendtwohourhigh)
  listofitems.append(Variables.extendfourhourhigh)
  listofitems.append(Variables.extenddailyhigh)
  listofitems.append(Variables.extendweeklyhigh)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.lenfivelow)
  listoflens.append(Variables.lenfifteenlow)
  listoflens.append(Variables.lenthirtylow)
  listoflens.append(Variables.lenhourlow)
  listoflens.append(Variables.lentwohourlow)
  listoflens.append(Variables.lenfourhourlow)
  listoflens.append(Variables.lendailylow)
  listoflens.append(Variables.lenweeklylow)
  listofitems = []
  listofitems.append(Variables.fivelow)
  listofitems.append(Variables.fifteenlow)
  listofitems.append(Variables.thirtylow)
  listofitems.append(Variables.hourlow)
  listofitems.append(Variables.twohourlow)
  listofitems.append(Variables.fourhourlow)
  listofitems.append(Variables.dailylow)
  listofitems.append(Variables.weeklylow)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.extendlenfivelow)
  listoflens.append(Variables.extendlenfifteenlow)
  listoflens.append(Variables.extendlenthirtylow)
  listoflens.append(Variables.extendlenhourlow)
  listoflens.append(Variables.extendlentwohourlow)
  listoflens.append(Variables.extendlenfourhourlow)
  listoflens.append(Variables.extendlendailylow)
  listoflens.append(Variables.extendlenweeklylow)
  listofitems = []
  listofitems.append(Variables.extendfivelow)
  listofitems.append(Variables.extendfifteenlow)
  listofitems.append(Variables.extendthirtylow)
  listofitems.append(Variables.extendhourlow)
  listofitems.append(Variables.extendtwohourlow)
  listofitems.append(Variables.extendfourhourlow)
  listofitems.append(Variables.extenddailylow)
  listofitems.append(Variables.extendweeklylow)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.lenfiveopen)
  listoflens.append(Variables.lenfifteenopen)
  listoflens.append(Variables.lenthirtyopen)
  listoflens.append(Variables.lenhouropen)
  listoflens.append(Variables.lentwohouropen)
  listoflens.append(Variables.lenfourhouropen)
  listoflens.append(Variables.lendailyopen)
  listoflens.append(Variables.lenweeklyopen)
  listofitems = []
  listofitems.append(Variables.fiveopen)
  listofitems.append(Variables.fifteenopen)
  listofitems.append(Variables.thirtyopen)
  listofitems.append(Variables.houropen)
  listofitems.append(Variables.twohouropen)
  listofitems.append(Variables.fourhouropen)
  listofitems.append(Variables.dailyopen)
  listofitems.append(Variables.weeklyopen)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.extendlenfiveopen)
  listoflens.append(Variables.extendlenfifteenopen)
  listoflens.append(Variables.extendlenthirtyopen)
  listoflens.append(Variables.extendlenhouropen)
  listoflens.append(Variables.extendlentwohouropen)
  listoflens.append(Variables.extendlenfourhouropen)
  listoflens.append(Variables.extendlendailyopen)
  listoflens.append(Variables.extendlenweeklyopen)
  listofitems = []
  listofitems.append(Variables.extendfiveopen)
  listofitems.append(Variables.extendfifteenopen)
  listofitems.append(Variables.extendthirtyopen)
  listofitems.append(Variables.extendhouropen)
  listofitems.append(Variables.extendtwohouropen)
  listofitems.append(Variables.extendfourhouropen)
  listofitems.append(Variables.extenddailyopen)
  listofitems.append(Variables.extendweeklyopen)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.lenfive)
  listoflens.append(Variables.lenfifteen)
  listoflens.append(Variables.lenthirty)
  listoflens.append(Variables.lenhour)
  listoflens.append(Variables.lentwohour)
  listoflens.append(Variables.lenfourhour)
  listoflens.append(Variables.lendaily)
  listoflens.append(Variables.lenweekly)
  listofitems = []
  listofitems.append(Variables.five)
  listofitems.append(Variables.fifteen)
  listofitems.append(Variables.thirty)
  listofitems.append(Variables.hour)
  listofitems.append(Variables.twohour)
  listofitems.append(Variables.fourhour)
  listofitems.append(Variables.daily)
  listofitems.append(Variables.weekly)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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
  listoflens.append(Variables.extendlenfive)
  listoflens.append(Variables.extendlenfifteen)
  listoflens.append(Variables.extendlenthirty)
  listoflens.append(Variables.extendlenhour)
  listoflens.append(Variables.extendlentwohour)
  listoflens.append(Variables.extendlenfourhour)
  listoflens.append(Variables.extendlendaily)
  listoflens.append(Variables.extendlenweekly)
  listofitems = []
  listofitems.append(Variables.extendfive)
  listofitems.append(Variables.extendfifteen)
  listofitems.append(Variables.extendthirty)
  listofitems.append(Variables.extendhour)
  listofitems.append(Variables.extendtwohour)
  listofitems.append(Variables.extendfourhour)
  listofitems.append(Variables.extenddaily)
  listofitems.append(Variables.extendweekly)
  minlen = min(listoflens)
  for(item in listofitems){
      if(item.length > minlen){
        for(const x = 0; x < item.length-minlen; x++){
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




async function caller(){
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
  equalizer()
  console.log(values)
  testdaily.testdaily(values)
  testfifteen.testfifteenmin(values)
  testfourhour.testfourhour(values)
  testtwohour.testtwohour(values)
  testonehour.testonehour(values)
  testthirtymin.testthirtymin(values)
  testweekly.testweekly(values)

}
caller()