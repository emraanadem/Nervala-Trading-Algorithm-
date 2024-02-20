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

// Create a single supabase client for interacting with your database
const supabase = createClient('https://nvlbmpghemfunkpnhwee.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY')

class One_Hour_Nexus{

    pos = false
    buy_pos = false
    sell_pos = false
    wins = 0
    biggersupres = []
    pot_buy = false
    pot_sell = false
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
    tstoplossvoid = false
    pips = 0
    piplog = [0]
    finlevs = []
    tptwo = 0
    pchan = false
    pzone = false
    bigsupport = 0
    bigresistance = 0
    pair = ''
    
    /** announce price zones and price channels */
    static announcer(){
        if (One_Hour_Nexus.pzone == false && One_Hour_Functions.priceZones() == true){
            One_Hour_Nexus.pzone = true
            console.log("Price Zone Identified")
        }if (One_Hour_Nexus.pzone == true && One_Hour_Functions.priceZones() == false){
            One_Hour_Nexus.pzone = false
        }if (One_Hour_Nexus.pchan == false && One_Hour_Functions.priceChannels() == true){
            One_Hour_Nexus.pchan = true
            console.log("Price Channel Identified")
        }if (One_Hour_Nexus.pchan == true && One_Hour_Functions.priceChannels() == false){
            One_Hour_Nexus.pchan = false}
    }
    /** stop loss for buys */
    static stopLossBuy(){
        if (One_Hour_Functions.price <= One_Hour_Nexus.sl){
            One_Hour_Nexus.closePosSL()}}
    /** stop loss for selling */
    static stopLossSell(){
        if (One_Hour_Functions.price >= One_Hour_Nexus.sl){
            One_Hour_Nexus.closePosSL()}}

