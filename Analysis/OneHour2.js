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
        try{
        Thirty_Min_Functions.HistoryAssigner()
        Fifteen_Min_Functions.HistoryAssigner()
        Daily_Functions.HistoryAssigner()
        Five_Min_Functions.HistoryAssigner()}
        catch (error) {
            console.log(error)
        }
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
        try{
        Daily_Functions.ValueAssigner()
        Four_Hour_Functions.ValueAssigner()
        Daily_Functions.HistoryAssigner()
        Four_Hour_Functions.HistoryAssigner()
        Daily_Functions.priceZones()
        Four_Hour_Functions.priceZones()
        }
        catch (error) {
            console.log(error)
        }
        let h = [0]
        h = Daily_Functions.finlevs
        let i = Four_Hour_Functions.finlevs
        let totallevs = h.push(i)
        One_Hour_Nexus.biggersupres = totallevs
        One_Hour_Nexus.finlevs.concat(totallevs)
    }
    /** main control method, takes control of the entire program and serves as the brain */
    static controlMain(){
        try{
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
        Four_Hour_Functions.rejecsave()}
        catch (error) {
            console.log(error)
        }
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
    static HistoryAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        One_Hour_Functions.priceHist = dataset["One_Hour"]['c']
        One_Hour_Functions.highs = dataset["One_Hour"]['h']
        One_Hour_Functions.lows = dataset["One_Hour"]['l']
        One_Hour_Functions.extendHist = dataset["One_Hour Extend"]['c']
        One_Hour_Functions.extendHigh = dataset["One_Hour Extend"]['h']
        One_Hour_Functions.extendLow = dataset["One_Hour Extend"]['l']
        }
/** load price from json file */
    static ValueAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            One_Hour_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
/** second consolidation method, meant to strengthen consolidation identification */
    static consolidationtwo(){
        let history = One_Hour_Functions.priceHist
        let highs = One_Hour_Functions.highs
        let lows = One_Hour_Functions.lows
        let histmax = Math.max(...history)
        let histmin = Math.min(...history)
        let histdiff = histmax - histmin
        let q = bolls.calculate({period : 10, values: history, stdDev: 1});
        let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
        let h = new Array();
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
        let tp = One_Hour_Nexus.tp
        let values = One_Hour_Nexus.finlevs.concat(One_Hour_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        let closesttp = 0
        let filteredvaldiff = []
        let nexttp = 0
        let referenceval = 0
        let num1 = One_Hour_Nexus.price
        let volval = One_Hour_Functions.volatility()
        if(One_Hour_Nexus.buy_pos){
            for(let item = 0; item < values.length; item++){
                if (num1 < values[item]) {
                    valdiffgreater.push(Math.abs(num1-values[item]))}}
            closesttp = One_Hour_Nexus.tp
            filteredvaldiff = [...new Set(valdiffgreater)]
            for(const valuers in filteredvaldiff){
                referenceval = closesttp - num1
                if ((referenceval >= valuers)){
                    filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                }
            }
            if(volval > .618){
                One_Hour_Nexus.tp = One_Hour_Functions.price+(Math.abs(One_Hour_Functions.price-One_Hour_Nexus.tp)*1.382)
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == One_Hour_Functions.price)){
                        nexttp = One_Hour_Functions.price+(Math.abs(One_Hour_Functions.price-Math.min(...filteredvaldiff))*1.382)
                }else{
                    nexttp = One_Hour_Functions.price + ((One_Hour_Nexus.tp-One_Hour_Functions.price)*1.618)

                }
            }else{
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == One_Hour_Functions.price)){
                    nexttp = One_Hour_Functions.price+Math.min(...filteredvaldiff)
                }else{
                    nexttp = One_Hour_Functions.price + ((One_Hour_Functions.tp - One_Hour_Functions.price)*1.382)
                }}}
        if(One_Hour_Nexus.sell_pos){
            for(let item = 0; item < values.length; item++){
                if (num1 > values[item]) {
                    valdiffless.push(Math.abs(num1-values[item]))}}
            closesttp = One_Hour_Nexus.tp
            filteredvaldiff = [...new Set(valdiffless)]
            for(const valuers in filteredvaldiff){
                referenceval = num1 - closesttp
                if ((referenceval >= valuers)){
                    filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                    
                }
            }
            if(volval > .618){
                One_Hour_Nexus.tp = One_Hour_Functions.price-(Math.abs(One_Hour_Functions.price-One_Hour_Nexus.tp)*1.382)
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == One_Hour_Functions.price)){
                        nexttp = One_Hour_Functions.price-(Math.abs(One_Hour_Functions.price-Math.min(...filteredvaldiff))*1.382)
                }else{
                    nexttp = One_Hour_Functions.price - ((One_Hour_Functions.price - One_Hour_Nexus.tp)*1.618)

                }
            }else{
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == One_Hour_Functions.price)){
                    nexttp = One_Hour_Functions.price+Math.min(...filteredvaldiff)
                }else{
                    nexttp = One_Hour_Functions.price - ((One_Hour_Functions.price - One_Hour_Nexus.tp)*1.382)
                }}}
        One_Hour_Nexus.tptwo = nexttp
        }


    /** Method that uses flowise to determine if the qualitative end of things agrees 
     * with the trade analysis on the quantitative side */
    static qualitative(){
        let sell = true
        let buy = true
        if (sell){
            return sell
        }
        if (buy){
            return buy
        }
        
    }

    
    /**fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
    static fib(){
        let recents = One_Hour_Functions.recentHisto
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
        let currentprice = One_Hour_Functions.price
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
        let instrument = One_Hour_Functions.instrument_name()
        if(!fs.existsSync('./Rejection_Archive/'+String(instrument)+'.json')){
            One_Hour_Functions.timeperiods = {}
            One_Hour_Functions.timeperiods['Fifteen_Min'] = [0, 0, 0]
            One_Hour_Functions.timeperiods['Thirty_Min'] = [0, 0, 0]
            One_Hour_Functions.timeperiods['One_Hour'] = [0, 0, 0]
            One_Hour_Functions.timeperiods['Two_Hour'] = [0, 0, 0]
            One_Hour_Functions.timeperiods['Four_Hour'] = [0, 0, 0]
            One_Hour_Functions.timeperiods['Daily'] = [0, 0, 0]
            One_Hour_Functions.timeperiods['Weekly'] = [0, 0, 0]
            fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(One_Hour_Functions.timeperiods, null, 2))
        }
        let raw = fs.readFileSync('./Rejection_Archive/'+String(instrument)+'.json')
        One_Hour_Functions.timeperiods = JSON.parse(raw)
        One_Hour_Functions.rejectionzones = JSON.parse(raw)['One_Hour']
    }
    /** Rejection Zone Saver */
    static rejecsave(){
        let instrument = One_Hour_Functions.instrument_name()
        One_Hour_Functions.rejectionzones = [...new Set(One_Hour_Functions.rejectionzones)]
        One_Hour_Functions.timeperiods['One_Hour'] = One_Hour_Functions.rejectionzones
        fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(One_Hour_Functions.timeperiods, null, 2))
    }

