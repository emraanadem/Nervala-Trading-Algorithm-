let raw = fs.readFileSync('Data.json')
let rawtwo = fs.readFileSync('High.json')
let rawthree = fs.readFileSync('Low.json')
let dataspecific = undefined
try{
    while(dataspecific === undefined){
        let data = JSON.parse(raw)
        let dataspecific = data[instrument]['Thirty_Min']
    Thirty_Min_Functions.priceHist = dataspecific
}}catch (error) {}
try{
    dataspecific = undefined
    while(dataspecific === undefined){
        let data = JSON.parse(rawtwo)
        let dataspecific = data[instrument]['Thirty_Min']
    Thirty_Min_Functions.highs = dataspecific
}}catch (error) {}
try{
    dataspecific = undefined
    while(dataspecific == undefined){
    let data = JSON.parse(rawthree)
    let dataspecific = data[instrument]['Thirty_Min']
    Thirty_Min_Functions.lows = dataspecific
}}catch (error) {}
let lens = []
lens.push(Thirty_Min_Functions.priceHist.length)
lens.push(Thirty_Min_Functions.highs.length)
lens.push(Thirty_Min_Functions.lows.length)
let minlens = Math.min(...lens)
let lists = [Thirty_Min_Functions.priceHist, Thirty_Min_Functions.highs, Thirty_Min_Functions.lows]
let items;
for (items in lists){
    if (items.length > minlens){
        if (items == Thirty_Min_Functions.priceHist){
            for(let item = 0; item < (Thirty_Min_Functions.priceHist.length - minlens); item++){
                Thirty_Min_Functions.priceHist.splice(0,1)
            }
        if (items == Thirty_Min_Functions.lows){
            for(let item = 0; item < (Thirty_Min_Functions.lows.length - minlens); item++){
                Thirty_Min_Functions.lows.splice(0,1)
            }
        if (items == Thirty_Min_Functions.highs){
            for(let item = 0; item < (Thirty_Min_Functions.highs.length - minlens); item++){
                Thirty_Min_Functions.highs.splice(0,1)
            }}}}}}}