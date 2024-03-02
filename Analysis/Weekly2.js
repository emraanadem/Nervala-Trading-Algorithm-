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
const createClient = require('@supabase/supabase-js').createClient;

// Create a single supabase client for interacting with your database
const supabase = createClient('https://nvlbmpghemfunkpnhwee.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY')



class Weekly_Nexus{

    pos = false
    biggersupres = []
    buy_pos = false
    sell_pos = false
    pot_sell = false
    pot_buy = false
    wins = 0
    losses = 0
    trades = 0
    support = 0
    resistance = 0
    posprice = 0
    bigpipprice = 0
    sl = 0
    tp = 0
    tstop = false
    tstoplossinits = false
    tstoploss = 0
    sldiff = 0
    tptwo = 0
    tstoplossvoid = false
    pips = 0
    piplog = [0]
    finlevs = []
    pchan = false
    pzone = false
    bigsupport = 0
    bigresistance = 0
    pair = ''
    
    /** announce price zones and price channels */
    static announcer(){
        if (Weekly_Nexus.pzone == false && Weekly_Functions.priceZones() == true){
            Weekly_Nexus.pzone = true
            console.log("Price Zone Identified")
        }if (Weekly_Nexus.pzone == true && Weekly_Functions.priceZones() == false){
            Weekly_Nexus.pzone = false
        }if (Weekly_Nexus.pchan == false && Weekly_Functions.priceChannels() == true){
            Weekly_Nexus.pchan = true
            console.log("Price Channel Identified")
        }if (Weekly_Nexus.pchan == true && Weekly_Functions.priceChannels() == false){
            Weekly_Nexus.pchan = false}
    }
    /** stop loss for buys */
    static stopLossBuy(){
        if (Weekly_Functions.price <= Weekly_Nexus.sl){
            Weekly_Nexus.closePosSL()}}
    /** stop loss for selling */
    static stopLossSell(){
        if (Weekly_Functions.price >= Weekly_Nexus.sl){
            Weekly_Nexus.closePosSL()}}

    /**initiates the piplog for pipcounting */
    static piploginit(){
        Weekly_Nexus.piplog = [0, 0, 0]
    }
    /**pip logging method */
    static piplogger(){
        let piplogging = Weekly_Nexus.piplog
        if (Weekly_Nexus.buy_pos){
            piplogging.push(Weekly_Functions.pipCountBuy(Weekly_Nexus.posprice, Weekly_Functions.price))
            Weekly_Nexus.bigpipprice = Math.max(...piplogging)
            Weekly_Nexus.piplog = piplogging}
        if (Weekly_Nexus.sell_pos){
            piplogging.push(Weekly_Functions.pipCountSell(Weekly_Nexus.posprice, Weekly_Functions.price))
            Weekly_Nexus.bigpipprice = Math.max(...piplogging)
            Weekly_Nexus.piplog = piplogging}
    }
        /**take profit for buying */
    static takeProfitBuy(){
        if (Weekly_Functions.price >= Weekly_Nexus.tp){
            if(Weekly_Functions.volatility() > .618){
                if((Weekly_Functions.price - Weekly_Nexus.tp) > (Weekly_Nexus.tp - Weekly_Nexus.tstoploss)){
                        if(Weekly_Nexus.tp < Weekly_Nexus.tptwo){
                            Weekly_Nexus.piploginit()
                            Weekly_Nexus.posprice = Weekly_Nexus.tp
                            Weekly_Nexus.tp = Weekly_Nexus.tptwo
                            Weekly_Functions.tpvariation()
                            console.log('pair: ' + Weekly_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(Weekly_Nexus.tp))
                            console.log("New Take Profit 2: " + String(Weekly_Nexus.tptwo))
                            }}}
            else{
            Weekly_Nexus.closePosTP()}}
        else if (Weekly_Functions.price <= Weekly_Nexus.tstoploss){
            Weekly_Nexus.closePosTP()}
        else if (Weekly_Functions.price == Weekly_Nexus.tptwo){
            Weekly_Nexus.closePosTP()}
    }
    /** take profit for selling */
    static takeProfitSell(){
        if (Weekly_Functions.price <= Weekly_Nexus.tp){
            if(Weekly_Functions.volatility() > .618){
                if((Weekly_Nexus.tp - Weekly_Functions.price) > (Weekly_Nexus.tstoploss - Weekly_Nexus.tp)){
                        if(Weekly_Nexus.tp < Weekly_Nexus.tptwo){
                            Weekly_Nexus.piploginit()
                            Weekly_Nexus.posprice = Weekly_Nexus.tp
                            Weekly_Nexus.tp = Weekly_Nexus.tptwo
                            Weekly_Functions.tpvariation()
                            console.log('pair: ' + Weekly_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(Weekly_Nexus.tp))
                            console.log("New Take Profit 2: " + String(Weekly_Nexus.tptwo))
                            }}}
            else{
            Weekly_Nexus.closePosTP()}}
        else if (Weekly_Functions.price >= Weekly_Nexus.tstoploss){
            Weekly_Nexus.closePosTP()}
        else if (Weekly_Functions.price == Weekly_Nexus.tptwo){
            Weekly_Nexus.closePosTP()}}
    /** stop loss defining method */
    static stoplossdef(){
        let stoploss = Weekly_Functions.stoploss()
        if(Weekly_Nexus.buy_pos){
            Weekly_Nexus.sl = Weekly_Functions.price - stoploss}
        if(Weekly_Nexus.sell_pos){
            Weekly_Nexus.sl = Weekly_Functions.price + stoploss}}
    /** define volatility for the system, tells me whether or not to alter trailing stop loss*/
    static volatilitydef(){
        if(Weekly_Functions.volatility() > .618 && Weekly_Nexus.tstoplossinits && !Weekly_Nexus.tstoplossvoid){
            Weekly_Nexus.tstoplossdefvol()}
    }
    /** initiate trailing stop loss */
    static tstoplossinit(){
        let stoploss = Weekly_Nexus.sldiff
        if(!Weekly_Nexus.tstop && !Weekly_Nexus.tstoplossinits && !Weekly_Nexus.tstoplossvoid){
            if(Weekly_Nexus.buy_pos){
                if(Weekly_Functions.price > Weekly_Nexus.posprice + .3*stoploss){
                    Weekly_Nexus.tstoplossinits = true
                    Weekly_Nexus.tstoplossdef()}}
            if(Weekly_Nexus.sell_pos){
                if(Weekly_Functions.price < Weekly_Nexus.posprice - .3*stoploss){
                    Weekly_Nexus.tstoplossinits = true
                    Weekly_Nexus.tstoplossdef()}}}
    }
    /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a 
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
    static tstoplossdefvol(){
        Weekly_Nexus.sldiff = Weekly_Functions.stoploss()
        let stoploss = Weekly_Nexus.sldiff
        if(Weekly_Nexus.buy_pos){
            if(Weekly_Functions.price > Weekly_Nexus.posprice + .3*stoploss){
                Weekly_Nexus.tstop = true
                Weekly_Nexus.tstoploss = Weekly_Nexus.posprice + (((Math.abs(Weekly_Functions.price-Weekly_Nexus.posprice))*(Weekly_Functions.trailingsl())))
            }}
        if(Weekly_Nexus.sell_pos){
            if(Weekly_Functions.price < Weekly_Nexus.posprice - .3*stoploss){
                Weekly_Nexus.tstop = true
                Weekly_Nexus.tstoploss = Weekly_Nexus.posprice - (((Math.abs(Weekly_Functions.price-Weekly_Nexus.posprice))*(Weekly_Functions.trailingsl())))
            }}
    }
    /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility*/
    static tstoplosscheck(){
        let tstoploss = Weekly_Nexus.sldiff
        if(Weekly_Nexus.buy_pos){
            if(Weekly_Functions.price < Weekly_Nexus.posprice + .3*tstoploss){
                Weekly_Nexus.tstoplossvoid = true
            }
            else{
                Weekly_Nexus.tstoplossvoid = false
                Weekly_Nexus.volatilitydef()
                Weekly_Nexus.tstoplossinit()
            }}
        if(Weekly_Nexus.sell_pos){
            if(Weekly_Functions.price > Weekly_Nexus.posprice - .3*tstoploss){
                Weekly_Nexus.tstoplossvoid = true
            }
            else{
                Weekly_Nexus.tstoplossvoid = false
                Weekly_Nexus.volatilitydef()
                Weekly_Nexus.tstoplossinit()}}
    }
    /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
    static tstoplosscont(){
        if(Weekly_Functions.volatility() < .618 && Weekly_Nexus.tstoplossinits && !Weekly_Nexus.tstoplossvoid){
            Weekly_Nexus.sldiff = Weekly_Functions.stoploss()
            let stoploss = Weekly_Nexus.sldiff
            if(Weekly_Nexus.buy_pos){
                if(Weekly_Functions.price > Weekly_Nexus.posprice + .3*stoploss){
                    Weekly_Nexus.tstoploss = Weekly_Nexus.posprice + Weekly_Functions.pipreverse(Weekly_Nexus.posprice, .618*Weekly_Nexus.bigpipprice)
            }}
            if(Weekly_Nexus.sell_pos){
                if(Weekly_Functions.price < Weekly_Nexus.posprice - .3*stoploss){
                    Weekly_Nexus.tstoploss = Weekly_Nexus.posprice - Weekly_Functions.pipreverse(Weekly_Nexus.posprice, .618*Weekly_Nexus.bigpipprice)
            }}}
    }
    /** method that defines trailing stop loss for the system to begin with trailing stop loss */
    static tstoplossdef(){
        Weekly_Nexus.sldiff = Weekly_Functions.stoploss()
        let stoploss = Weekly_Nexus.sldiff
        if(Weekly_Nexus.buy_pos){
            if(Weekly_Functions.price > Weekly_Nexus.posprice + .3*stoploss){
                Weekly_Nexus.tstop = true
                Weekly_Nexus.tstoploss = Weekly_Nexus.posprice + Weekly_Functions.pipreverse(Weekly_Nexus.posprice, .618*Weekly_Nexus.bigpipprice)
            }}
        if(Weekly_Nexus.sell_pos){
            if(Weekly_Functions.price < Weekly_Nexus.posprice - .3*stoploss){
                Weekly_Nexus.tstop = true
                Weekly_Nexus.tstoploss = Weekly_Nexus.posprice - Weekly_Functions.pipreverse(Weekly_Nexus.posprice, .618*Weekly_Nexus.bigpipprice)
        }}}