/**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition*/
    static overall(){
        let extendedhistory = One_Hour_Functions.extendHist
        let price = One_Hour_Functions.price
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
        let result = One_Hour_Functions.analysis(studylist, extendedhistory, pricerange)
        return result
    }
    /** Do past Analysis to see if this is a good trade, based on static overall() method */
    static analysis(cases, extendedhistory, pricerange){
        let histnorm = One_Hour_Functions.priceHist
        let normdiff = (Math.max(...histnorm) - Math.min(...histnorm))*.025
        let q = bolls.calculate({period : 10, values: extendedhistory, stdDev: 1});
        let h = new Array();
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
                        maxcount++}
                    if(extendedhistory[fractals[val]] > extendedhistory[fractals[val]+value]){
                        maxcount++}
                    if(extendedhistory[fractals[val]] < extendedhistory[fractals[val]-value]){
                        mincount++}
                    if(extendedhistory[fractals[val]] < extendedhistory[fractals[val]+value]){
                        mincount++}}}
            if(mincount || maxcount > 4){
                rejection++
                if(fractals.length < 1){
                    fractals.push(0)
                    One_Hour_Functions.rejectionzones.push(fractals[0])
                }else{
                    let frac = fractals[val]
                    One_Hour_Functions.rejectionzones.push(extendedhistory[frac])
            }}}
        if(One_Hour_Functions.rejectionzones.length < 1){
            One_Hour_Functions.rejectionzones.push(One_Hour_Functions.price)
        }
        if(rejection > 2){
            return false
        }else{
            return true
        }
        
    }

/** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
    static rejectionzoning(){
        One_Hour_Functions.overall()
        let rejects = One_Hour_Functions.rejectionzones
        let diffs = []
        for(const val in rejects){
            if(One_Hour_Nexus.pot_buy){
                if(One_Hour_Functions.price < val){
                    diffs.push(val - One_Hour_Functions.price)}}
            if(One_Hour_Nexus.pot_sell){
                if(One_Hour_Functions.price > val){
                    diffs.push(One_Hour_Functions.price - val)}}
        }

        if(Math.abs(Math.min(...diffs)) < Math.abs(One_Hour_Functions.price - One_Hour_Nexus.tp)){
            One_Hour_Nexus.pot_buy = false
            One_Hour_Nexus.pot_sell = false
            return true
        }else{
            return false
        }
    }
/** return price */
    static getPrice(){
        return One_Hour_Functions.price}
/** return historical price */
    static priceHistory(){
        return One_Hour_Functions.priceHist}
/** find whether trend is going up or down */
    static trend(){
        let history = One_Hour_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }
/** recent history, shortens history array into last 50 digits for different analyses */
    static recentHist(){
        let history = One_Hour_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 50; x++)
            historytwo.push(history.splice(-1,1)[0])
        One_Hour_Functions.recentHisto = historytwo.reverse()
    }