    /**initiates the piplog for pipcounting */
    static piploginit(){
        One_Hour_Nexus.piplog = [0, 0, 0]
    }
    /**pip logging method */
    static piplogger(){
        let piplogging = One_Hour_Nexus.piplog
        if (One_Hour_Nexus.buy_pos){
            piplogging.push(One_Hour_Functions.pipCountBuy(One_Hour_Nexus.posprice, One_Hour_Functions.price))
            One_Hour_Nexus.bigpipprice = Math.max(...piplogging)
            One_Hour_Nexus.piplog = piplogging}
        if (One_Hour_Nexus.sell_pos){
            piplogging.push(One_Hour_Functions.pipCountSell(One_Hour_Nexus.posprice, One_Hour_Functions.price))
            One_Hour_Nexus.bigpipprice = Math.max(...piplogging)
            One_Hour_Nexus.piplog = piplogging}
    }
    /**take profit for buying */
    static takeProfitBuy(){
        if (One_Hour_Functions.price >= One_Hour_Nexus.tp){
            if(One_Hour_Functions.volatility() > .618){
                if((One_Hour_Functions.price - One_Hour_Nexus.tp) > (One_Hour_Nexus.tp - One_Hour_Nexus.tstoploss)){
                        if(One_Hour_Nexus.tp < One_Hour_Nexus.tptwo){
                            One_Hour_Nexus.piploginit()
                            One_Hour_Nexus.posprice = One_Hour_Nexus.tp
                            One_Hour_Nexus.tp = One_Hour_Nexus.tptwo
                            One_Hour_Functions.tpvariation()
                            console.log('pair: ' + One_Hour_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(One_Hour_Nexus.tp))
                            console.log("New Take Profit 2: " + String(One_Hour_Nexus.tptwo))
                            }}}
            else{
            One_Hour_Nexus.closePosTP()}}
        else if (One_Hour_Functions.price <= One_Hour_Nexus.tstoploss){
            One_Hour_Nexus.closePosTP()}
        else if (One_Hour_Functions.price == One_Hour_Nexus.tptwo){
            One_Hour_Nexus.closePosTP()}
    }
    /** take profit for selling */
    static takeProfitSell(){
        if (One_Hour_Functions.price <= One_Hour_Nexus.tp){
            if(One_Hour_Functions.volatility() > .618){
                if((One_Hour_Nexus.tp - One_Hour_Functions.price) > (One_Hour_Nexus.tstoploss - One_Hour_Nexus.tp)){
                        if(One_Hour_Nexus.tp < One_Hour_Nexus.tptwo){
                            One_Hour_Nexus.piploginit()
                            One_Hour_Nexus.posprice = One_Hour_Nexus.tp
                            One_Hour_Nexus.tp = One_Hour_Nexus.tptwo
                            One_Hour_Functions.tpvariation()
                            console.log('pair: ' + One_Hour_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(One_Hour_Nexus.tp))
                            console.log("New Take Profit 2: " + String(One_Hour_Nexus.tptwo))
                            }}}
            else{
            One_Hour_Nexus.closePosTP()}}
        else if (One_Hour_Functions.price >= One_Hour_Nexus.tstoploss){
            One_Hour_Nexus.closePosTP()}
        else if (One_Hour_Functions.price == One_Hour_Nexus.tptwo){
            One_Hour_Nexus.closePosTP()}}
    /** stop loss defining method */
    static stoplossdef(){
        let stoploss = One_Hour_Functions.stoploss()
        if(One_Hour_Nexus.buy_pos){
            One_Hour_Nexus.sl = One_Hour_Functions.price - stoploss}
        if(One_Hour_Nexus.sell_pos){
            One_Hour_Nexus.sl = One_Hour_Functions.price + stoploss}}
    /** define volatility for the system, tells me whether or not to alter trailing stop loss*/
    static volatilitydef(){
        if(One_Hour_Functions.volatility() > .618 && One_Hour_Nexus.tstoplossinits && !One_Hour_Nexus.tstoplossvoid){
            One_Hour_Nexus.tstoplossdefvol()}
    }
    /** initiate trailing stop loss */
    static tstoplossinit(){
        let stoploss = One_Hour_Nexus.sldiff
        if(!One_Hour_Nexus.tstop && !One_Hour_Nexus.tstoplossinits && !One_Hour_Nexus.tstoplossvoid){
            if(One_Hour_Nexus.buy_pos){
                if(One_Hour_Functions.price > One_Hour_Nexus.posprice + .3*stoploss){
                    One_Hour_Nexus.tstoplossinits = true
                    One_Hour_Nexus.tstoplossdef()}}
            if(One_Hour_Nexus.sell_pos){
                if(One_Hour_Functions.price < One_Hour_Nexus.posprice - .3*stoploss){
                    One_Hour_Nexus.tstoplossinits = true
                    One_Hour_Nexus.tstoplossdef()}}}
    }
    /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a 
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
    static tstoplossdefvol(){
        One_Hour_Nexus.sldiff = One_Hour_Functions.stoploss()
        let stoploss = One_Hour_Nexus.sldiff
        if(One_Hour_Nexus.buy_pos){
            if(One_Hour_Functions.price > One_Hour_Nexus.posprice + .3*stoploss){
                One_Hour_Nexus.tstop = true
                One_Hour_Nexus.tstoploss = One_Hour_Nexus.posprice + (((Math.abs(One_Hour_Functions.price-One_Hour_Nexus.posprice))*(One_Hour_Functions.trailingsl())))
            }}
        if(One_Hour_Nexus.sell_pos){
            if(One_Hour_Functions.price < One_Hour_Nexus.posprice - .3*stoploss){
                One_Hour_Nexus.tstop = true
                One_Hour_Nexus.tstoploss = One_Hour_Nexus.posprice - (((Math.abs(One_Hour_Functions.price-One_Hour_Nexus.posprice))*(One_Hour_Functions.trailingsl())))
            }}
    }
    /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility*/
    static tstoplosscheck(){
        let tstoploss = One_Hour_Nexus.sldiff
        if(One_Hour_Nexus.buy_pos){
            if(One_Hour_Functions.price < One_Hour_Nexus.posprice + .3*tstoploss){
                One_Hour_Nexus.tstoplossvoid = true
            }
            else{
                One_Hour_Nexus.tstoplossvoid = false
                One_Hour_Nexus.volatilitydef()
                One_Hour_Nexus.tstoplossinit()
            }}
        if(One_Hour_Nexus.sell_pos){
            if(One_Hour_Functions.price > One_Hour_Nexus.posprice - .3*tstoploss){
                One_Hour_Nexus.tstoplossvoid = true
            }
            else{
                One_Hour_Nexus.tstoplossvoid = false
                One_Hour_Nexus.volatilitydef()
                One_Hour_Nexus.tstoplossinit()}}
    }
    /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
    static tstoplosscont(){
        if(One_Hour_Functions.volatility() < .618 && One_Hour_Nexus.tstoplossinits && !One_Hour_Nexus.tstoplossvoid){
            One_Hour_Nexus.sldiff = One_Hour_Functions.stoploss()
            let stoploss = One_Hour_Nexus.sldiff
            if(One_Hour_Nexus.buy_pos){
                if(One_Hour_Functions.price > One_Hour_Nexus.posprice + .3*stoploss){
                    One_Hour_Nexus.tstoploss = One_Hour_Nexus.posprice + One_Hour_Functions.pipreverse(One_Hour_Nexus.posprice, .618*One_Hour_Nexus.bigpipprice)
            }}
            if(One_Hour_Nexus.sell_pos){
                if(One_Hour_Functions.price < One_Hour_Nexus.posprice - .3*stoploss){
                    One_Hour_Nexus.tstoploss = One_Hour_Nexus.posprice - One_Hour_Functions.pipreverse(One_Hour_Nexus.posprice, .618*One_Hour_Nexus.bigpipprice)
            }}}
    }
    /** method that defines trailing stop loss for the system to begin with trailing stop loss */
    static tstoplossdef(){
        One_Hour_Nexus.sldiff = One_Hour_Functions.stoploss()
        let stoploss = One_Hour_Nexus.sldiff
        if(One_Hour_Nexus.buy_pos){
            if(One_Hour_Functions.price > One_Hour_Nexus.posprice + .3*stoploss){
                One_Hour_Nexus.tstop = true
                One_Hour_Nexus.tstoploss = One_Hour_Nexus.posprice + One_Hour_Functions.pipreverse(One_Hour_Nexus.posprice, .618*One_Hour_Nexus.bigpipprice)
            }}
        if(One_Hour_Nexus.sell_pos){
            if(One_Hour_Functions.price < One_Hour_Nexus.posprice - .3*stoploss){
                One_Hour_Nexus.tstop = true
                One_Hour_Nexus.tstoploss = One_Hour_Nexus.posprice - One_Hour_Functions.pipreverse(One_Hour_Nexus.posprice, .618*One_Hour_Nexus.bigpipprice)
        }}}