    /*FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS!*/
    
    /** initiates a buy signal */
    static buy(){
        Weekly_Functions.supreslevs()
        Weekly_Functions.getPrice()
        Weekly_Functions.stoploss()
        Weekly_Functions.tpvariation()
        if(!Weekly_Functions.rejectionzoning()){
            if (Math.abs(Weekly_Functions.valdiff(Weekly_Functions.price, Weekly_Functions.closest(Weekly_Functions.price))) > .025) {
                Weekly_Nexus.tp = Weekly_Nexus.resistance
                Weekly_Nexus.pos = true
                Weekly_Nexus.buy_pos = true
                Weekly_Nexus.posprice = Weekly_Functions.price
                Weekly_Functions.stoploss()
                Weekly_Functions.tpvariation()
                console.log('pair: ' + Weekly_Nexus.pair)
                console.log("Open Buy Order on Weekly")
                console.log("Entry Price: " + String(Weekly_Nexus.posprice))
                console.log("Stop Loss: " + String(Weekly_Nexus.sl))
                console.log("Target Take Profit: " + String(Weekly_Nexus.tp))
                console.log("Take Profit 2: " + String(Weekly_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static buy(){
        Weekly_Functions.supreslevs()
        Weekly_Functions.getPrice()
        Weekly_Nexus.tp = Weekly_Nexus.resistance
        Weekly_Nexus.pos = true
        Weekly_Nexus.buy_pos = true
        Weekly_Nexus.posprice = Weekly_Functions.price
                Weekly_Functions.stoploss()
                Weekly_Functions.tpvariation()
        console.log("Open Buy Order")
        console.log(Weekly_Nexus.sl + " : Stop Loss")
        console.log(Weekly_Nexus.tp + " : Target Take Profit")
        } */

    /** initiates a sell order */
    static sell(){
        Weekly_Functions.supreslevs()
        Weekly_Functions.getPrice()
        Weekly_Functions.stoploss()
        Weekly_Functions.tpvariation()
        if(!Weekly_Functions.rejectionzoning()){
            if (Math.abs(Weekly_Functions.valdiff(Weekly_Functions.price, Weekly_Functions.closest(Weekly_Functions.price))) > .025) {
                Weekly_Nexus.tp = Weekly_Nexus.support
                Weekly_Nexus.pos = true
                Weekly_Nexus.sell_pos = true
                Weekly_Nexus.posprice = Weekly_Functions.price
                Weekly_Functions.stoploss()
                Weekly_Functions.tpvariation()
                console.log('pair: ' + Weekly_Nexus.pair)
                console.log("Open Sell Order on Weekly")
                console.log("Entry Price: " + String(Weekly_Nexus.posprice))
                console.log("Stop Loss: " + String(Weekly_Nexus.sl))
                console.log("Target Take Profit: " + String(Weekly_Nexus.tp))
                console.log("Take Profit 2: " + String(Weekly_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static sell(){
        Weekly_Functions.supreslevs()
        Weekly_Functions.getPrice()
        Weekly_Nexus.tp = Weekly_Nexus.support
        Weekly_Nexus.pos = true
        Weekly_Nexus.sell_pos = true
        Weekly_Nexus.posprice = Weekly_Functions.price
                Weekly_Functions.stoploss()
                Weekly_Functions.tpvariation()
        console.log("Open Sell Order")
        console.log(Weekly_Nexus.sl + " : Stop Loss")
        console.log(Weekly_Nexus.tp + " : Target Take Profit")
        }*/

    /** checks for price movement in lower periods to get better idea of the trend */
    static controlSmallerPeriod(){
        try{
        /*Confirm Trend w/ indicators and price movement*/
        Daily_Functions.HistoryAssigner()
        One_Hour_Functions.HistoryAssigner()
        Thirty_Min_Functions.HistoryAssigner()
        let buy = false
        let sell = false
        if(!One_Hour_Functions.consolidationtwo() && !Thirty_Min_Functions.consolidationtwo()){
            if(Daily_Functions.ema()){
                if(Daily_Functions.trend() && Daily_Functions.macd() && Daily_Functions.obv()){
                    if(One_Hour_Functions.ema()){
                        if(One_Hour_Functions.rsi() && One_Hour_Functions.obv()){
                            buy = true}}}}
            if(!Daily_Functions.ema()){
                if(!Daily_Functions.trend() && !Daily_Functions.macd() && !Daily_Functions.obv()){
                    if(!One_Hour_Functions.ema()){
                        if(!One_Hour_Functions.rsi() && !One_Hour_Functions.obv()){
                            sell = true}}}}}
        return [buy, sell]}
        catch (error) {
            console.log(error)
        }
    }

    /** main control method, takes control of the entire program and serves as the brain */
    static controlMain(){
        try{
        Weekly_Functions.rejecinit()
        Weekly_Functions.HistoryAssigner()
        Weekly_Functions.ValueAssigner()
        Weekly_Functions.stoploss()
        Weekly_Functions.getPrice()
        Weekly_Functions.supreslevs()
        if (!Weekly_Functions.consolidationtwo() && Weekly_Functions.overall() && !Weekly_Functions.consolidation()
            && !Weekly_Functions.keylev()){
                if (Weekly_Functions.ema()){
                    if (Weekly_Nexus.controlSmallerPeriod()[0] == true){
                        if (Weekly_Functions.trend() && Weekly_Functions.rsi() 
                            && Weekly_Functions.macd() && Weekly_Functions.roc() && Weekly_Functions.obv()) {
                                if (!Weekly_Nexus.pos){
                                    if (!Weekly_Nexus.buy_pos)
                                        Weekly_Nexus.pot_buy = true
                                        Weekly_Functions.stoploss()
                                        Weekly_Nexus.piploginit()
                                        Weekly_Nexus.buy()}}}}
                if (!Weekly_Functions.ema()){
                    if (Weekly_Nexus.controlSmallerPeriod()[1] == true){
                        if (!Weekly_Functions.trend() && !Weekly_Functions.rsi() 
                            && !Weekly_Functions.macd() && !Weekly_Functions.roc() && !Weekly_Functions.obv()) {
                                if (!Weekly_Nexus.pos){
                                    if (!Weekly_Nexus.sell_pos)
                                        Weekly_Nexus.pot_sell = true
                                        Weekly_Functions.stoploss()
                                        Weekly_Nexus.piploginit()
                                        Weekly_Nexus.sell()}}}}}
        if (Weekly_Nexus.pos && Weekly_Nexus.buy_pos){
            Weekly_Nexus.piplogger()
            Weekly_Nexus.stopLossBuy()
            Weekly_Nexus.tstoplosscheck()
            Weekly_Nexus.tstoplosscont()
            Weekly_Nexus.takeProfitBuy()}
        if (Weekly_Nexus.pos && Weekly_Nexus.sell_pos){
            Weekly_Nexus.piplogger()
            Weekly_Nexus.stopLossSell()
            Weekly_Nexus.tstoplosscheck()
            Weekly_Nexus.tstoplosscont()
            Weekly_Nexus.takeProfitSell()}
        Weekly_Functions.rejecsave()}
        catch (error) {
            console.log(error)
        }
        /*figure out how to clear memory, and do so here after every iteration*/
        /*memory issue solved: 4/20/22 */}

    /** close position method for taking profit, and gives pip count and win/loss ratio */
    static closePosTP(){
        if (Weekly_Nexus.pos){
            if (Weekly_Nexus.buy_pos){
                Weekly_Nexus.buy_pos = false
                Weekly_Nexus.pos = false
                Weekly_Nexus.tstop = false
                Weekly_Nexus.pot_buy = false
                Weekly_Nexus.tstoplossinits = false
                Weekly_Nexus.tstoplossvoid = false
                Weekly_Nexus.pchan = false
                Weekly_Nexus.pzone = false
                Weekly_Nexus.wins += 1
                Weekly_Nexus.trades += 1
                Weekly_Nexus.piplog = [0, 0, 0]
                let pipchange = Weekly_Functions.pipCountBuy(Weekly_Nexus.posprice, Weekly_Functions.price)
                Weekly_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + Weekly_Nexus.pair)
                console.log("Take Profit Hit on Weekly")
                console.log(Weekly_Nexus.wins + " Wins and     " + Weekly_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Weekly_Nexus.wins/Weekly_Nexus.trades)
                console.log("Pip Count: " + Weekly_Nexus.pips)}
            if (Weekly_Nexus.sell_pos){
                Weekly_Nexus.sell_pos = false
                Weekly_Nexus.pos = false
                Weekly_Nexus.pot_sell = false
                Weekly_Nexus.tstop = false
                Weekly_Nexus.tstoplossinits = false
                Weekly_Nexus.tstoplossvoid = false
                Weekly_Nexus.pchan = false
                Weekly_Nexus.pzone = false
                Weekly_Nexus.wins += 1
                Weekly_Nexus.trades += 1
                Weekly_Nexus.piplog = [0, 0, 0]
                let pipchange = Weekly_Functions.pipCountSell(Weekly_Nexus.posprice, Weekly_Functions.price)
                Weekly_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + Weekly_Nexus.pair)
                console.log("Take Profit Hit on Weekly")
                console.log(Weekly_Nexus.wins + " Wins and     " + Weekly_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Weekly_Nexus.wins/Weekly_Nexus.trades)
                console.log("Pip Count: " + Weekly_Nexus.pips)}}}

    /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
    static closePosSL(){
        if (Weekly_Nexus.pos){
            if (Weekly_Nexus.sell_pos){
                Weekly_Nexus.sell_pos = false
                Weekly_Nexus.pos = false
                Weekly_Nexus.tstop = false
                Weekly_Nexus.tstoplossinits = false
                Weekly_Nexus.tstoplossvoid = false
                Weekly_Nexus.pchan = false
                Weekly_Nexus.pot_sell = false
                Weekly_Nexus.pzone = false
                Weekly_Nexus.losses += 1
                Weekly_Nexus.trades += 1
                Weekly_Nexus.piplog = [0, 0, 0]
                let pipchange = Weekly_Functions.pipCountSell(Weekly_Nexus.posprice, Weekly_Functions.price)
                Weekly_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + Weekly_Nexus.pair)
                console.log("Stop Loss Hit on Weekly")
                console.log(Weekly_Nexus.wins + " Wins and     " + Weekly_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Weekly_Nexus.wins/Weekly_Nexus.trades)
                console.log("Pip Count" + Weekly_Nexus.pips)}
            if (Weekly_Nexus.buy_pos){
                Weekly_Nexus.buy_pos = false
                Weekly_Nexus.pos = false
                Weekly_Nexus.tstop = false
                Weekly_Nexus.pot_buy = false
                Weekly_Nexus.tstoplossinits = false
                Weekly_Nexus.tstoplossvoid = false
                Weekly_Nexus.pchan = false
                Weekly_Nexus.pzone = false
                Weekly_Nexus.losses += 1
                Weekly_Nexus.trades += 1
                Weekly_Nexus.piplog = [0, 0, 0]
                let pipchange = Weekly_Functions.pipCountBuy(Weekly_Nexus.posprice, Weekly_Functions.price)
                Weekly_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + Weekly_Nexus.pair)
                console.log("Stop Loss Hit on Weekly")
                console.log(Weekly_Nexus.wins + " Wins and     " + Weekly_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Weekly_Nexus.wins/Weekly_Nexus.trades)
                console.log("Pip Count" + Weekly_Nexus.pips)}}}
}

class Weekly_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    extendHigh = []
    extendLow = []
    vals = []
    rejectionzones = new Array();
    price = 0
    maxes = []
    timeperiods = {}
    mins = []
    recentHisto = []
    highs = []
    lows = []

/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        Weekly_Nexus.pair = dataspecific
        return dataspecific
    }
/** load historical prices from json file */
    static HistoryAssigner(){
        let instrument = Weekly_Functions.instrument_name()
        
        Weekly_Functions.priceHist = dataset["Weekly"]['c']
        Weekly_Functions.highs = dataset["Weekly"]['h']
        Weekly_Functions.lows = dataset["Weekly"]['l']
        Weekly_Functions.extendHist = dataset["Weekly Extend"]['c']
        Weekly_Functions.extendHigh = dataset["Weekly Extend"]['h']
        Weekly_Functions.extendLow = dataset["Weekly Extend"]['l']
        }
/** load price from json file */
static ValueAssigner(){
    let instrument = Weekly_Functions.instrument_name()
    let raw = fs.readFileSync('LivePrice.json')
    try{
        let data = JSON.parse(raw)
        let dataspecific = data[instrument]
        Weekly_Functions.price = dataspecific['Price']
    }catch (error) {}
    }

/** second consolidation method, meant to strengthen consolidation identification */
static consolidationtwo(){
    let history = Weekly_Functions.priceHist
    let highs = Weekly_Functions.highs
    let lows = Weekly_Functions.lows
    let histmax = Math.max(...history)
    let histmin = Math.min(...history)
    let histdiff = histmax - histmin
    let q = bolls.calculate({period : 10, values: history, stdDev: 1});
    let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
    let h = []
    let i = []
    let j = []
    for(let value = 0; value < q.length; value++){
        h.push(q[value]['lower'])
        i.push(q[value]['upper'])
        j.push(q[value]['middle'])}
    let smmas = smas.calculate({period : 14, values : h})
    let smmass = smas.calculate({period : 14, values : i})
    /*keep midpoint just in case */
    let smmasss = smas.calculate({period : 14, values : j})
    let smmaslast = smmas[smmas.length-1]
    let smmasslast = smmass[smmass.length-1]
    let smadiff = smmasslast - smmaslast
    let ndiffone = n[n.length-1] - n[n.length-2]
    let ndifftwo = n[n.length-2] - n[n.length-3]
    let benchmark = .025*histdiff
    if (smadiff > benchmark && (n[n.length-1] > n[n.length-2] && ndiffone > ndifftwo)){
        return false
    }else{
        return true
    }
}
/** TP variation, helps change TP depending on volatility and price movement depending on whether or not the code has surpassed TP1 and 
 * is about to hit TP2 
 */
static tpvariation(){
    let tp = Weekly_Nexus.tp
    let values = Weekly_Nexus.finlevs.concat(Weekly_Nexus.biggersupres)
    let valdiffgreater = []
    let valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    let num1 = Weekly_Nexus.price
    let volval = Weekly_Functions.volatility()
    if(Weekly_Nexus.buy_pos){
        for(let item = 0; item < values.length; item++){
            if (num1 < values[item]) {
                valdiffgreater.push(Math.abs(num1-values[item]))}}
        closesttp = Weekly_Nexus.tp
        filteredvaldiff = [...new Set(valdiffgreater)]
        for(const valuers in filteredvaldiff){
            referenceval = closesttp - num1
            if ((referenceval >= valuers)){
                filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
            }
        }
        if(volval > .618){
            Weekly_Nexus.tp = Weekly_Functions.price+(Math.abs(Weekly_Functions.price-Weekly_Nexus.tp)*1.382)
            if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                && !(Math.min(...filteredvaldiff) == Weekly_Functions.price)){
                    nexttp = Weekly_Functions.price+(Math.abs(Weekly_Functions.price-Math.min(...filteredvaldiff))*1.382)
            }else{
                nexttp = Weekly_Functions.price + ((Weekly_Nexus.tp-Weekly_Functions.price)*1.618)

            }
        }else{
            if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                && !(Math.min(...filteredvaldiff) == Weekly_Functions.price)){
                nexttp = Weekly_Functions.price+Math.min(...filteredvaldiff)
            }else{
                nexttp = Weekly_Functions.price + ((Weekly_Functions.tp - Weekly_Functions.price)*1.382)
            }}}
    if(Weekly_Nexus.sell_pos){
        for(let item = 0; item < values.length; item++){
            if (num1 > values[item]) {
                valdiffless.push(Math.abs(num1-values[item]))}}
        closesttp = Weekly_Nexus.tp
        filteredvaldiff = [...new Set(valdiffless)]
        for(const valuers in filteredvaldiff){
            referenceval = num1 - closesttp
            if ((referenceval >= valuers)){
                filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                
            }
        }
        if(volval > .618){
            Weekly_Nexus.tp = Weekly_Functions.price-(Math.abs(Weekly_Functions.price-Weekly_Nexus.tp)*1.382)
            if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                && !(Math.min(...filteredvaldiff) == Weekly_Functions.price)){
                    nexttp = Weekly_Functions.price-(Math.abs(Weekly_Functions.price-Math.min(...filteredvaldiff))*1.382)
            }else{
                nexttp = Weekly_Functions.price - ((Weekly_Functions.price - Weekly_Nexus.tp)*1.618)

            }
        }else{
            if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                && !(Math.min(...filteredvaldiff) == Weekly_Functions.price)){
                nexttp = Weekly_Functions.price+Math.min(...filteredvaldiff)
            }else{
                nexttp = Weekly_Functions.price - ((Weekly_Functions.price - Weekly_Nexus.tp)*1.382)
            }}}
    Weekly_Nexus.tptwo = nexttp
    }
/**fibonacci levels to be added to the program...
 * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
*/
static fib(){
    let recents = Weekly_Functions.recentHisto
    let dataset = []
    for(let x = 1; x < 51; x++){
        dataset.push([x,recents[x-1]])
    }
    const mod = createModel();
    mod.fit(dataset, [4]);
    mod.estimate(4, 25);
    let equation = mod.expressions()['4']
    let q = nerdamer.diff((equation))
    let newequation = q.text()
    let root = roots.getRoots((newequation))
    let baseprice = 0
    let currentprice = Weekly_Functions.price
    let diff = Math.abs(baseprice-currentprice)
    if(currentprice < baseprice){
        let fib1 = diff*.236 + currentprice
        let fib2 = diff*.382 + currentprice
        let fib3 = diff*.5 + currentprice
        let fib4 = diff*.618 + currentprice
        let fib5 = diff*.786 + currentprice
        let fib6 = diff*1.00 + currentprice
    }
    if(currentprice > baseprice){
        let fib1 = diff*.236 + baseprice
        let fib2 = diff*.382 + baseprice
        let fib3 = diff*.5 + baseprice
        let fib4 = diff*.618 + baseprice
        let fib5 = diff*.786 + baseprice
        let fib6 = diff*1.00 + baseprice
    }
    /* Finish finding roots of derivative, from this point select the root with the highest x value,
    then register fib levels from the price corresponding to that x value, depending on whether or not its a buy or sell */
}

/** Rejection Zone Initiator */
static rejecinit(){
    let instrument = Weekly_Functions.instrument_name()
    if(!fs.existsSync('./Rejection_Archive/'+String(instrument)+'.json')){
        Weekly_Functions.timeperiods = {}
        Weekly_Functions.timeperiods['Fifteen_Min'] = [0, 0, 0]
        Weekly_Functions.timeperiods['Thirty_Min'] = [0, 0, 0]
        Weekly_Functions.timeperiods['One_Hour'] = [0, 0, 0]
        Weekly_Functions.timeperiods['Two_Hour'] = [0, 0, 0]
        Weekly_Functions.timeperiods['Four_Hour'] = [0, 0, 0]
        Weekly_Functions.timeperiods['Daily'] = [0, 0, 0]
        Weekly_Functions.timeperiods['Weekly'] = [0, 0, 0]
        fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Weekly_Functions.timeperiods, null, 2))
    }
    let raw = fs.readFileSync('./Rejection_Archive/'+String(instrument)+'.json')
    Weekly_Functions.timeperiods = JSON.parse(raw)
    Weekly_Functions.rejectionzones = JSON.parse(raw)['Weekly']
}
/** Rejection Zone Saver */
static rejecsave(){
    let instrument = Weekly_Functions.instrument_name()
    Weekly_Functions.rejectionzones = [...new Set(Weekly_Functions.rejectionzones)]
    Weekly_Functions.timeperiods['Weekly'] = Weekly_Functions.rejectionzones
    fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Weekly_Functions.timeperiods, null, 2))
}

