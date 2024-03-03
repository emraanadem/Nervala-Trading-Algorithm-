async function One_Hour(instrument){
    let aggs = []
    let url = "1/hour/"+String(refdayonehour)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
    var res = await instance.get(url);
    var data = await res.data;
      for(let item = 0; item < data['results'].length; item++){
        values["One_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
      }
    while('next_url' in data){
        if('next_url' in data){
          let id = data['next_url'].split('/')[10]
          url = "1/hour/"+String(id)+"/"+String(today)+"?adjusted=true&sort=asc&limit=2500&apiKey=_jyyfwbAshFTAtdM3jaZIu9JnKLv7npG"
          var res = await instance.get(url);
          var data = await res.data;
          if ('results' in data){
              for(let item = 0; item < data['results'].length; item++){
                  values["One_Hour"]['c'].push(parseFloat(data['results'][item]['c']))
                  }
                }}}
    Variables.onehour = values["One_Hour"]['c']
    Variables.lenonehour = Variables.onehour.length
  }