    /*FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS!*/
    
    /** initiates a buy signal */
    static buy(){
        One_Hour_Functions.supreslevs()
        One_Hour_Functions.getPrice()
        One_Hour_Nexus.stoploss()
        One_Hour_Nexus.tpvariation()
        if(!One_Hour_Functions.rejectionzoning()){
            if (Math.abs(One_Hour_Functions.valdiff(One_Hour_Functions.price, One_Hour_Functions.closest(One_Hour_Functions.price))) > .025) {
                One_Hour_Nexus.tp = One_Hour_Nexus.resistance
                One_Hour_Nexus.pos = true
                One_Hour_Nexus.buy_pos = true
                One_Hour_Nexus.posprice = One_Hour_Functions.price
                One_Hour_Nexus.stoploss()
                One_Hour_Nexus.tpvariation()
                console.log('pair: ' + One_Hour_Nexus.pair)
                console.log("Open Buy Order on One Hour")
                console.log("Entry Price: " + String(One_Hour_Nexus.posprice))
                console.log("Stop Loss: " + String(One_Hour_Nexus.sl))
                console.log("Target Take Profit: " + String(One_Hour_Nexus.tp))
                console.log("Take Profit 2: " + String(One_Hour_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static buy(){
        One_Hour_Functions.supreslevs()
        One_Hour_Functions.getPrice()
        One_Hour_Nexus.tp = One_Hour_Nexus.resistance
        One_Hour_Nexus.pos = true
        One_Hour_Nexus.buy_pos = true
        One_Hour_Nexus.posprice = One_Hour_Functions.price
                One_Hour_Nexus.stoplossdef()
        console.log("Open Buy Order")
        console.log(One_Hour_Nexus.sl + " : Stop Loss")
        console.log(One_Hour_Nexus.tp + " : Target Take Profit")
        } */

    /** initiates a sell order */
    static sell(){
        One_Hour_Functions.supreslevs()
        One_Hour_Functions.getPrice()
        One_Hour_Functions.stoploss()
        One_Hour_Functions.tpvariation()
        if(!One_Hour_Functions.rejectionzoning()){
            if (Math.abs(One_Hour_Functions.valdiff(One_Hour_Functions.price, One_Hour_Functions.closest(One_Hour_Functions.price))) > .025) {
                One_Hour_Nexus.tp = One_Hour_Nexus.support
                One_Hour_Nexus.pos = true
                One_Hour_Nexus.sell_pos = true
                One_Hour_Nexus.posprice = One_Hour_Functions.price
                One_Hour_Nexus.stoploss()
                One_Hour_Nexus.tpvariation()
                console.log('pair: ' + One_Hour_Nexus.pair)
                console.log("Open Sell Order on One Hour")
                console.log("Entry Price: " + String(One_Hour_Nexus.posprice))
                console.log("Stop Loss: " + String(One_Hour_Nexus.sl))
                console.log("Target Take Profit: " + String(One_Hour_Nexus.tp))
                console.log("Take Profit 2: " + String(One_Hour_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static sell(){
        One_Hour_Functions.supreslevs()
        One_Hour_Functions.getPrice()
        One_Hour_Nexus.tp = One_Hour_Nexus.support
        One_Hour_Nexus.pos = true
        One_Hour_Nexus.sell_pos = true
        One_Hour_Nexus.posprice = One_Hour_Functions.price
                One_Hour_Nexus.stoplossdef()
        console.log("Open Sell Order")
        console.log(One_Hour_Nexus.sl + " : Stop Loss")
        console.log(One_Hour_Nexus.tp + " : Target Take Profit")
        }*/

    /** checks for price movement in lower periods to get better idea of the trend */
    static controlSmallerPeriod(){
        /*Confirm Trend w/ indicators and price movement*/
        Thirty_Min_Functions.HistoryAssigner()
        Fifteen_Min_Functions.HistoryAssigner()
        Daily_Functions.HistoryAssigner()
        Five_Min_Functions.HistoryAssigner()
        One_Hour_Functions.stoploss()
        One_Hour_Functions.tpvariation()
        let buy = false
        let sell = false
        if(!Four_Hour_Functions.rejectionzoning() 
            && !Fifteen_Min_Functions.consolidationtwo() && !Five_Min_Functions.consolidationtwo()){
                if(Daily_Functions.trend() && Thirty_Min_Functions.ema()){
                    if(Fifteen_Min_Functions.trend() && Thirty_Min_Functions.macd() && Thirty_Min_Functions.obv()){
                        if(Fifteen_Min_Functions.ema()){
                            if(Fifteen_Min_Functions.rsi() && Fifteen_Min_Functions.obv()){
                                buy = true}}}}
                if(!Daily_Functions.trend() && !Thirty_Min_Functions.ema()){
                    if(!Fifteen_Min_Functions.trend() && !Thirty_Min_Functions.macd() && !Thirty_Min_Functions.obv()){
                        if(!Fifteen_Min_Functions.ema()){
                            if(!Fifteen_Min_Functions.rsi() && !Fifteen_Min_Functions.obv()){
                                sell = true}}}}}
        return [buy, sell]
    }
    /** checks for support and resistance levels in larger time periods to get a better idea of possible consolidation/reversal points */
    static controlBiggerPeriod(){
        /*Price Zones*/
        Daily_Functions.ValueAssigner()
        Four_Hour_Functions.ValueAssigner()
        Daily_Functions.HistoryAssigner()
        Four_Hour_Functions.HistoryAssigner()
        Daily_Functions.priceZones()
        Four_Hour_Functions.priceZones()
        let h = [0]
        h = Daily_Functions.finlevs
        let i = Four_Hour_Functions.finlevs
        let totallevs = h.push(i)
        One_Hour_Nexus.biggersupres = totallevs
        One_Hour_Nexus.finlevs.concat(totallevs)
    }
    /** main control method, takes control of the entire program and serves as the brain */
    static controlMain(){
        One_Hour_Functions.rejecinit()
        Four_Hour_Functions.rejecinit()
        One_Hour_Functions.HistoryAssigner()
        One_Hour_Functions.ValueAssigner()
        One_Hour_Functions.getPrice()
        One_Hour_Functions.supreslevs()
        One_Hour_Nexus.controlBiggerPeriod()
        if (!One_Hour_Functions.consolidationtwo() && One_Hour_Functions.overall() && !One_Hour_Functions.consolidation() 
            && !One_Hour_Functions.keylev()){
                if (One_Hour_Functions.ema()){
                    if (One_Hour_Nexus.controlSmallerPeriod()[0] == true){
                        if (One_Hour_Functions.trend() && One_Hour_Functions.rsi() 
                            && One_Hour_Functions.macd() && One_Hour_Functions.roc() && One_Hour_Functions.obv()) {
                                if (!One_Hour_Nexus.pos){
                                    if (!One_Hour_Nexus.buy_pos)
                                        One_Hour_Nexus.pot_buy = true
                                        One_Hour_Nexus.piploginit()
                                        One_Hour_Nexus.buy()}}}}
                if (!One_Hour_Functions.ema()){
                    if (One_Hour_Nexus.controlSmallerPeriod()[1] == true){
                        if (!One_Hour_Functions.trend() && !One_Hour_Functions.rsi() 
                            && !One_Hour_Functions.macd() && !One_Hour_Functions.roc() && !One_Hour_Functions.obv()) {
                                if (!One_Hour_Nexus.pos){
                                    if (!One_Hour_Nexus.sell_pos)
                                        One_Hour_Nexus.pot_sell = true
                                        One_Hour_Nexus.piploginit()
                                        One_Hour_Nexus.sell()}}}}}
        if (One_Hour_Nexus.pos && One_Hour_Nexus.buy_pos){
            One_Hour_Nexus.piplogger()
            One_Hour_Nexus.stopLossBuy()
            One_Hour_Nexus.tstoplosscheck()
            One_Hour_Nexus.tstoplosscont()
            One_Hour_Nexus.takeProfitBuy()}
        if (One_Hour_Nexus.pos && One_Hour_Nexus.sell_pos){
            One_Hour_Nexus.piplogger()
            One_Hour_Nexus.stopLossSell()
            One_Hour_Nexus.tstoplosscheck()
            One_Hour_Nexus.tstoplosscont()
            One_Hour_Nexus.takeProfitSell()}
        One_Hour_Functions.rejecsave()
        Four_Hour_Functions.rejecsave()
        /*figure out how to clear memory, and do so here after every iteration*/
        /*memory issue solved: 4/20/22 */}

    /** close position method for taking profit, and gives pip count and win/loss ratio */
    static closePosTP(){
        if (One_Hour_Nexus.pos){
            if (One_Hour_Nexus.buy_pos){
                One_Hour_Nexus.buy_pos = false
                One_Hour_Nexus.pos = false
                One_Hour_Nexus.pot_buy = false
                One_Hour_Nexus.tstop = false
                One_Hour_Nexus.tstoplossinits = false
                One_Hour_Nexus.tstoplossvoid = false
                One_Hour_Nexus.pchan = false
                One_Hour_Nexus.pzone = false
                One_Hour_Nexus.wins += 1
                One_Hour_Nexus.trades += 1
                One_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = One_Hour_Functions.pipCountBuy(One_Hour_Nexus.posprice, One_Hour_Functions.price)
                One_Hour_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + One_Hour_Nexus.pair)
                console.log("Take Profit Hit on One Hour")
                console.log(One_Hour_Nexus.wins + " Wins and     " + One_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + One_Hour_Nexus.wins/One_Hour_Nexus.trades)
                console.log("Pip Count: " + One_Hour_Nexus.pips)}
            if (One_Hour_Nexus.sell_pos){
                One_Hour_Nexus.sell_pos = false
                One_Hour_Nexus.pos = false
                One_Hour_Nexus.tstop = false
                One_Hour_Nexus.pot_sell = false
                One_Hour_Nexus.tstoplossinits = false
                One_Hour_Nexus.tstoplossvoid = false
                One_Hour_Nexus.pchan = false
                One_Hour_Nexus.pzone = false
                One_Hour_Nexus.wins += 1
                One_Hour_Nexus.trades += 1
                One_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = One_Hour_Functions.pipCountSell(One_Hour_Nexus.posprice, One_Hour_Functions.price)
                One_Hour_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + One_Hour_Nexus.pair)
                console.log("Take Profit Hit on One Hour")
                console.log(One_Hour_Nexus.wins + " Wins and     " + One_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + One_Hour_Nexus.wins/One_Hour_Nexus.trades)
                console.log("Pip Count: " + One_Hour_Nexus.pips)}}}

    /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
    static closePosSL(){
        if (One_Hour_Nexus.pos){
            if (One_Hour_Nexus.sell_pos){
                One_Hour_Nexus.sell_pos = false
                One_Hour_Nexus.pos = false
                One_Hour_Nexus.pot_sell = false
                One_Hour_Nexus.tstop = false
                One_Hour_Nexus.tstoplossinits = false
                One_Hour_Nexus.tstoplossvoid = false
                One_Hour_Nexus.pchan = false
                One_Hour_Nexus.pzone = false
                One_Hour_Nexus.losses += 1
                One_Hour_Nexus.trades += 1
                One_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = One_Hour_Functions.pipCountSell(One_Hour_Nexus.posprice, One_Hour_Functions.price)
                One_Hour_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + One_Hour_Nexus.pair)
                console.log("Stop Loss Hit on One Hour")
                console.log(One_Hour_Nexus.wins + " Wins and     " + One_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + One_Hour_Nexus.wins/One_Hour_Nexus.trades)
                console.log("Pip Count" + One_Hour_Nexus.pips)}
            if (One_Hour_Nexus.buy_pos){
                One_Hour_Nexus.buy_pos = false
                One_Hour_Nexus.pos = false
                One_Hour_Nexus.tstop = false
                One_Hour_Nexus.pot_buy = false
                One_Hour_Nexus.tstoplossinits = false
                One_Hour_Nexus.tstoplossvoid = false
                One_Hour_Nexus.pchan = false
                One_Hour_Nexus.pzone = false
                One_Hour_Nexus.losses += 1
                One_Hour_Nexus.trades += 1
                One_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = One_Hour_Functions.pipCountBuy(One_Hour_Nexus.posprice, One_Hour_Functions.price)
                One_Hour_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + One_Hour_Nexus.pair)
                console.log("Stop Loss Hit on One Hour")
                console.log(One_Hour_Nexus.wins + " Wins and     " + One_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + One_Hour_Nexus.wins/One_Hour_Nexus.trades)
                console.log("Pip Count" + One_Hour_Nexus.pips)}}}
}

class Four_Hour_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    timeperiods = {}
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        One_Hour_Nexus.pair = dataspecific   
        return dataspecific
    }
/** load historical prices from json file */
    static async HistoryAssigner(){
        let instrument = Four_Hour_Functions.instrument_name()
        try{
        var { data, error } = await supabase
            .from('Four_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        Four_Hour_Functions.priceHist = data[0]['Data']
        console.log(Four_Hour_Functions.priceHist)
        var { data, error} = await supabase
            .from('Four_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        Four_Hour_Functions.highs = data[0]['Data']
        var { data, error} = await supabase
            .from('Four_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        Four_Hour_Functions.lows = data[0]['Data']
        var { data, error} = await supabase
            .from('Four_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        Four_Hour_Functions.extendHist = data[0]['Data']
        var { data, error} = await supabase
            .from('Four_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        Four_Hour_Functions.extendHigh = data[0]['Data']
        var { data, error} = await supabase
            .from('Four_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        Four_Hour_Functions.extendLow = data[0]['Data']}
        catch (error) {
            console.log(error)
        }
        let lens = []
        lens.push(Four_Hour_Functions.priceHist.length)
        lens.push(Four_Hour_Functions.highs.length)
        lens.push(Four_Hour_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Four_Hour_Functions.priceHist, Four_Hour_Functions.highs, Four_Hour_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Four_Hour_Functions.priceHist){
                    for(let item = 0; item < (Four_Hour_Functions.priceHist.length - minlens); item++){
                        Four_Hour_Functions.priceHist.splice(0,1)
                    }
                if (items == Four_Hour_Functions.lows){
                    for(let item = 0; item < (Four_Hour_Functions.lows.length - minlens); item++){
                        Four_Hour_Functions.lows.splice(0,1)
                    }
                if (items == Four_Hour_Functions.highs){
                    for(let item = 0; item < (Four_Hour_Functions.highs.length - minlens); item++){
                        Four_Hour_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(Four_Hour_Functions.extendHist.length)
        lens.push(Four_Hour_Functions.extendHigh.length)
        lens.push(Four_Hour_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [Four_Hour_Functions.extendHist, Four_Hour_Functions.extendHigh, Four_Hour_Functions.extendLow]
        for (items in lists){
            if (items.length > minlens){
                if (items == Four_Hour_Functions.extendHist){
                    for(let item = 0; item < (Four_Hour_Functions.extendHist.length - minlens); item++){
                        Four_Hour_Functions.extendHist.splice(0,1)
                    }
                if (items == Four_Hour_Functions.extendLow){
                    for(let item = 0; item < (Four_Hour_Functions.extendLow.length - minlens); item++){
                        Four_Hour_Functions.extendLow.splice(0,1)
                    }
                if (items == Four_Hour_Functions.extendHigh){
                    for(let item = 0; item < (Four_Hour_Functions.extendHigh.length - minlens); item++){
                        Four_Hour_Functions.extendHigh.splice(0,1)
                    }}}}}}
    
        }}

class Daily_Functions{

    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    resistance = 0
    support = 0
    finlevs = []
    highs = []
    lows = []

    static async HistoryAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        try{
        var { data, error } = await supabase
            .from('Daily')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        Daily_Functions.priceHist = data[0]['Data']
        console.log(Daily_Functions.priceHist)
        var { data, error} = await supabase
            .from('Daily')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        Daily_Functions.highs = data[0]['Data']
        var { data, error} = await supabase
            .from('Daily')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        Daily_Functions.lows = data[0]['Data']}
        catch (error) {
            console.log(error)
        }
        let lens = []
        lens.push(Daily_Functions.priceHist.length)
        lens.push(Daily_Functions.highs.length)
        lens.push(Daily_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Daily_Functions.priceHist, Daily_Functions.highs, Daily_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Daily_Functions.priceHist){
                    for(let item = 0; item < (Daily_Functions.priceHist.length - minlens); item++){
                        Daily_Functions.priceHist.splice(0,1)
                    }
                if (items == Daily_Functions.lows){
                    for(let item = 0; item < (Daily_Functions.lows.length - minlens); item++){
                        Daily_Functions.lows.splice(0,1)
                    }
                if (items == Daily_Functions.highs){
                    for(let item = 0; item < (Daily_Functions.highs.length - minlens); item++){
                        Daily_Functions.highs.splice(0,1)
                    }}}}}}
        }}

class One_Hour_Functions{

    multiplier = 0
    rejectionzones = new Array();
    priceHist = []
    timeperiods = {}
    extendHist = []
    extendHigh = []
    extendLow = []
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []


/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        One_Hour_Nexus.pair = dataspecific   
        return dataspecific
    }
/** load historical prices from json file */
    static async HistoryAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        try{
        var { data, error } = await supabase
            .from('One_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        One_Hour_Functions.priceHist = data[0]['Data']
        console.log(One_Hour_Functions.priceHist)
        var { data, error} = await supabase
            .from('One_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        One_Hour_Functions.highs = data[0]['Data']
        var { data, error} = await supabase
            .from('One_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        One_Hour_Functions.lows = data[0]['Data']
        var { data, error} = await supabase
            .from('One_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        One_Hour_Functions.extendHist = data[0]['Data']
        var { data, error} = await supabase
            .from('One_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        One_Hour_Functions.extendHigh = data[0]['Data']
        var { data, error} = await supabase
            .from('One_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        One_Hour_Functions.extendLow = data[0]['Data']}
        catch (error) {
            console.log(error)
        }
        let lens = []
        lens.push(One_Hour_Functions.priceHist.length)
        lens.push(One_Hour_Functions.highs.length)
        lens.push(One_Hour_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [One_Hour_Functions.priceHist, One_Hour_Functions.highs, One_Hour_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == One_Hour_Functions.priceHist){
                    for(let item = 0; item < (One_Hour_Functions.priceHist.length - minlens); item++){
                        One_Hour_Functions.priceHist.splice(0,1)
                    }
                if (items == One_Hour_Functions.lows){
                    for(let item = 0; item < (One_Hour_Functions.lows.length - minlens); item++){
                        One_Hour_Functions.lows.splice(0,1)
                    }
                if (items == One_Hour_Functions.highs){
                    for(let item = 0; item < (One_Hour_Functions.highs.length - minlens); item++){
                        One_Hour_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(One_Hour_Functions.extendHist.length)
        lens.push(One_Hour_Functions.extendHigh.length)
        lens.push(One_Hour_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [One_Hour_Functions.extendHist, One_Hour_Functions.extendHigh, One_Hour_Functions.extendLow]
        for (items in lists){
            if (items.length > minlens){
                if (items == One_Hour_Functions.extendHist){
                    for(let item = 0; item < (One_Hour_Functions.extendHist.length - minlens); item++){
                        One_Hour_Functions.extendHist.splice(0,1)
                    }
                if (items == One_Hour_Functions.extendLow){
                    for(let item = 0; item < (One_Hour_Functions.extendLow.length - minlens); item++){
                        One_Hour_Functions.extendLow.splice(0,1)
                    }
                if (items == One_Hour_Functions.extendHigh){
                    for(let item = 0; item < (One_Hour_Functions.extendHigh.length - minlens); item++){
                        One_Hour_Functions.extendHigh.splice(0,1)
                    }}}}}}
        }}

One_Hour_Functions.HistoryAssigner()
Daily_Functions.HistoryAssigner()
Four_Hour_Functions.HistoryAssigner()