/**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition*/
static overall(){
    let extendedhistory = Weekly_Functions.extendHist
    Weekly_Functions.rejectionzones = [0, 0, 0]
    let price = Weekly_Functions.price
    let max = Math.max(...extendedhistory)
    let min = Math.min(...extendedhistory)
    let buffer = (max-min)*.05
    let lower = price-buffer
    let upper = price+buffer
    let pricerange = [lower, upper]
    let studylist = []
    for(let val = 0; val < extendedhistory.length; val++){
        if(extendedhistory[val] <= upper && extendedhistory[val] >= lower){
            studylist.push([val, extendedhistory[val]])
        }
    }
    let result = Weekly_Functions.analysis(studylist, extendedhistory, pricerange)
    return result
}
/** Do past Analysis to see if this is a good trade, based on static overall() method */
static analysis(cases, extendedhistory, pricerange){
    let histnorm = Weekly_Functions.priceHist
    let normdiff = (Math.max(...histnorm) - Math.min(...histnorm))*.025
    let q = bolls.calculate({period : 10, values: extendedhistory, stdDev: 1});
    let h = []
    let i = []
    let j = []
    for(let value = 0; value < q.length; value++){
        h.push(q[value]['lower'])
        i.push(q[value]['upper'])
        j.push(q[value]['middle'])}
    let smmas = smas.calculate({period : 14, values : h})
    let smmass = smas.calculate({period : 14, values : i})
    /*keep midpoint just in case */
    let smmasss = smas.calculate({period : 14, values : j})
    let histdiff = (pricerange[1] - pricerange[0])/2
    let benchmark = .025*histdiff
    let fractals = []
    let rejection = 0
    for(let val = 0; val < cases.length; val++){ 
        fractals.push(cases[val][0])
    }
    for(let val = 0; val < fractals.length; val++){
        let mincount = 0
        let maxcount = 0
        for(let value = 0; value < 3; value++){
            if((fractals[val] < extendedhistory.length - 2) && (fractals[val] > 1)){
                if(extendedhistory[fractals[val]] > extendedhistory[fractals[val]-value]){
                    maxcount++
            }
                if(extendedhistory[fractals[val]] > extendedhistory[fractals[val]+value]){
                    maxcount++}
                if(extendedhistory[fractals[val]] < extendedhistory[fractals[val]-value]){
                    mincount++
                }
                if(extendedhistory[fractals[val]] < extendedhistory[fractals[val]+value]){
                    mincount++}}}
        if(mincount || maxcount > 4){
            rejection++
            if(fractals.length < 1){
                fractals.push(0)
                Weekly_Functions.rejectionzones.push(fractals[0])
            }else{
                let frac = fractals[val]
                Weekly_Functions.rejectionzones.push(extendedhistory[frac])
        }}}
    if(Weekly_Functions.rejectionzones.length < 1){
        Weekly_Functions.rejectionzones.push(Weekly_Functions.price)
    }
    if(rejection > 2){
        return false
    }else{
        return true
    }
    
}

/** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
static rejectionzoning(){
    Weekly_Functions.overall()
    let rejects = Weekly_Functions.rejectionzones
    let diffs = []
    for(const val in rejects){
        if(Weekly_Nexus.pot_buy){
            if(Weekly_Functions.price < val){
                diffs.push(val - Weekly_Functions.price)}}
        if(Weekly_Nexus.pot_sell){
            if(Weekly_Functions.price > val){
                diffs.push(Weekly_Functions.price - val)}}
    }

    if(Math.abs(Math.min(...diffs)) < Math.abs(Weekly_Functions.price - Weekly_Nexus.tp)){
        Weekly_Nexus.pot_buy = false
        Weekly_Nexus.pot_sell = false
        return true
    }else{
        return false
    }
}
/** return price */
static getPrice(){
    return Weekly_Functions.price}
/** return historical price */
static priceHistory(){
    return Weekly_Functions.priceHist}
/** find whether trend is going up or down */
static trend(){
    let history = Weekly_Functions.priceHist
    if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
        return true
    if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
        return false
}
/** recent history, shortens history array into last 50 digits for different analyses */
static recentHist(){
    let history = Weekly_Functions.priceHist
    let historytwo = []
    for(let x = 0; x < 50; x++)
        historytwo.push(history.splice(-1,1)[0])
    Weekly_Functions.recentHisto = historytwo.reverse()
}
/** determination of stop loss size */
static stoploss(){
    var highs = Weekly_Functions.highs
    var lows = Weekly_Functions.lows
    var diff = []
    var totaldiff = 0
    var finaldiff = 0
    for(let variables = 0; variables < 30; variables++){
        diff.push(Math.abs(highs[highs.length-1-variables]-lows[lows.length-1-variables]))}
    for(let variables = 0; variables < diff.length; variables++){
        totaldiff += diff[variables]}
    if(Weekly_Functions.volatility() > .618){
        finaldiff = (totaldiff/30)*1.382}
    else{
        finaldiff = (totaldiff/30)
    }
    let slceil = 0
    let slfloor = 0
    let numbuy = 0
    let newsl = 0
    if(Weekly_Nexus.pot_buy){
        let diffprice = Weekly_Functions.price - finaldiff
        if(!Number.isFinite(Weekly_Functions.closesttwo(diffprice)[0])){
            slfloor = Weekly_Functions.price - (finaldiff*3.618)
            newsl = slfloor
        }else{
            numbuy = Weekly_Functions.closesttwo(diffprice)[0]
            if(!Number.isFinite(Weekly_Functions.closesttwo(numbuy)[0])){
                newsl = diffprice-(.786*(diffprice-numbuy))
            }else{
                slfloor = (Weekly_Functions.price-((Weekly_Functions.price - Weekly_Functions.closesttwo(numbuy)[0])*1.618*.786))
                newsl = slfloor
            }}
        Weekly_Nexus.sl = newsl
    }if(Weekly_Nexus.pot_sell){
        let diffprice = finaldiff + Weekly_Functions.price
        if(!Number.isFinite(Weekly_Functions.closesttwo(diffprice)[1])){
            slceil = Weekly_Functions.price + (finaldiff*3.618)
            newsl = slceil
        }else{
            numbuy = Weekly_Functions.closesttwo(diffprice)[1]
            if(!Number.isFinite(Weekly_Functions.closesttwo(numbuy)[1])){
                newsl = diffprice+(.786*(numbuy-diffprice))
            }else{
                slceil = (Weekly_Functions.price+((Math.abs(Weekly_Functions.price - Weekly_Functions.closesttwo(numbuy)[1]))*1.618*.786))
                newsl = slceil
            }}
        Weekly_Nexus.sl = newsl
        }
    return finaldiff
    }