/** determination of stop loss size */
    static stoploss(){
        var highs = One_Hour_Functions.highs
        var lows = One_Hour_Functions.lows
        var diff = []
        var totaldiff = 0
        var finaldiff = 0
        for(let variables = 0; variables < 30; variables++){
            diff.push(Math.abs(highs[highs.length-1-variables]-lows[lows.length-1-variables]))}
        for(let variables = 0; variables < diff.length; variables++){
            totaldiff += diff[variables]}
        if(One_Hour_Functions.volatility() > .618){
            finaldiff = (totaldiff/30)*1.382}
        else{
            finaldiff = (totaldiff/30)
        }
        let slceil = 0
        let slfloor = 0
        let numbuy = 0
        let newsl = 0
        if(One_Hour_Nexus.pot_buy){
            let diffprice = One_Hour_Functions.price - finaldiff
            if(!Number.isFinite(One_Hour_Functions.closesttwo(diffprice)[0])){
                slfloor = One_Hour_Functions.price - (finaldiff*3.618)
                newsl = slfloor
            }else{
                numbuy = One_Hour_Functions.closesttwo(diffprice)[0]
                if(!Number.isFinite(One_Hour_Functions.closesttwo(numbuy)[0])){
                    newsl = diffprice-(.786*(diffprice-numbuy))
                }else{
                    slfloor = (One_Hour_Functions.price-((One_Hour_Functions.price - One_Hour_Functions.closesttwo(numbuy)[0])*1.618*.786))
                    newsl = slfloor
                }}
            One_Hour_Nexus.sl = newsl
        }if(One_Hour_Nexus.pot_sell){
            let diffprice = finaldiff + One_Hour_Functions.price
            if(!Number.isFinite(One_Hour_Functions.closesttwo(diffprice)[1])){
                slceil = One_Hour_Functions.price + (finaldiff*3.618)
                newsl = slceil
            }else{
                numbuy = One_Hour_Functions.closesttwo(diffprice)[1]
                if(!Number.isFinite(One_Hour_Functions.closesttwo(numbuy)[1])){
                    newsl = diffprice+(.786*(numbuy-diffprice))
                }else{
                    slceil = (One_Hour_Functions.price+((Math.abs(One_Hour_Functions.price - One_Hour_Functions.closesttwo(numbuy)[1]))*1.618*.786))
                    newsl = slceil
                }}
            One_Hour_Nexus.sl = newsl
            }
        return finaldiff
        }
/** price zones, meant to determine whether a price zone has been found or not */
    static priceZones(){
        One_Hour_Functions.supreslevs()
        if(Math.abs((One_Hour_Functions.pipCountBuy(One_Hour_Functions.price,One_Hour_Nexus.resistance))
            )/(Math.abs(One_Hour_Functions.pipCountBuy(Math.max(...One_Hour_Functions.priceHist),Math.min(...One_Hour_Functions.priceHist)))) < .1){
            return true
        }else if(Math.abs((One_Hour_Functions.pipCountBuy(One_Hour_Functions.price,One_Hour_Nexus.support))
            )/(Math.abs(One_Hour_Functions.pipCountBuy(Math.max(...One_Hour_Functions.priceHist),Math.min(...One_Hour_Functions.priceHist)))) < .1){
            return true
        }else{
            return false
        }
    }
/** keylev, meant to determine the closest keylevel to the current price */
    static keylev(){
        One_Hour_Functions.getPrice()
        if(One_Hour_Functions.valdiff(One_Hour_Functions.price, One_Hour_Functions.closest(One_Hour_Functions.price)) < .1){
            return true}
        else{
            return false}}
/**volatility, meant to determine whether or not price movement is too volatile for current parameters */
    static volatility(){
        let history = One_Hour_Functions.priceHist
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
        var factor = One_Hour_Functions.volatility()
        let history = One_Hour_Functions.priceHist
        let ceiling = Math.max(...history)
        let floor = Math.min(...history)
        let diffy = ceiling - floor
        let posdiff = Math.abs(One_Hour_Nexus.posprice - One_Hour_Functions.price)
        let deci = posdiff/diffy
        let input = deci*6.18
        var equation = (1-factor)*(((input*input)+input)/((input*input)+input+1))
        return equation
    }
/**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
    static priceChannels(){
        let rvalues = One_Hour_Functions.regression()
        if ((rvalues[0]*rvalues[0]) > .8 && (rvalues[1]*rvalues[1]) > .8) {
            return true
        }
        else{
            return false
        }
    }
/** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now*/
    static consolidation(){
        if (One_Hour_Functions.volatility() > .618){
            return false
        }else{
            return true
        }
    }
/** used to determine slope between two points */
    static slopes(){
        One_Hour_Functions.recentHist()
        let recentHistory = One_Hour_Functions.recentHisto
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
        One_Hour_Functions.recentHist()
        let recentHistory = One_Hour_Functions.recentHisto
        let slope = One_Hour_Functions.slopes()
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
        One_Hour_Functions.maxes = maxes
        One_Hour_Functions.mins = mins
    }
