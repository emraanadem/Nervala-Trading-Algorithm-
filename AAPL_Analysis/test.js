const fs = require('fs');
    let raw = fs.readFileSync('IDS.json')
    let ids = JSON.parse(raw)
    console.log(ids[instrument])