/** finds closest support and resistance level to whatever price u put in */
static closesttwo(num1){
let values = Weekly_Nexus.finlevs.concat(Weekly_Nexus.biggersupres)
let valdiffgreater = []
let valdiffless = []
for(let item = 0; item < values.length; item++){
    if (num1 < values[item]) {
        valdiffgreater.push(Math.abs(num1-values[item]))}
    if (num1 > values[item]) {
        valdiffless.push(Math.abs(num1-values[item]))}}
let closestbelow = Weekly_Functions.price-Math.min(...valdiffless)
let closestabove = Weekly_Functions.price+Math.min(...valdiffgreater)
let closests = [closestbelow, closestabove]
return closests
}
/** price zones, meant to determine whether a price zone has been found or not */
static priceZones(){
    Weekly_Functions.supreslevs()
    if(Math.abs((Weekly_Functions.pipCountBuy(Weekly_Functions.price,Weekly_Nexus.resistance))
        )/(Math.abs(Weekly_Functions.pipCountBuy(Math.max(...Weekly_Functions.priceHist),Math.min(...Weekly_Functions.priceHist)))) < .1){
        return true
    }else if(Math.abs((Weekly_Functions.pipCountBuy(Weekly_Functions.price,Weekly_Nexus.support))
        )/(Math.abs(Weekly_Functions.pipCountBuy(Math.max(...Weekly_Functions.priceHist),Math.min(...Weekly_Functions.priceHist)))) < .1){
        return true
    }else{
        return false
    }
}
/** keylev, meant to determine the closest keylevel to the current price */
static keylev(){
    Weekly_Functions.getPrice()
    if(Weekly_Functions.valdiff(Weekly_Functions.price, Weekly_Functions.closest(Weekly_Functions.price)) < .1){
        return true}
    else{
        return false}}