/** used to determine regression lines (moving averages, for example) */
    static regression(){
        One_Hour_Functions.maxes_mins()
        const x = []
        let length = One_Hour_Functions.maxes.length
        for(let value = 0; value < length; value++)
            x.push(value)
        const y = One_Hour_Functions.maxes
        const regressions = new regression.SimpleLinearRegression(x, y);
        const xtwo = []
        let lengthtwo = One_Hour_Functions.mins.length
        for(let value = 0; value < lengthtwo; value++)
            xtwo.push(value)
        const ytwo = One_Hour_Functions.mins
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
        let history = One_Hour_Functions.priceHist
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
        let price = One_Hour_Functions.getPrice()
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
            if (Math.abs(One_Hour_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(One_Hour_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-One_Hour_Functions.pipreverse(price, One_Hour_Functions.pipdiffy(price, One_Hour_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+One_Hour_Functions.pipreverse(price, One_Hour_Functions.pipdiffy(price, One_Hour_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        One_Hour_Nexus.support = support
        One_Hour_Nexus.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        One_Hour_Nexus.finlevs = finalLevs
    }
    /** self explanatory, finds RSI and compares the last two */
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
/** self explanatory, finds MACD and compares the last two */
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
/** self explanatory, finds ROC and compares the last two */
    static roc(){
        let history = One_Hour_Functions.priceHist
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
/** new indicator mix that finds EMAS of RSI and compares the last two values */
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
/** pip counter */
    static pip(num1, num2){
        if(String(num1).indexOf('.') == 2) {
            One_Hour_Functions.multiplier = 1000
        }else if(String(num1).indexOf('.') == 3){
            One_Hour_Functions.multiplier = 100
        }else if(String(num1).indexOf('.') == 4){
            One_Hour_Functions.multiplier = 10
        }else if(String(num1).indexOf('.') == 5){
            One_Hour_Functions.multiplier = 1
        }else if(String(num1).indexOf('.') == 5){
            One_Hour_Functions.multiplier = .1
        }else if(String(num1).indexOf('.') == 6){
            One_Hour_Functions.multiplier = .01
        }else if(String(num1).indexOf('.') == 7){
            One_Hour_Functions.multiplier = .001
        }else if(String(num1).indexOf('.') == 8){
            One_Hour_Functions.multiplier = .0001
        }else if(String(num1).indexOf('.') == 9){
            One_Hour_Functions.multiplier = .00001
        }else if(String(num1).indexOf('.') == 10){
            One_Hour_Functions.multiplier = .000001
        }else{One_Hour_Functions.multiplier = 10000}
        num1 *= One_Hour_Functions.multiplier
        num2 *= One_Hour_Functions.multiplier
        return [num1, num2]}
/** pip converter */
    static pipreverse(num, num2){
        if(String(num).indexOf('.') == 2) {
            One_Hour_Functions.multiplier = .001
        }else if(String(num).indexOf('.') == 3){
            One_Hour_Functions.multiplier = .01
        }else if(String(num).indexOf('.') == 4){
            One_Hour_Functions.multiplier = .1
        }else if(String(num).indexOf('.') == 5){
            One_Hour_Functions.multiplier = 1
        }else if(String(num).indexOf('.') == 5){
            One_Hour_Functions.multiplier = 10
        }else if(String(num).indexOf('.') == 6){
            One_Hour_Functions.multiplier = 100
        }else if(String(num).indexOf('.') == 7){
            One_Hour_Functions.multiplier = 1000
        }else if(String(num).indexOf('.') == 8){
            One_Hour_Functions.multiplier = 10000
        }else if(String(num).indexOf('.') == 9){
            One_Hour_Functions.multiplier = 100000
        }else if(String(num).indexOf('.') == 10){
            One_Hour_Functions.multiplier = 1000000
        }else{One_Hour_Functions.multiplier = .0001}
        num2 *= One_Hour_Functions.multiplier
        return(num2)}

    static instrument_switcher(instrument){
    }

    /* sets value difference as a decimal-percentage of floor to ceiling*/
    /** gets value difference for normalization of data points */
    static valdiff(num1, num2){
        let history = One_Hour_Functions.priceHist
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
            One_Hour_Functions.multiplier = 1000
        } else if (String(price).indexOf('.') == 3) {
            One_Hour_Functions.multiplier = 100
        } else if (String(price).indexOf('.') == 4) {
            One_Hour_Functions.multiplier = 10
        } else if (String(price).indexOf('.') == 5) {
            One_Hour_Functions.multiplier = 1
        } else if (String(price).indexOf('.') == 5) {
            One_Hour_Functions.multiplier = .1
        } else if (String(price).indexOf('.') == 6) {
            One_Hour_Functions.multiplier = .01
        } else if (String(price).indexOf('.') == 7) {
            One_Hour_Functions.multiplier = .001
        } else if (String(price).indexOf('.') == 8) {
            One_Hour_Functions.multiplier = .0001
        } else if (String(price).indexOf('.') == 9) {
            One_Hour_Functions.multiplier = .00001
        } else if (String(price).indexOf('.') == 10) {
            One_Hour_Functions.multiplier = .000001
        } else {
            One_Hour_Functions.multiplier = 10000
        }
        return num1*One_Hour_Functions.multiplier
    }

    /** finds closest support and resistance level to whatever price u put in */
    static closest(num1){
        let values = One_Hour_Nexus.finlevs.concat(One_Hour_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        for(let item = 0; item < values.length; item++){
            if (num1 < values[item]) {
                valdiffgreater.push(Math.abs(num1-values[item]))}
            if (num1 > values[item]) {
                valdiffless.push(Math.abs(num1-values[item]))}}
        let closestbelow = One_Hour_Functions.price-Math.min(...valdiffless)
        let closestabove = One_Hour_Functions.price+Math.min(...valdiffgreater)
        let closests = [closestbelow, closestabove]
        return Math.min(...closests)
    }
    /** finds closest support and resistance level to whatever price u put in */
    static closesttwo(num1){
        let values = One_Hour_Nexus.finlevs.concat(One_Hour_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        for(let item = 0; item < values.length; item++){
            if (num1 < values[item]) {
                valdiffgreater.push(Math.abs(num1-values[item]))}
            if (num1 > values[item]) {
                valdiffless.push(Math.abs(num1-values[item]))}}
        let closestbelow = One_Hour_Functions.price-Math.min(...valdiffless)
        let closestabove = One_Hour_Functions.price+Math.min(...valdiffgreater)
        let closests = [closestbelow, closestabove]
        return closests
    }
    /** Counts pips between two values for buying */
    static pipCountBuy(num1, num2){
        let nums
        nums = One_Hour_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}
        
    /** Counts pips between two values for selling */
    static pipCountSell(num1, num2){
        let nums
        nums = One_Hour_Functions.pip(num1, num2)
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
    resistance = 0
    support = 0
    finlevs = []
    highs = []
    lows = []

    static HistoryAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        Daily_Functions.priceHist = dataset["Daily"]['c']
        Daily_Functions.highs = dataset["Daily"]['h']
        Daily_Functions.lows = dataset["Daily"]['l']
        }

    static ValueAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            Daily_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
    static trend(){
        Daily_Functions.recentHist()
        let hist = Daily_Functions.recentHisto
        const x = []
        let length = hist.length
        for(let value = 0; value < length; value++)
            x.push(value)
        const y = hist
        const regressions = new regression.SimpleLinearRegression(x, y);
        let slope = regressions.slope
        if(slope > 1){
            return true
        }
        else if(slope < 1){
            return false
        }
    }
    
    /* make  function */
    /* let data = request() */
    static getPrice(){
        return Daily_Functions.price}

    static priceHistory(){
        return Daily_Functions.priceHist}

    static recentHist(){
        let history = Daily_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 30; x++)
            historytwo.push(history.splice(-1,1)[0])
        Daily_Functions.recentHisto = historytwo.reverse()
    }

    static priceZones(){
        let biggersupres = Daily_Functions.supreslevs()
        return biggersupres
    }

/* Add Key Part That the Levels Must Repeat 3x */
    static supreslevs(){
        let history = Daily_Functions.priceHist
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
        Daily_Functions.getPrice()
        let price = Daily_Functions.price
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
            if (Math.abs(One_Hour_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(One_Hour_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-One_Hour_Functions.pipreverse(price, One_Hour_Functions.pipdiffy(price, One_Hour_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+One_Hour_Functions.pipreverse(price, One_Hour_Functions.pipdiffy(price, One_Hour_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        Daily_Functions.support = support
        Daily_Functions.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        Daily_Functions.finlevs = finalLevs
    }

    static pip(num1, num2){
        if(String(num1).indexOf('.') == 2) {
            Daily_Functions.multiplier = 1000
        }else if(String(num1).indexOf('.') == 3){
            Daily_Functions.multiplier = 100
        }else if(String(num1).indexOf('.') == 4){
            Daily_Functions.multiplier = 10
        }else if(String(num1).indexOf('.') == 5){
            Daily_Functions.multiplier = 1
        }else if(String(num1).indexOf('.') == 5){
            Daily_Functions.multiplier = .1
        }else if(String(num1).indexOf('.') == 6){
            Daily_Functions.multiplier = .01
        }else if(String(num1).indexOf('.') == 7){
            Daily_Functions.multiplier = .001
        }else if(String(num1).indexOf('.') == 8){
            Daily_Functions.multiplier = .0001
        }else if(String(num1).indexOf('.') == 9){
            Daily_Functions.multiplier = .00001
        }else if(String(num1).indexOf('.') == 10){
            Daily_Functions.multiplier = .000001
        }else{Daily_Functions.multiplier = 10000}
        num1 *= Daily_Functions.multiplier
        num2 *= Daily_Functions.multiplier
        return [num1, num2]}

    static instrument_catalog(instrument){
    }

    static pipCountBuy(num1, num2){
        let nums
        nums = Daily_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}
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
   static HistoryAssigner(){
        let instrument = Four_Hour_Functions.instrument_name()
        Four_Hour_Functions.priceHist = dataset["Four_Hour"]['c']
        Four_Hour_Functions.highs = dataset["Four_Hour"]['h']
        Four_Hour_Functions.lows = dataset["Four_Hour"]['l']
        Four_Hour_Functions.extendHist = dataset["Four_Hour Extend"]['c']
        Four_Hour_Functions.extendHigh = dataset["Four_Hour Extend"]['h']
        Four_Hour_Functions.extendLow = dataset["Four_Hour Extend"]['l']
    }
/** load price from json file */
    static ValueAssigner(){
        let instrument = Four_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            Four_Hour_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
/** second consolidation method, meant to strengthen consolidation identification */
    static consolidationtwo(){
        let history = Four_Hour_Functions.priceHist
        let highs = Four_Hour_Functions.highs
        let lows = Four_Hour_Functions.lows
        let histmax = Math.max(...history)
        let histmin = Math.min(...history)
        let histdiff = histmax - histmin
        let q = bolls.calculate({period : 10, values: history, stdDev: 1});
        let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
        let h = new Array();
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

    /**fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
    static fib(){
        let recents = Four_Hour_Functions.recentHisto
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
        let currentprice = Four_Hour_Functions.price
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
        let instrument = Four_Hour_Functions.instrument_name()
        if(!fs.existsSync('./Rejection_Archive/'+String(instrument)+'.json')){
            Four_Hour_Functions.timeperiods = {}
            Four_Hour_Functions.timeperiods['Fifteen_Min'] = [0, 0, 0]
            Four_Hour_Functions.timeperiods['Thirty_Min'] = [0, 0, 0]
            Four_Hour_Functions.timeperiods['One_Hour'] = [0, 0, 0]
            Four_Hour_Functions.timeperiods['Two_Hour'] = [0, 0, 0]
            Four_Hour_Functions.timeperiods['Four_Hour'] = [0, 0, 0]
            Four_Hour_Functions.timeperiods['Daily'] = [0, 0, 0]
            Four_Hour_Functions.timeperiods['Weekly'] = [0, 0, 0]
            fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Four_Hour_Functions.timeperiods, null, 2))
        }
        let raw = fs.readFileSync('./Rejection_Archive/'+String(instrument)+'.json')
        Four_Hour_Functions.timeperiods = JSON.parse(raw)
        Four_Hour_Functions.rejectionzones = JSON.parse(raw)['Four_Hour']
    }
    /** Rejection Zone Saver */
    static rejecsave(){
        let instrument = Four_Hour_Functions.instrument_name()
        Four_Hour_Functions.rejectionzones = [...new Set(Four_Hour_Functions.rejectionzones)]
        Four_Hour_Functions.timeperiods['Four_Hour'] = Four_Hour_Functions.rejectionzones
        fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Four_Hour_Functions.timeperiods, null, 2))
    }

        /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition*/
    static overall(){
        let extendedhistory = Four_Hour_Functions.extendHist
        let price = Four_Hour_Functions.price
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
        let result = Four_Hour_Functions.analysis(studylist, extendedhistory, pricerange)
        return result
    }
    /** Do past Analysis to see if this is a good trade, based on static overall() method */
    static analysis(cases, extendedhistory, pricerange){
        let histnorm = Four_Hour_Functions.priceHist
        let normdiff = (Math.max(...histnorm) - Math.min(...histnorm))*.025
        let q = bolls.calculate({period : 10, values: extendedhistory, stdDev: 1});
        let h = new Array();
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
        for(let val = 3; val < fractals.length-3; val++){
            let mincount = 0
            let maxcount = 0
            for(let value = 1; value < 4; value++){
                if( fractals[val] > fractals[val-value]){
                    maxcount++
            }
                if( fractals[val] > fractals[val+value]){
                    maxcount++}
                if( fractals[val] < fractals[val-value]){
                    mincount++
                }
                if( fractals[val] < fractals[val+value]){
                    mincount++}}
            if(mincount + maxcount > 4){
                rejection++
                if(fractals.length < 1){
                    fractals.push(0)
                    Four_Hour_Functions.rejectionzones.push(fractals[0])
                }else{
                let frac = fractals[val]
                    Four_Hour_Functions.rejectionzones.push(extendedhistory[frac])
            }}}
        if(Four_Hour_Functions.rejectionzones.length < 1){
            Four_Hour_Functions.rejectionzones.push(Four_Hour_Functions.price)
        }
        if(rejection > 2){
            return false
        }else{
            return true
        }
        
    }

    /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
    static rejectionzoning(){
        Four_Hour_Functions.overall()
        let rejects = Four_Hour_Functions.rejectionzones
        let diffs = []
        for(const val in rejects){
            if(One_Hour_Nexus.pot_buy){
                if(Four_Hour_Functions.price < val){
                    diffs.push(val - Four_Hour_Functions.price)}}
            if(One_Hour_Nexus.pot_sell){
                if(Four_Hour_Functions.price > val){
                    diffs.push(Four_Hour_Functions.price - val)}}
        }
        if(Math.abs(Math.min(...diffs)) < Math.abs(One_Hour_Functions.price - One_Hour_Nexus.tp)){
            One_Hour_Nexus.pot_buy = false
            One_Hour_Nexus.pot_sell = false
            return true
        }else{
            return false
        }
    }
/** return price */
    static getPrice(){
        return Four_Hour_Functions.price}
/** return historical price */
    static priceHistory(){
        return Four_Hour_Functions.priceHist}
/** find whether trend is going up or down */
    static trend(){
        let history = Four_Hour_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }
/** recent history, shortens history array into last 50 digits for different analyses */
    static recentHist(){
        let history = Four_Hour_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 50; x++)
            historytwo.push(history.splice(-1,1)[0])
        Four_Hour_Functions.recentHisto = historytwo.reverse()
    }
/** determination of stop loss size */
    static stoploss(){
        var highs = Four_Hour_Functions.highs
        var lows = Four_Hour_Functions.lows
        var diff = []
        var totaldiff = 0
        var finaldiff = 0
        for(let variables = 0; variables < 30; variables++){
            diff.push(Math.abs(highs[highs.length-1-variables]-lows[lows.length-1-variables]))}
        for(let variables = 0; variables < diff.length; variables++){
            totaldiff += diff[variables]}
        finaldiff = totaldiff/30
        return finaldiff
    }
/** price zones, meant to determine whether a price zone has been found or not */
    static priceZones(){
        let biggersupres = Four_Hour_Functions.supreslevs()
        return biggersupres
    }
/** keylev, meant to determine the closest keylevel to the current price */
    static keylev(){
        Four_Hour_Functions.getPrice()
        if(Four_Hour_Functions.valdiff(Four_Hour_Functions.price, Four_Hour_Functions.closest(Four_Hour_Functions.price)) < .1){
            return true}
        else{
            return false}}
/**volatility, meant to determine whether or not price movement is too volatile for current parameters */
    static volatility(){
        let history = Four_Hour_Functions.priceHist
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
        var factor = Four_Hour_Functions.volatility()
        let history = Four_Hour_Functions.priceHist
        let ceiling = Math.max(...history)
        let floor = Math.min(...history)
        let diffy = ceiling - floor
        let posdiff = Math.abs(One_Hour_Nexus.posprice - Four_Hour_Functions.price)
        let deci = posdiff/diffy
        let input = deci*6.18
        var equation = (1-factor)*(((input*input)+input)/((input*input)+input+1))
        return equation
    }
/**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
    static priceChannels(){
        let rvalues = Four_Hour_Functions.regression()
        if ((rvalues[0]*rvalues[0]) > .8 && (rvalues[1]*rvalues[1]) > .8) {
            return true
        }
        else{
            return false
        }
    }
/** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now*/
    static consolidation(){
        if (Four_Hour_Functions.volatility() > .618){
            return false
        }else{
            return true
        }
    }
/** used to determine slope between two points */
    static slopes(){
        Four_Hour_Functions.recentHist()
        let recentHistory = Four_Hour_Functions.recentHisto
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
        Four_Hour_Functions.recentHist()
        let recentHistory = Four_Hour_Functions.recentHisto
        let slope = Four_Hour_Functions.slopes()
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
        Four_Hour_Functions.maxes = maxes
        Four_Hour_Functions.mins = mins
    }
/** used to determine regression lines (moving averages, for example) */
    static regression(){
        Four_Hour_Functions.maxes_mins()
        const x = []
        let length = Four_Hour_Functions.maxes.length
        for(let value = 0; value < length; value++)
            x.push(value)
        const y = Four_Hour_Functions.maxes
        /*const regressions = new regression.SimpleLinearRegression(x, y);
        const xtwo = []
        let lengthtwo = Four_Hour_Functions.mins.length
        for(let value = 0; value < lengthtwo; value++)
            xtwo.push(value)
        const ytwo = Four_Hour_Functions.mins
        const regressionstwo = new regression.SimpleLinearRegression(xtwo, ytwo);
        let roneone = Object.values(regressions.score(x,y))[0]
        let ronetwo = Object.values(regressions.score(x,y))[1]
        let rtwoone = Object.values(regressionstwo.score(xtwo,ytwo))[0]
        let rtwotwo = Object.values(regressionstwo.score(xtwo,ytwo))[1]
        return [ronetwo, rtwotwo]*/
    }

/* Add Key Part That the Levels Must Repeat 3x */
/* Key part added, test for results*/
/** finds support and resistance levels, very important for code function, would love to improve this */
    static supreslevs(){
        let history = Four_Hour_Functions.priceHist
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
        let price = Four_Hour_Functions.getPrice()
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
            if (Math.abs(Four_Hour_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Four_Hour_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        Four_Hour_Functions.support = support
        Four_Hour_Functions.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        Four_Hour_Functions.finlevs = finalLevs
    }
    /** self explanatory, finds RSI and compares the last two */
    static rsi(){
        let history = Four_Hour_Functions.priceHist
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
        let history = Four_Hour_Functions.priceHist
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
        let history = Four_Hour_Functions.priceHist
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
        let history = Four_Hour_Functions.priceHist
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
        let history = Four_Hour_Functions.priceHist
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
            Four_Hour_Functions.multiplier = 1000
        }else if(String(num1).indexOf('.') == 3){
            Four_Hour_Functions.multiplier = 100
        }else if(String(num1).indexOf('.') == 4){
            Four_Hour_Functions.multiplier = 10
        }else if(String(num1).indexOf('.') == 5){
            Four_Hour_Functions.multiplier = 1
        }else if(String(num1).indexOf('.') == 5){
            Four_Hour_Functions.multiplier = .1
        }else if(String(num1).indexOf('.') == 6){
            Four_Hour_Functions.multiplier = .01
        }else if(String(num1).indexOf('.') == 7){
            Four_Hour_Functions.multiplier = .001
        }else if(String(num1).indexOf('.') == 8){
            Four_Hour_Functions.multiplier = .0001
        }else if(String(num1).indexOf('.') == 9){
            Four_Hour_Functions.multiplier = .00001
        }else if(String(num1).indexOf('.') == 10){
            Four_Hour_Functions.multiplier = .000001
        }else{Four_Hour_Functions.multiplier = 10000}
        num1 *= Four_Hour_Functions.multiplier
        num2 *= Four_Hour_Functions.multiplier
        return [num1, num2]}
/** pip converter */
    static pipreverse(num, num2){
        if(String(num).indexOf('.') == 2) {
            Four_Hour_Functions.multiplier = .001
        }else if(String(num).indexOf('.') == 3){
            Four_Hour_Functions.multiplier = .01
        }else if(String(num).indexOf('.') == 4){
            Four_Hour_Functions.multiplier = .1
        }else if(String(num).indexOf('.') == 5){
            Four_Hour_Functions.multiplier = 1
        }else if(String(num).indexOf('.') == 5){
            Four_Hour_Functions.multiplier = 10
        }else if(String(num).indexOf('.') == 6){
            Four_Hour_Functions.multiplier = 100
        }else if(String(num).indexOf('.') == 7){
            Four_Hour_Functions.multiplier = 1000
        }else if(String(num).indexOf('.') == 8){
            Four_Hour_Functions.multiplier = 10000
        }else if(String(num).indexOf('.') == 9){
            Four_Hour_Functions.multiplier = 100000
        }else if(String(num).indexOf('.') == 10){
            Four_Hour_Functions.multiplier = 1000000
        }else{Four_Hour_Functions.multiplier = .0001}
        num2 *= Four_Hour_Functions.multiplier
        return(num2)}

    static instrument_switcher(instrument){
    }

    /* sets value difference as a decimal-percentage of floor to ceiling*/
    /** gets value difference for normalization of data points */
    static valdiff(num1, num2){
        let history = Four_Hour_Functions.priceHist
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
            Four_Hour_Functions.multiplier = 1000
        } else if (String(price).indexOf('.') == 3) {
            Four_Hour_Functions.multiplier = 100
        } else if (String(price).indexOf('.') == 4) {
            Four_Hour_Functions.multiplier = 10
        } else if (String(price).indexOf('.') == 5) {
            Four_Hour_Functions.multiplier = 1
        } else if (String(price).indexOf('.') == 5) {
            Four_Hour_Functions.multiplier = .1
        } else if (String(price).indexOf('.') == 6) {
            Four_Hour_Functions.multiplier = .01
        } else if (String(price).indexOf('.') == 7) {
            Four_Hour_Functions.multiplier = .001
        } else if (String(price).indexOf('.') == 8) {
            Four_Hour_Functions.multiplier = .0001
        } else if (String(price).indexOf('.') == 9) {
            Four_Hour_Functions.multiplier = .00001
        } else if (String(price).indexOf('.') == 10) {
            Four_Hour_Functions.multiplier = .000001
        } else {
            Four_Hour_Functions.multiplier = 10000
        }
        return num1*Four_Hour_Functions.multiplier
    }

    /** finds closest support and resistance level to whatever price u put in */
    static closest(num1){
        let values = One_Hour_Nexus.finlevs.concat(One_Hour_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        for(let item = 0; item < values.length; item++){
            if (num1 < values[item]) {
                valdiffgreater.push(Math.abs(num1-values[item]))}
            if (num1 > values[item]) {
                valdiffless.push(Math.abs(num1-values[item]))}}
        let closestbelow = Four_Hour_Functions.price-Math.min(...valdiffless)
        let closestabove = Four_Hour_Functions.price+Math.min(...valdiffgreater)
        let closests = [closestbelow, closestabove]
        return Math.min(...closests)
    }
    /** Counts pips between two values for buying */
    static pipCountBuy(num1, num2){
        let nums
        nums = Four_Hour_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}
        
    /** Counts pips between two values for selling */
    static pipCountSell(num1, num2){
        let nums
        nums = Four_Hour_Functions.pip(num1, num2)
        return(nums[0] - nums[1])}

}

class Thirty_Min_Functions{
    
    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    resistance = 0
    support = 0
    recentHisto = []
    highs = []
    lows = []
    
    static HistoryAssigner(){
        let instrument = One_Hour_Functions.instrument_name()
        Thirty_Min_Functions.priceHist = dataset["Thirty_Min"]['c']
        Thirty_Min_Functions.highs = dataset["Thirty_Min"]['h']
        Thirty_Min_Functions.lows = dataset["Thirty_Min"]['l']
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

class Fifteen_Min_Functions{
    
    
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
        let instrument = One_Hour_Functions.instrument_name()
        Fifteen_Min_Functions.priceHist = dataset["Fifteen_Min"]['c']
        Fifteen_Min_Functions.highs = dataset["Fifteen_Min"]['h']
        Fifteen_Min_Functions.lows = dataset["Fifteen_Min"]['l']
        }

    static consolidationtwo(){
        let history = Fifteen_Min_Functions.priceHist
        let highs = Fifteen_Min_Functions.highs
        let lows = Fifteen_Min_Functions.lows
        let histmax = Math.max(...history)
        let histmin = Math.min(...history)
        let histdiff = histmax - histmin
        let q = bolls.calculate({period : 10, values: history, stdDev: 1});
        let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
        let h = new Array();
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
        let history = Fifteen_Min_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }

    static rsi(){
        let history = Fifteen_Min_Functions.priceHist
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
        let history = Fifteen_Min_Functions.priceHist
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
        let history = Fifteen_Min_Functions.priceHist
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
        let history = Fifteen_Min_Functions.priceHist
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

class Five_Min_Functions{
    
    
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
        let instrument = One_Hour_Functions.instrument_name()
        Five_Min_Functions.priceHist = dataset["Five_Min"]['c']
        Five_Min_Functions.highs = dataset["Five_Min"]['h']
        Five_Min_Functions.lows = dataset["Five_Min"]['l']
        }

    static consolidationtwo(){
        let history = Five_Min_Functions.priceHist
        let highs = Five_Min_Functions.highs
        let lows = Five_Min_Functions.lows
        let histmax = Math.max(...history)
        let histmin = Math.min(...history)
        let histdiff = histmax - histmin
        let q = bolls.calculate({period : 10, values: history, stdDev: 1});
        let n = tr.calculate({high: highs, low: lows, close: history, period: 8});
        let h = new Array();
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
        let history = Five_Min_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }

    static rsi(){
        let history = Five_Min_Functions.priceHist
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
        let history = Five_Min_Functions.priceHist
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
        let history = Five_Min_Functions.priceHist
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
        let history = Five_Min_Functions.priceHist
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

module.exports = { testonehour: function(data){
    dataset = data
    One_Hour_Nexus.controlMain()

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