/**volatility, meant to determine whether or not price movement is too volatile for current parameters */
static volatility(){
    let history = Weekly_Functions.priceHist
    let r = rsis.calculate({period: 14, values: history})
    let q = r[r.length-1]
    let diff = 0
    if(q > 50)
        diff = q - 0
    else if(q <= 50)
        diff = 100 - q
    let difference = diff/100
    let equation = ((Math.abs((100)*Math.sin(difference))))/(Math.abs(100*Math.sin(1.05)))
    return equation
    }
/** trailing stop loss factor, uses derived equation to create a sort of "bubble" around price movement to prevent trades being taken out early */
static trailingsl(){
    var factor = Weekly_Functions.volatility()
    let history = Weekly_Functions.priceHist
    let ceiling = Math.max(...history)
    let floor = Math.min(...history)
    let diffy = ceiling - floor
    let posdiff = Math.abs(Weekly_Nexus.posprice - Weekly_Functions.price)
    let deci = posdiff/diffy
    let input = deci*6.18
    var equation = (1-factor)*(((input*input)+input)/((input*input)+input+1))
    return equation
}
/**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
static priceChannels(){
    let rvalues = Weekly_Functions.regression()
    if ((rvalues[0]*rvalues[0]) > .8 && (rvalues[1]*rvalues[1]) > .8) {
        return true
    }
    else{
        return false
    }
}
/** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now*/
static consolidation(){
    if (Weekly_Functions.volatility() > .618){
        return false
    }else{
        return true
    }
}
/** used to determine slope between two points */
static slopes(){
    Weekly_Functions.recentHist()
    let recentHistory = Weekly_Functions.recentHisto
    let slope = []
    for(let value = 0; value < recentHistory.length-1; value++){
        slope.push(recentHistory[value+1]-recentHistory[value])
    }
    return slope
}

/* Make stricter, 3+ values or more to be a max or min once real data comes thru */
/* UPDATE: stricter values not working that well, but its identifying price channels so ... should I change? I don't know*/
/** used to determine relative maxes and mins for identification of price channels */
static maxes_mins(){
    Weekly_Functions.recentHist()
    let recentHistory = Weekly_Functions.recentHisto
    let slope = Weekly_Functions.slopes()
    let maxes = []
    let mins = []
    for(let value = 3; value < slope.length-2; value++){
        if(slope[value-1] > 0 && slope[value] < 0) {
            if(slope[value-2] > 0 && slope[value+1] < 0)
                maxes.push(recentHistory[value])
            else if(slope[value-3] > 0 && slope[value+1] < 0)
                maxes.push(recentHistory[value])}
        else if(slope[value-1] < 0 && slope[value] > 0){
            if(slope[value-2] < 0 && slope[value+1] > 0)
                mins.push(recentHistory[value])
            else if(slope[value-3] < 0 && slope[value+1] > 0)
                mins.push(recentHistory[value])}}
    Weekly_Functions.maxes = maxes
    Weekly_Functions.mins = mins
}
/** used to determine regression lines (moving averages, for example) */
static regression(){
    Weekly_Functions.maxes_mins()
    const x = []
    let length = Weekly_Functions.maxes.length
    for(let value = 0; value < length; value++)
        x.push(value)
    const y = Weekly_Functions.maxes
    const regressions = new regression.SimpleLinearRegression(x, y);
    const xtwo = []
    let lengthtwo = Weekly_Functions.mins.length
    for(let value = 0; value < lengthtwo; value++)
        xtwo.push(value)
    const ytwo = Weekly_Functions.mins
    const regressionstwo = new regression.SimpleLinearRegression(xtwo, ytwo);
    let roneone = Object.values(regressions.score(x,y))[0]
    let ronetwo = Object.values(regressions.score(x,y))[1]
    let rtwoone = Object.values(regressionstwo.score(xtwo,ytwo))[0]
    let rtwotwo = Object.values(regressionstwo.score(xtwo,ytwo))[1]
    return [ronetwo, rtwotwo]
}

/* Add Key Part That the Levels Must Repeat 3x */
/* Key part added, test for results*/
/** finds support and resistance levels, very important for code function, would love to improve this */
static supreslevs(){
    let history = Weekly_Functions.priceHist
    let ceiling = Math.max(...history)
    let floor = Math.min(...history)
    let difference = ceiling-floor
    let levels = []
    let levelss = []
    let levelsss = []
    let finalLevs = []
    let count = 0
    for(let item = 0; item < history.length; item++)
        levels.push((history[item]-floor)/(difference))
    for(let item = 0; item < levels.length; item++)
        levels[item] = levels[item].toFixed(3)
    for(let item = 0; item < levels.length; item++){
        for(let items = 0; items < levels.length; items++){
            if(levels[item] == levels[items]){
                count++}
            }
        if(count > 3){
            levelss.push(levels[item])}
        count = 0}
    levelsss = [...new Set(levelss)];
    finalLevs = levelsss
    let price = Weekly_Functions.getPrice()
    let larger = []
    let smaller = []
    let largertwo = []
    let smallertwo = []
    let smaller_diff = []
    let larger_diff = []
    for(let item = 0; item < finalLevs.length; item++) {
        if (price > ((finalLevs[item]*difference)+floor))
            smaller.push(((finalLevs[item]*difference)+floor))
        if (price < ((finalLevs[item]*difference)+floor))
            larger.push(((finalLevs[item]*difference)+floor))}
    for(let item = 0; item < smaller.length; item++){
        if (Math.abs(Weekly_Functions.valdiff(price, smaller[item])) > .05){
            smallertwo.push(smaller[item])}}
    for(let item = 0; item < larger.length; item++){
        if (Math.abs(Weekly_Functions.valdiff(price, larger[item])) > .05){
            largertwo.push(larger[item])}}
    if (smallertwo.length < 1){
        smallertwo.push(price-Weekly_Functions.pipreverse(price, Weekly_Functions.pipdiffy(price, Weekly_Functions.stoploss())))}
    if (largertwo.length < 1){
        largertwo.push(price+Weekly_Functions.pipreverse(price, Weekly_Functions.pipdiffy(price, Weekly_Functions.stoploss())))}
    for(let item = 0; item < smallertwo.length; item++){
        smaller_diff.push(Math.abs((smallertwo[item]-price)))}
    for(let item = 0; item < largertwo.length; item++){
        larger_diff.push(Math.abs((largertwo[item]-price)))}
    let support = price-Math.min(...smaller_diff)
    let resistance = price+Math.min(...larger_diff)
    Weekly_Nexus.support = support
    Weekly_Nexus.resistance = resistance
    for(const item in finalLevs){
        finalLevs[item] = (finalLevs[item]*difference)+floor
    }
    Weekly_Nexus.finlevs = finalLevs
}
/** self explanatory, finds RSI and compares the last two */
static rsi(){
    let history = Weekly_Functions.priceHist
    let history2 = []
    for(let item = 0; item < history.length; item++)
        history2.push(history[item])
    history2.splice(-1,1)
    let q = rsis.calculate({period: 14, values: history});
    let r = rsis.calculate({period: 14, values: history2});
    let qlast = q[q.length-1]
    let rlast = r[r.length-1]
    if (qlast > rlast) 
        return true
    if (rlast > qlast)
        return false
    
}
/** self explanatory, finds MACD and compares the last two */
static macd(){
    let history = Weekly_Functions.priceHist
    let x = []
    let q = emas.calculate({period : 12, values: history});
    let r = emas.calculate({period : 26, values: history});
    let s = macds.calculate({values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false})
    for(let i = 0; i < r.length; i++)
        x.push(q[i+14]-r[i])
    let qlast = s[s.length-1]['histogram']
    let rlast = s[s.length-2]['histogram']
    if (qlast > rlast)
        return true
    if (rlast > qlast)
        return false
}
/** self explanatory, finds ROC and compares the last two */
static roc(){
    let history = Weekly_Functions.priceHist
    let history2 = []
    for(let item = 0; item < history.length; item++)
        history2.push(history[item])
    history2.splice(-1,1)
    let q = rocs.calculate({period: 10, values: history});
    let r = rocs.calculate({period: 10, values: history2});
    let qlast = q[q.length-1]
    let rlast = r[r.length-1]
    if (qlast > rlast) 
        return true
    if (rlast > qlast)
        return false
}
/** self explanatory, finds EMA and compares the last two */
static ema(){
    let history = Weekly_Functions.priceHist
    let q = emas.calculate({period : 8, values: history});
    let r = emas.calculate({period : 14, values: history});
    let qlast = q[q.length-1]
    let rlast = r[r.length-1]
    if (qlast > rlast) 
        return true
    if (rlast > qlast)
        return false
}
/** new indicator mix that finds EMAS of RSI and compares the last two values */
static obv(){
    let history = Weekly_Functions.priceHist
    let qs = rsis.calculate({period : 14, values: history});
    let q = emas.calculate({period : 8, values: qs});
    let qlast = q[q.length-1]
    let r = emas.calculate({period : 14, values: qs});
    let rlast = r[r.length-1]
    if (qlast > rlast) 
        return true
    if (rlast > qlast)
        return false
}
/** pip counter */
static pip(num1, num2){
    if(String(num1).indexOf('.') == 2) {
        Weekly_Functions.multiplier = 1000
    }else if(String(num1).indexOf('.') == 3){
        Weekly_Functions.multiplier = 100
    }else if(String(num1).indexOf('.') == 4){
        Weekly_Functions.multiplier = 10
    }else if(String(num1).indexOf('.') == 5){
        Weekly_Functions.multiplier = 1
    }else if(String(num1).indexOf('.') == 5){
        Weekly_Functions.multiplier = .1
    }else if(String(num1).indexOf('.') == 6){
        Weekly_Functions.multiplier = .01
    }else if(String(num1).indexOf('.') == 7){
        Weekly_Functions.multiplier = .001
    }else if(String(num1).indexOf('.') == 8){
        Weekly_Functions.multiplier = .0001
    }else if(String(num1).indexOf('.') == 9){
        Weekly_Functions.multiplier = .00001
    }else if(String(num1).indexOf('.') == 10){
        Weekly_Functions.multiplier = .000001
    }else{Weekly_Functions.multiplier = 10000}
    num1 *= Weekly_Functions.multiplier
    num2 *= Weekly_Functions.multiplier
    return [num1, num2]}
/** pip converter */
static pipreverse(num, num2){
    if(String(num).indexOf('.') == 2) {
        Weekly_Functions.multiplier = .001
    }else if(String(num).indexOf('.') == 3){
        Weekly_Functions.multiplier = .01
    }else if(String(num).indexOf('.') == 4){
        Weekly_Functions.multiplier = .1
    }else if(String(num).indexOf('.') == 5){
        Weekly_Functions.multiplier = 1
    }else if(String(num).indexOf('.') == 5){
        Weekly_Functions.multiplier = 10
    }else if(String(num).indexOf('.') == 6){
        Weekly_Functions.multiplier = 100
    }else if(String(num).indexOf('.') == 7){
        Weekly_Functions.multiplier = 1000
    }else if(String(num).indexOf('.') == 8){
        Weekly_Functions.multiplier = 10000
    }else if(String(num).indexOf('.') == 9){
        Weekly_Functions.multiplier = 100000
    }else if(String(num).indexOf('.') == 10){
        Weekly_Functions.multiplier = 1000000
    }else{Weekly_Functions.multiplier = .0001}
    num2 *= Weekly_Functions.multiplier
    return(num2)}

static instrument_switcher(instrument){
}

/* sets value difference as a decimal-percentage of floor to ceiling*/
/** gets value difference for normalization of data points */
static valdiff(num1, num2){
    let history = Weekly_Functions.priceHist
    let floor = Math.min(...history)
    let ceil = Math.max(...history)
    let valdiffer = ceil-floor
    let diff = Math.abs(num1-num2)
    let valuediff = diff/valdiffer
    return valuediff
}
/** Pip difference calculator */
static pipdiffy(price, num1) {
    if (String(price).indexOf('.') == 2) {
        Weekly_Functions.multiplier = 1000
    } else if (String(price).indexOf('.') == 3) {
        Weekly_Functions.multiplier = 100
    } else if (String(price).indexOf('.') == 4) {
        Weekly_Functions.multiplier = 10
    } else if (String(price).indexOf('.') == 5) {
        Weekly_Functions.multiplier = 1
    } else if (String(price).indexOf('.') == 5) {
        Weekly_Functions.multiplier = .1
    } else if (String(price).indexOf('.') == 6) {
        Weekly_Functions.multiplier = .01
    } else if (String(price).indexOf('.') == 7) {
        Weekly_Functions.multiplier = .001
    } else if (String(price).indexOf('.') == 8) {
        Weekly_Functions.multiplier = .0001
    } else if (String(price).indexOf('.') == 9) {
        Weekly_Functions.multiplier = .00001
    } else if (String(price).indexOf('.') == 10) {
        Weekly_Functions.multiplier = .000001
    } else {
        Weekly_Functions.multiplier = 10000
    }
    return num1*Weekly_Functions.multiplier
}

/** finds closest support and resistance level to whatever price u put in */
static closest(num1){
    let values = Weekly_Nexus.finlevs.concat(Weekly_Nexus.biggersupres)
    let valdiffgreater = []
    let valdiffless = []
    for(let item = 0; item < values.length; item++){
        if (num1 < values[item]) {
            valdiffgreater.push(Math.abs(num1-values[item]))}
        if (num1 > values[item]) {
            valdiffless.push(Math.abs(num1-values[item]))}}
    let closestbelow = Weekly_Functions.price-Math.min(...valdiffless)
    let closestabove = Weekly_Functions.price+Math.min(...valdiffgreater)
    let closests = [closestbelow, closestabove]
    return Math.min(...closests)
}
/** Counts pips between two values for buying */
static pipCountBuy(num1, num2){
    let nums
    nums = Weekly_Functions.pip(num1, num2)
    return(nums[1] - nums[0])}
    
/** Counts pips between two values for selling */
static pipCountSell(num1, num2){
    let nums
    nums = Weekly_Functions.pip(num1, num2)
    return(nums[0] - nums[1])}

}

class Daily_Functions{
    
    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []
    
    static HistoryAssigner(){
        let instrument = Weekly_Functions.instrument_name()
        Daily_Functions.priceHist = dataset["Daily"]['c']
        Daily_Functions.highs = dataset["Daily"]['h']
        Daily_Functions.lows = dataset["Daily"]['l']
        
        }
    
    static trend(){
        let history = Daily_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }
    
    static rsi(){
        let history = Daily_Functions.priceHist
        let history2 = []
        for(let item = 0; item < history.length; item++)
            history2.push(history[item])
        history2.splice(-1,1)
        let q = rsis.calculate({period: 14, values: history});
        let r = rsis.calculate({period: 14, values: history2});
        let qlast = q[q.length-1]
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
        
    }
    
    static macd(){
        let history = Daily_Functions.priceHist
        let x = []
        let q = emas.calculate({period : 12, values: history});
        let r = emas.calculate({period : 26, values: history});
        let s = macds.calculate({values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false})
        for(let i = 0; i < r.length; i++)
            x.push(q[i+14]-r[i])
        let qlast = s[s.length-1]['histogram']
        let rlast = s[s.length-2]['histogram']
        if (qlast > rlast)
            return true
        if (rlast > qlast)
            return false
    }
    
    static ema(){
        let history = Daily_Functions.priceHist
        let q = emas.calculate({period : 8, values: history});
        let r = emas.calculate({period : 14, values: history});
        let qlast = q[q.length-1]
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
    }
    
    static obv(){
        let history = Daily_Functions.priceHist
        let qs = rsis.calculate({period : 14, values: history});
        let q = emas.calculate({period : 8, values: qs});
        let qlast = q[q.length-1]
        let r = emas.calculate({period : 14, values: qs});
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
    }
}

class One_Hour_Functions{
    
    
    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    lows = []
    highs = []
    
    static HistoryAssigner(){
        let instrument = Weekly_Functions.instrument_name()
        One_Hour_Functions.priceHist = dataset["One_Hour"]['c']
        One_Hour_Functions.highs = dataset["One_Hour"]['h']
        One_Hour_Functions.lows = dataset["One_Hour"]['l']
        }

    static consolidationtwo(){
        let history = One_Hour_Functions.priceHist
        let highs = One_Hour_Functions.highs
        let lows = One_Hour_Functions.lows
        let histmax = Math.max(...history)
        let histmin = Math.min(...history)
        let histdiff = histmax - histmin
        let q = bolls.calculate({period : 10, values: history, stdDev: 1});
        let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
        let h = []
        let i = []
        let j = []
        for(let value = 0; value < q.length; value++){
            h.push(q[value]['lower'])
            i.push(q[value]['upper'])
            j.push(q[value]['middle'])}
        let smmas = smas.calculate({period : 14, values : h})
        let smmass = smas.calculate({period : 14, values : i})
        /*keep midpoint just in case */
        let smmasss = smas.calculate({period : 14, values : j})
        let smmaslast = smmas[smmas.length-1]
        let smmasslast = smmass[smmass.length-1]
        let smadiff = smmasslast - smmaslast
        let ndiffone = n[n.length-1] - n[n.length-2]
        let ndifftwo = n[n.length-2] - n[n.length-3]
        let benchmark = .0125*histdiff
        if (smadiff > benchmark){
            return false
        }else{
            return true
        }
    }

    static trend(){
        let history = One_Hour_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }

    static rsi(){
        let history = One_Hour_Functions.priceHist
        let history2 = []
        for(let item = 0; item < history.length; item++)
            history2.push(history[item])
        history2.splice(-1,1)
        let q = rsis.calculate({period: 14, values: history});
        let r = rsis.calculate({period: 14, values: history2});
        let qlast = q[q.length-1]
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
        
    }
    
    static macd(){
        let history = One_Hour_Functions.priceHist
        let x = []
        let q = emas.calculate({period : 12, values: history});
        let r = emas.calculate({period : 26, values: history});
        let s = macds.calculate({values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false})
        for(let i = 0; i < r.length; i++)
            x.push(q[i+14]-r[i])
        let qlast = s[s.length-1]['histogram']
        let rlast = s[s.length-2]['histogram']
        if (qlast > rlast)
            return true
        if (rlast > qlast)
            return false
    }
    
    static ema(){
        let history = One_Hour_Functions.priceHist
        let q = emas.calculate({period : 8, values: history});
        let r = emas.calculate({period : 14, values: history});
        let qlast = q[q.length-1]
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
    }
    
    static obv(){
        let history = One_Hour_Functions.priceHist
        let qs = rsis.calculate({period : 14, values: history});
        let q = emas.calculate({period : 8, values: qs});
        let qlast = q[q.length-1]
        let r = emas.calculate({period : 14, values: qs});
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
    }
    
}

class Thirty_Min_Functions{
    
    
    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    lows = []
    highs = []
    
    static HistoryAssigner(){
        let instrument = Weekly_Functions.instrument_name()
        Thirty_Min_Functions.priceHist = dataset["Thirty_Min"]['c']
        Thirty_Min_Functions.highs = dataset["Thirty_Min"]['h']
        Thirty_Min_Functions.lows = dataset["Thirty_Min"]['l']
        }

    static consolidationtwo(){
        let history = Thirty_Min_Functions.priceHist
        let highs = Thirty_Min_Functions.highs
        let lows = Thirty_Min_Functions.lows
        let histmax = Math.max(...history)
        let histmin = Math.min(...history)
        let histdiff = histmax - histmin
        let q = bolls.calculate({period : 10, values: history, stdDev: 1});
        let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
        let h = []
        let i = []
        let j = []
        for(let value = 0; value < q.length; value++){
            h.push(q[value]['lower'])
            i.push(q[value]['upper'])
            j.push(q[value]['middle'])}
        let smmas = smas.calculate({period : 14, values : h})
        let smmass = smas.calculate({period : 14, values : i})
        /*keep midpoint just in case */
        let smmasss = smas.calculate({period : 14, values : j})
        let smmaslast = smmas[smmas.length-1]
        let smmasslast = smmass[smmass.length-1]
        let smadiff = smmasslast - smmaslast
        let ndiffone = n[n.length-1] - n[n.length-2]
        let ndifftwo = n[n.length-2] - n[n.length-3]
        let benchmark = .0125*histdiff
        if (smadiff > benchmark){
            return false
        }else{
            return true
        }
    }

    static trend(){
        let history = Thirty_Min_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }

    static rsi(){
        let history = Thirty_Min_Functions.priceHist
        let history2 = []
        for(let item = 0; item < history.length; item++)
            history2.push(history[item])
        history2.splice(-1,1)
        let q = rsis.calculate({period: 14, values: history});
        let r = rsis.calculate({period: 14, values: history2});
        let qlast = q[q.length-1]
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
        
    }
    
    static macd(){
        let history = Thirty_Min_Functions.priceHist
        let x = []
        let q = emas.calculate({period : 12, values: history});
        let r = emas.calculate({period : 26, values: history});
        let s = macds.calculate({values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false})
        for(let i = 0; i < r.length; i++)
            x.push(q[i+14]-r[i])
        let qlast = s[s.length-1]['histogram']
        let rlast = s[s.length-2]['histogram']
        if (qlast > rlast)
            return true
        if (rlast > qlast)
            return false
    }
    
    static ema(){
        let history = Thirty_Min_Functions.priceHist
        let q = emas.calculate({period : 8, values: history});
        let r = emas.calculate({period : 14, values: history});
        let qlast = q[q.length-1]
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
    }
    
    static obv(){
        let history = Thirty_Min_Functions.priceHist
        let qs = rsis.calculate({period : 14, values: history});
        let q = emas.calculate({period : 8, values: qs});
        let qlast = q[q.length-1]
        let r = emas.calculate({period : 14, values: qs});
        let rlast = r[r.length-1]
        if (qlast > rlast) 
            return true
        if (rlast > qlast)
            return false
    }
    
}


var dataset = {}

module.exports = { testweekly: function(data){
    dataset = data
    Weekly_Nexus.controlMain()

} }
/* Edit Trailing Stop Loss so that there is a sort of "bubble" or "cloud" that follows the price around and gives it some space to rebound up or down
depending on the type of trade, so that it doesn't result in trades that exit super early due to opposite price action */
/* Fix all issues and complete working of the project so you can sell it, get updates from Erm n Pat */
 /* Update: 6/04/22: Only thing left is to see how fibonnaci can be added to the program, as fibonacci 
                            may not be needed due to support and resistance levels already being used*/


/* Update: 6/07/22: Aside from fib, make sure to change the supreslevs filler support and resistance levels to a variable pip value of the average of 
                            the last 15 candles */
                            /* UPDATE: THIS HAS BEEN COMPLETED. */

                            
/* Bro this app is gonna take off I promise. Get that grind on bro you got this. */

/* © 2022 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
 have been included with this distribution. */