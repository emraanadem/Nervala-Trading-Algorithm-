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



class Thirty_Min_Nexus{

    pos = false
    buy_pos = false
    sell_pos = false
    pot_buy = false
    biggersupres = []
    pot_sell = false
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
    tptwo = 0
    tstoploss = 0
    sldiff = 0
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
        if (Thirty_Min_Nexus.pzone == false && Thirty_Min_Functions.priceZones() == true){
            Thirty_Min_Nexus.pzone = true
            console.log("Price Zone Identified")
        }if (Thirty_Min_Nexus.pzone == true && Thirty_Min_Functions.priceZones() == false){
            Thirty_Min_Nexus.pzone = false
        }if (Thirty_Min_Nexus.pchan == false && Thirty_Min_Functions.priceChannels() == true){
            Thirty_Min_Nexus.pchan = true
            console.log("Price Channel Identified")
        }if (Thirty_Min_Nexus.pchan == true && Thirty_Min_Functions.priceChannels() == false){
            Thirty_Min_Nexus.pchan = false}
    }
    /** stop loss for buys */
    static stopLossBuy(){
        if (Thirty_Min_Functions.price <= Thirty_Min_Nexus.sl){
            Thirty_Min_Nexus.closePosSL()}}
    /** stop loss for selling */
    static stopLossSell(){
        if (Thirty_Min_Functions.price >= Thirty_Min_Nexus.sl){
            Thirty_Min_Nexus.closePosSL()}}

    /**initiates the piplog for pipcounting */
    static piploginit(){
        Thirty_Min_Nexus.piplog = [0, 0, 0]
    }
    /**pip logging method */
    static piplogger(){
        let piplogging = Thirty_Min_Nexus.piplog
        if (Thirty_Min_Nexus.buy_pos){
            piplogging.push(Thirty_Min_Functions.pipCountBuy(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price))
            Thirty_Min_Nexus.bigpipprice = Math.max(...piplogging)
            Thirty_Min_Nexus.piplog = piplogging}
        if (Thirty_Min_Nexus.sell_pos){
            piplogging.push(Thirty_Min_Functions.pipCountSell(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price))
            Thirty_Min_Nexus.bigpipprice = Math.max(...piplogging)
            Thirty_Min_Nexus.piplog = piplogging}
    }
        /**take profit for buying */
    static takeProfitBuy(){
        if (Thirty_Min_Functions.price >= Thirty_Min_Nexus.tp){
            if(Thirty_Min_Functions.volatility() > .618){
                if((Thirty_Min_Functions.price - Thirty_Min_Nexus.tp) > (Thirty_Min_Nexus.tp - Thirty_Min_Nexus.tstoploss)){
                        if(Thirty_Min_Nexus.tp < Thirty_Min_Nexus.tptwo){
                            Thirty_Min_Nexus.piploginit()
                            Thirty_Min_Nexus.posprice = Thirty_Min_Nexus.tp
                            Thirty_Min_Nexus.tp = Thirty_Min_Nexus.tptwo
                            Thirty_Min_Functions.tpvariation()
                            console.log('pair: ' + Thirty_Min_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(Thirty_Min_Nexus.tp))
                            console.log("New Take Profit 2: " + String(Thirty_Min_Nexus.tptwo))
                            }}}
            else{
            Thirty_Min_Nexus.closePosTP()}}
        else if (Thirty_Min_Functions.price <= Thirty_Min_Nexus.tstoploss){
            Thirty_Min_Nexus.closePosTP()}
        else if (Thirty_Min_Functions.price == Thirty_Min_Nexus.tptwo){
            Thirty_Min_Nexus.closePosTP()}
    }
    /** take profit for selling */
    static takeProfitSell(){
        if (Thirty_Min_Functions.price <= Thirty_Min_Nexus.tp){
            if(Thirty_Min_Functions.volatility() > .618){
                if((Thirty_Min_Nexus.tp - Thirty_Min_Functions.price) > (Thirty_Min_Nexus.tstoploss - Thirty_Min_Nexus.tp)){
                        if(Thirty_Min_Nexus.tp < Thirty_Min_Nexus.tptwo){
                            Thirty_Min_Nexus.piploginit()
                            Thirty_Min_Nexus.posprice = Thirty_Min_Nexus.tp
                            Thirty_Min_Nexus.tp = Thirty_Min_Nexus.tptwo
                            Thirty_Min_Functions.tpvariation()
                            console.log('pair: ' + Thirty_Min_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(Thirty_Min_Nexus.tp))
                            console.log("New Take Profit 2: " + String(Thirty_Min_Nexus.tptwo))
                            }}}
            else{
            Thirty_Min_Nexus.closePosTP()}}
        else if (Thirty_Min_Functions.price >= Thirty_Min_Nexus.tstoploss){
            Thirty_Min_Nexus.closePosTP()}
        else if (Thirty_Min_Functions.price == Thirty_Min_Nexus.tptwo){
            Thirty_Min_Nexus.closePosTP()}}
    /** stop loss defining method */
    static stoplossdef(){
        let stoploss = Thirty_Min_Functions.stoploss()
        if(Thirty_Min_Nexus.buy_pos){
            Thirty_Min_Nexus.sl = Thirty_Min_Functions.price - stoploss}
        if(Thirty_Min_Nexus.sell_pos){
            Thirty_Min_Nexus.sl = Thirty_Min_Functions.price + stoploss}}
    /** define volatility for the system, tells me whether or not to alter trailing stop loss*/
    static volatilitydef(){
        if(Thirty_Min_Functions.volatility() > .618 && Thirty_Min_Nexus.tstoplossinits && !Thirty_Min_Nexus.tstoplossvoid){
            Thirty_Min_Nexus.tstoplossdefvol()}
    }
    /** initiate trailing stop loss */
    static tstoplossinit(){
        let stoploss = Thirty_Min_Nexus.sldiff
        if(!Thirty_Min_Nexus.tstop && !Thirty_Min_Nexus.tstoplossinits && !Thirty_Min_Nexus.tstoplossvoid){
            if(Thirty_Min_Nexus.buy_pos){
                if(Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + .3*stoploss){
                    Thirty_Min_Nexus.tstoplossinits = true
                    Thirty_Min_Nexus.tstoplossdef()}}
            if(Thirty_Min_Nexus.sell_pos){
                if(Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - .3*stoploss){
                    Thirty_Min_Nexus.tstoplossinits = true
                    Thirty_Min_Nexus.tstoplossdef()}}}
    }
    /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a 
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
    static tstoplossdefvol(){
        Thirty_Min_Nexus.sldiff = Thirty_Min_Functions.stoploss()
        let stoploss = Thirty_Min_Nexus.sldiff
        if(Thirty_Min_Nexus.buy_pos){
            if(Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + .3*stoploss){
                Thirty_Min_Nexus.tstop = true
                Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice + (((Math.abs(Thirty_Min_Functions.price-Thirty_Min_Nexus.posprice))*(Thirty_Min_Functions.trailingsl())))
            }}
        if(Thirty_Min_Nexus.sell_pos){
            if(Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - .3*stoploss){
                Thirty_Min_Nexus.tstop = true
                Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice - (((Math.abs(Thirty_Min_Functions.price-Thirty_Min_Nexus.posprice))*(Thirty_Min_Functions.trailingsl())))
            }}
    }
    /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility*/
    static tstoplosscheck(){
        let tstoploss = Thirty_Min_Nexus.sldiff
        if(Thirty_Min_Nexus.buy_pos){
            if(Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice + .3*tstoploss){
                Thirty_Min_Nexus.tstoplossvoid = true
            }
            else{
                Thirty_Min_Nexus.tstoplossvoid = false
                Thirty_Min_Nexus.volatilitydef()
                Thirty_Min_Nexus.tstoplossinit()
            }}
        if(Thirty_Min_Nexus.sell_pos){
            if(Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice - .3*tstoploss){
                Thirty_Min_Nexus.tstoplossvoid = true
            }
            else{
                Thirty_Min_Nexus.tstoplossvoid = false
                Thirty_Min_Nexus.volatilitydef()
                Thirty_Min_Nexus.tstoplossinit()}}
    }
    /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
    static tstoplosscont(){
        if(Thirty_Min_Functions.volatility() < .618 && Thirty_Min_Nexus.tstoplossinits && !Thirty_Min_Nexus.tstoplossvoid){
            Thirty_Min_Nexus.sldiff = Thirty_Min_Functions.stoploss()
            let stoploss = Thirty_Min_Nexus.sldiff
            if(Thirty_Min_Nexus.buy_pos){
                if(Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + .3*stoploss){
                    Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice + Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, .618*Thirty_Min_Nexus.bigpipprice)
            }}
            if(Thirty_Min_Nexus.sell_pos){
                if(Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - .3*stoploss){
                    Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice - Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, .618*Thirty_Min_Nexus.bigpipprice)
            }}}
    }
    /** method that defines trailing stop loss for the system to begin with trailing stop loss */
    static tstoplossdef(){
        Thirty_Min_Nexus.sldiff = Thirty_Min_Functions.stoploss()
        let stoploss = Thirty_Min_Nexus.sldiff
        if(Thirty_Min_Nexus.buy_pos){
            if(Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + .3*stoploss){
                Thirty_Min_Nexus.tstop = true
                Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice + Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, .618*Thirty_Min_Nexus.bigpipprice)
            }}
        if(Thirty_Min_Nexus.sell_pos){
            if(Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - .3*stoploss){
                Thirty_Min_Nexus.tstop = true
                Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice - Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, .618*Thirty_Min_Nexus.bigpipprice)
        }}}

    /*FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS!*/
    
    /** initiates a buy signal */
    static buy(){
        Thirty_Min_Functions.supreslevs()
        Thirty_Min_Functions.getPrice()
        Thirty_Min_Functions.stoploss()
        Thirty_Min_Functions.tpvariation()
        if(!Thirty_Min_Functions.rejectionzoning()){
            if (Math.abs(Thirty_Min_Functions.valdiff(Thirty_Min_Functions.price, Thirty_Min_Functions.closest(Thirty_Min_Functions.price))) > .025) {
                Thirty_Min_Nexus.tp = Thirty_Min_Nexus.resistance
                Thirty_Min_Nexus.pos = true
                Thirty_Min_Nexus.buy_pos = true
                Thirty_Min_Nexus.posprice = Thirty_Min_Functions.price
                Thirty_Min_Functions.stoploss()
                Thirty_Min_Functions.tpvariation()
                console.log('pair: ' + Thirty_Min_Nexus.pair)
                console.log("Open Buy Order on Thirty Min")
                console.log("Entry Price: " + String(Thirty_Min_Nexus.posprice))
                console.log("Stop Loss: " + String(Thirty_Min_Nexus.sl))
                console.log("Target Take Profit: " + String(Thirty_Min_Nexus.tp))
                console.log("Take Profit 2: " + String(Thirty_Min_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static buy(){
        Thirty_Min_Functions.supreslevs()
        Thirty_Min_Functions.getPrice()
        Thirty_Min_Nexus.tp = Thirty_Min_Nexus.resistance
        Thirty_Min_Nexus.pos = true
        Thirty_Min_Nexus.buy_pos = true
        Thirty_Min_Nexus.posprice = Thirty_Min_Functions.price
                Thirty_Min_Functions.stoploss()
                Thirty_Min_Functions.tpvariation()
        console.log("Open Buy Order")
        console.log(Thirty_Min_Nexus.sl + " : Stop Loss")
        console.log(Thirty_Min_Nexus.tp + " : Target Take Profit")
        } */

    /** initiates a sell order */
    static sell(){
        Thirty_Min_Functions.supreslevs()
        Thirty_Min_Functions.getPrice()
        Thirty_Min_Functions.stoploss()
        Thirty_Min_Functions.tpvariation()
        if(!Thirty_Min_Functions.rejectionzoning()){
            if (Math.abs(Thirty_Min_Functions.valdiff(Thirty_Min_Functions.price, Thirty_Min_Functions.closest(Thirty_Min_Functions.price))) > .025) {
                Thirty_Min_Nexus.tp = Thirty_Min_Nexus.support
                Thirty_Min_Nexus.pos = true
                Thirty_Min_Nexus.sell_pos = true
                Thirty_Min_Nexus.posprice = Thirty_Min_Functions.price
                Thirty_Min_Functions.stoploss()
                Thirty_Min_Functions.tpvariation()
                console.log('pair: ' + Thirty_Min_Nexus.pair)
                console.log("Open Sell Order on Thirty Min")
                console.log("Entry Price: " + String(Thirty_Min_Nexus.posprice))
                console.log("Stop Loss: " + String(Thirty_Min_Nexus.sl))
                console.log("Target Take Profit: " + String(Thirty_Min_Nexus.tp))
                console.log("Take Profit 2: " + String(Thirty_Min_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static sell(){
        Thirty_Min_Functions.supreslevs()
        Thirty_Min_Functions.getPrice()
        Thirty_Min_Nexus.tp = Thirty_Min_Nexus.support
        Thirty_Min_Nexus.pos = true
        Thirty_Min_Nexus.sell_pos = true
        Thirty_Min_Nexus.posprice = Thirty_Min_Functions.price
                Thirty_Min_Functions.stoploss()
                Thirty_Min_Functions.tpvariation()
        console.log("Open Sell Order")
        console.log(Thirty_Min_Nexus.sl + " : Stop Loss")
        console.log(Thirty_Min_Nexus.tp + " : Target Take Profit")
        }*/

    /** checks for price movement in lower periods to get better idea of the trend */
    static controlSmallerPeriod(){
        try{
        /*Confirm Trend w/ indicators and price movement*/
        Fifteen_Min_Functions.HistoryAssigner()
        Five_Min_Functions.HistoryAssigner()
        Four_Hour_Functions.HistoryAssigner()
        Thirty_Min_Functions.stoploss()
        Thirty_Min_Functions.tpvariation()
        let buy = false
        let sell = false
        if(!Four_Hour_Functions.rejectionzoning() && 
            !Five_Min_Functions.consolidationtwo()){
                if(Four_Hour_Functions.trend() && Fifteen_Min_Functions.ema()){
                    if(Fifteen_Min_Functions.trend() && Fifteen_Min_Functions.macd() && Fifteen_Min_Functions.obv()){
                        if(Five_Min_Functions.ema()){
                            if(Five_Min_Functions.rsi() && Five_Min_Functions.obv()){
                                buy = true}}}}
                if(!Four_Hour_Functions.trend() && !Fifteen_Min_Functions.ema()){
                    if(!Fifteen_Min_Functions.trend() && !Fifteen_Min_Functions.macd() && !Fifteen_Min_Functions.obv()){
                        if(!Five_Min_Functions.ema()){
                            if(!Five_Min_Functions.rsi() && !Five_Min_Functions.obv()){
                                sell = true}}}}}
        return [buy, sell]}
        catch (error) {
            console.log(error)
        }
    }
    /** checks for support and resistance levels in larger time periods to get a better idea of possible consolidation/reversal points */
    static controlBiggerPeriod(){
        try{
        /*Price Zones*/
        Four_Hour_Functions.ValueAssigner()
        One_Hour_Functions.ValueAssigner()
        Four_Hour_Functions.HistoryAssigner()
        One_Hour_Functions.HistoryAssigner()
        Four_Hour_Functions.priceZones()
        One_Hour_Functions.priceZones()
        }catch (error) {
            console.log(error)
        }
        let h = new Array();
        h = Four_Hour_Functions.finlevs
        let i = One_Hour_Functions.finlevs
        let totallevs = h.push(i)
        Thirty_Min_Nexus.biggersupres = totallevs
        Thirty_Min_Nexus.finlevs.concat(totallevs)
    }
    /** main control method, takes control of the entire program and serves as the brain */
    static controlMain(){
        try{
        Thirty_Min_Functions.rejecinit()
        Four_Hour_Functions.rejecinit()
        Thirty_Min_Functions.HistoryAssigner()
        Thirty_Min_Functions.ValueAssigner()
        Thirty_Min_Functions.stoploss()
        Thirty_Min_Functions.getPrice()
        Thirty_Min_Functions.supreslevs()
        Thirty_Min_Nexus.controlBiggerPeriod()
        if ( !Thirty_Min_Functions.consolidationtwo() && Thirty_Min_Functions.overall() && !Thirty_Min_Functions.consolidation() 
            && !Thirty_Min_Functions.keylev()){
                if (Thirty_Min_Functions.ema()){
                    if (Thirty_Min_Nexus.controlSmallerPeriod()[0] == true){
                        if (Thirty_Min_Functions.trend() && Thirty_Min_Functions.rsi() 
                            && Thirty_Min_Functions.macd() && Thirty_Min_Functions.roc() && Thirty_Min_Functions.obv()) {
                                if (!Thirty_Min_Nexus.pos){
                                    if (!Thirty_Min_Nexus.buy_pos)
                                        Thirty_Min_Nexus.pot_buy = true
                                        Thirty_Min_Functions.stoploss()
                                        Thirty_Min_Nexus.piploginit()
                                        Thirty_Min_Nexus.buy()}}}}
                if (!Thirty_Min_Functions.ema()){
                    if (Thirty_Min_Nexus.controlSmallerPeriod()[1] == true){
                        if (!Thirty_Min_Functions.trend() && !Thirty_Min_Functions.rsi() 
                            && !Thirty_Min_Functions.macd() && !Thirty_Min_Functions.roc() && !Thirty_Min_Functions.obv()) {
                                if (!Thirty_Min_Nexus.pos){
                                    if (!Thirty_Min_Nexus.sell_pos)
                                        Thirty_Min_Nexus.pot_sell = true
                                        Thirty_Min_Functions.stoploss()
                                        Thirty_Min_Nexus.piploginit()
                                        Thirty_Min_Nexus.sell()}}}}}
        if (Thirty_Min_Nexus.pos && Thirty_Min_Nexus.buy_pos){
            Thirty_Min_Nexus.piplogger()
            Thirty_Min_Nexus.stopLossBuy()
            Thirty_Min_Nexus.tstoplosscheck()
            Thirty_Min_Nexus.tstoplosscont()
            Thirty_Min_Nexus.takeProfitBuy()}
        if (Thirty_Min_Nexus.pos && Thirty_Min_Nexus.sell_pos){
            Thirty_Min_Nexus.piplogger()
            Thirty_Min_Nexus.stopLossSell()
            Thirty_Min_Nexus.tstoplosscheck()
            Thirty_Min_Nexus.tstoplosscont()
            Thirty_Min_Nexus.takeProfitSell()}
        Thirty_Min_Functions.rejecsave()
        Four_Hour_Functions.rejecsave()}
        catch (error) {
            console.log(error)
        }
        /*figure out how to clear memory, and do so here after every iteration*/
        /*memory issue solved: 4/20/22 */}

    /** close position method for taking profit, and gives pip count and win/loss ratio */
    static closePosTP(){
        if (Thirty_Min_Nexus.pos){
            if (Thirty_Min_Nexus.buy_pos){
                Thirty_Min_Nexus.buy_pos = false
                Thirty_Min_Nexus.pos = false
                Thirty_Min_Nexus.pot_buy = false
                Thirty_Min_Nexus.tstop = false
                Thirty_Min_Nexus.tstoplossinits = false
                Thirty_Min_Nexus.tstoplossvoid = false
                Thirty_Min_Nexus.pchan = false
                Thirty_Min_Nexus.pzone = false
                Thirty_Min_Nexus.wins += 1
                Thirty_Min_Nexus.trades += 1
                Thirty_Min_Nexus.piplog = [0, 0, 0]
                let pipchange = Thirty_Min_Functions.pipCountBuy(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
                Thirty_Min_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + Thirty_Min_Nexus.pair)
                console.log("Take Profit Hit on Thirty Min")
                console.log(Thirty_Min_Nexus.wins + " Wins and     " + Thirty_Min_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Thirty_Min_Nexus.wins/Thirty_Min_Nexus.trades)
                console.log("Pip Count: " + Thirty_Min_Nexus.pips)}
            if (Thirty_Min_Nexus.sell_pos){
                Thirty_Min_Nexus.sell_pos = false
                Thirty_Min_Nexus.pos = false
                Thirty_Min_Nexus.tstop = false
                Thirty_Min_Nexus.pot_sell = false
                Thirty_Min_Nexus.tstoplossinits = false
                Thirty_Min_Nexus.tstoplossvoid = false
                Thirty_Min_Nexus.pchan = false
                Thirty_Min_Nexus.pzone = false
                Thirty_Min_Nexus.wins += 1
                Thirty_Min_Nexus.trades += 1
                Thirty_Min_Nexus.piplog = [0, 0, 0]
                let pipchange = Thirty_Min_Functions.pipCountSell(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
                Thirty_Min_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + Thirty_Min_Nexus.pair)
                console.log("Take Profit Hit on Thirty Min")
                console.log(Thirty_Min_Nexus.wins + " Wins and     " + Thirty_Min_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Thirty_Min_Nexus.wins/Thirty_Min_Nexus.trades)
                console.log("Pip Count: " + Thirty_Min_Nexus.pips)}}}

    /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
    static closePosSL(){
        if (Thirty_Min_Nexus.pos){
            if (Thirty_Min_Nexus.sell_pos){
                Thirty_Min_Nexus.sell_pos = false
                Thirty_Min_Nexus.pos = false
                Thirty_Min_Nexus.tstop = false
                Thirty_Min_Nexus.pot_sell = false
                Thirty_Min_Nexus.tstoplossinits = false
                Thirty_Min_Nexus.tstoplossvoid = false
                Thirty_Min_Nexus.pchan = false
                Thirty_Min_Nexus.pzone = false
                Thirty_Min_Nexus.losses += 1
                Thirty_Min_Nexus.trades += 1
                Thirty_Min_Nexus.piplog = [0, 0, 0]
                let pipchange = Thirty_Min_Functions.pipCountSell(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
                Thirty_Min_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + Thirty_Min_Nexus.pair)
                console.log("Stop Loss Hit on Thirty Min")
                console.log(Thirty_Min_Nexus.wins + " Wins and     " + Thirty_Min_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Thirty_Min_Nexus.wins/Thirty_Min_Nexus.trades)
                console.log("Pip Count" + Thirty_Min_Nexus.pips)}
            if (Thirty_Min_Nexus.buy_pos){
                Thirty_Min_Nexus.buy_pos = false
                Thirty_Min_Nexus.pos = false
                Thirty_Min_Nexus.tstop = false
                Thirty_Min_Nexus.pot_buy = false
                Thirty_Min_Nexus.tstoplossinits = false
                Thirty_Min_Nexus.tstoplossvoid = false
                Thirty_Min_Nexus.pchan = false
                Thirty_Min_Nexus.pzone = false
                Thirty_Min_Nexus.losses += 1
                Thirty_Min_Nexus.trades += 1
                Thirty_Min_Nexus.piplog = [0, 0, 0]
                let pipchange = Thirty_Min_Functions.pipCountBuy(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
                Thirty_Min_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + Thirty_Min_Nexus.pair)
                console.log("Stop Loss Hit on Thirty Min")
                console.log(Thirty_Min_Nexus.wins + " Wins and     " + Thirty_Min_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Thirty_Min_Nexus.wins/Thirty_Min_Nexus.trades)
                console.log("Pip Count" + Thirty_Min_Nexus.pips)}}}
}

class Thirty_Min_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
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
        Thirty_Min_Nexus.pair = dataspecific   
        return dataspecific
    }
/** load historical prices from json file */
    static HistoryAssigner(){
        let instrument = Thirty_Min_Functions.instrument_name()
        Thirty_Min_Functions.priceHist = dataset["Thirty_Min"]['c']
        Thirty_Min_Functions.highs = dataset["Thirty_Min"]['h']
        Thirty_Min_Functions.lows = dataset["Thirty_Min"]['l']
        Thirty_Min_Functions.extendHist = dataset["Thirty_Min Extend"]['c']
        Thirty_Min_Functions.extendHigh = dataset["Thirty_Min Extend"]['h']
        Thirty_Min_Functions.extendLow = dataset["Thirty_Min Extend"]['l']
        }
/** load price from json file */
    static ValueAssigner(){
        let instrument = Thirty_Min_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            Thirty_Min_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
/** second consolidation method, meant to strengthen consolidation identification */
    static consolidationtwo(){
        let history = Thirty_Min_Functions.priceHist
        let highs = Thirty_Min_Functions.highs
        let lows = Thirty_Min_Functions.lows
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
        let tp = Thirty_Min_Nexus.tp
        let values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        let closesttp = 0
        let filteredvaldiff = []
        let nexttp = 0
        let referenceval = 0
        let num1 = Thirty_Min_Nexus.price
        let volval = Thirty_Min_Functions.volatility()
        if(Thirty_Min_Nexus.buy_pos){
            for(let item = 0; item < values.length; item++){
                if (num1 < values[item]) {
                    valdiffgreater.push(Math.abs(num1-values[item]))}}
            closesttp = Thirty_Min_Nexus.tp
            filteredvaldiff = [...new Set(valdiffgreater)]
            for(const valuers in filteredvaldiff){
                referenceval = closesttp - num1
                if ((referenceval >= valuers)){
                    filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                }
            }
            if(volval > .618){
                Thirty_Min_Nexus.tp = Thirty_Min_Functions.price+(Math.abs(Thirty_Min_Functions.price-Thirty_Min_Nexus.tp)*1.382)
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)){
                        nexttp = Thirty_Min_Functions.price+(Math.abs(Thirty_Min_Functions.price-Math.min(...filteredvaldiff))*1.382)
                }else{
                    nexttp = Thirty_Min_Functions.price + ((Thirty_Min_Nexus.tp-Thirty_Min_Functions.price)*1.618)
    
                }
            }else{
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)){
                    nexttp = Thirty_Min_Functions.price+Math.min(...filteredvaldiff)
                }else{
                    nexttp = Thirty_Min_Functions.price + ((Thirty_Min_Functions.tp - Thirty_Min_Functions.price)*1.382)
                }}}
        if(Thirty_Min_Nexus.sell_pos){
            for(let item = 0; item < values.length; item++){
                if (num1 > values[item]) {
                    valdiffless.push(Math.abs(num1-values[item]))}}
            closesttp = Thirty_Min_Nexus.tp
            filteredvaldiff = [...new Set(valdiffless)]
            for(const valuers in filteredvaldiff){
                referenceval = num1 - closesttp
                if ((referenceval >= valuers)){
                    filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                    
                }
            }
            if(volval > .618){
                Thirty_Min_Nexus.tp = Thirty_Min_Functions.price-(Math.abs(Thirty_Min_Functions.price-Thirty_Min_Nexus.tp)*1.382)
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)){
                        nexttp = Thirty_Min_Functions.price-(Math.abs(Thirty_Min_Functions.price-Math.min(...filteredvaldiff))*1.382)
                }else{
                    nexttp = Thirty_Min_Functions.price - ((Thirty_Min_Functions.price - Thirty_Min_Nexus.tp)*1.618)
    
                }
            }else{
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)){
                    nexttp = Thirty_Min_Functions.price+Math.min(...filteredvaldiff)
                }else{
                    nexttp = Thirty_Min_Functions.price - ((Thirty_Min_Functions.price - Thirty_Min_Nexus.tp)*1.382)
                }}}
        Thirty_Min_Nexus.tptwo = nexttp
        }

    /**fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
    static fib(){
        let recents = Thirty_Min_Functions.recentHisto
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
        let currentprice = Thirty_Min_Functions.price
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
        let instrument = Thirty_Min_Functions.instrument_name()
        if(!fs.existsSync('./Rejection_Archive/'+String(instrument)+'.json')){
            Thirty_Min_Functions.timeperiods = {}
            Thirty_Min_Functions.timeperiods['Fifteen_Min'] = [0, 0, 0]
            Thirty_Min_Functions.timeperiods['Thirty_Min'] = [0, 0, 0]
            Thirty_Min_Functions.timeperiods['One_Hour'] = [0, 0, 0]
            Thirty_Min_Functions.timeperiods['Two_Hour'] = [0, 0, 0]
            Thirty_Min_Functions.timeperiods['Four_Hour'] = [0, 0, 0]
            Thirty_Min_Functions.timeperiods['Daily'] = [0, 0, 0]
            Thirty_Min_Functions.timeperiods['Weekly'] = [0, 0, 0]
            fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Thirty_Min_Functions.timeperiods, null, 2))
        }
        let raw = fs.readFileSync('./Rejection_Archive/'+String(instrument)+'.json')
        Thirty_Min_Functions.timeperiods = JSON.parse(raw)
        Thirty_Min_Functions.rejectionzones = JSON.parse(raw)['Thirty_Min']
    }
    /** Rejection Zone Saver */
    static rejecsave(){
        let instrument = Thirty_Min_Functions.instrument_name()
        Thirty_Min_Functions.rejectionzones = [...new Set(Thirty_Min_Functions.rejectionzones)]
        Thirty_Min_Functions.timeperiods['Thirty_Min'] = Thirty_Min_Functions.rejectionzones
        fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Thirty_Min_Functions.timeperiods, null, 2))
    }

    /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition*/
    static overall(){
        let extendedhistory = Thirty_Min_Functions.extendHist
        Thirty_Min_Functions.rejectionzones = [0, 0, 0]
        let price = Thirty_Min_Functions.price
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
        let result = Thirty_Min_Functions.analysis(studylist, extendedhistory, pricerange)
        return result
    }
    /** Do past Analysis to see if this is a good trade, based on static overall() method */
    static analysis(cases, extendedhistory, pricerange){
        let histnorm = Thirty_Min_Functions.priceHist
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
                    Thirty_Min_Functions.rejectionzones.push(fractals[0])
                }else{
                    let frac = fractals[val]
                    Thirty_Min_Functions.rejectionzones.push(extendedhistory[frac])
            }}}
        if(Thirty_Min_Functions.rejectionzones.length < 1){
            Thirty_Min_Functions.rejectionzones.push(Thirty_Min_Functions.price)
        }
        if(rejection > 2){
            return false
        }else{
            return true
        }
        
    }

    /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
    static rejectionzoning(){
        Thirty_Min_Functions.overall()
        let rejects = Thirty_Min_Functions.rejectionzones
        let diffs = []
        for(const val in rejects){
            if(Thirty_Min_Nexus.pot_buy){
                if(Thirty_Min_Functions.price < val){
                    diffs.push(val - Thirty_Min_Functions.price)}}
            if(Thirty_Min_Nexus.pot_sell){
                if(Thirty_Min_Functions.price > val){
                    diffs.push(Thirty_Min_Functions.price - val)}}
        }

        if(Math.abs(Math.min(...diffs)) < Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.tp)){
            Thirty_Min_Nexus.pot_buy = false
            Thirty_Min_Nexus.pot_sell = false
            return true
        }else{
            return false
        }
    }
/** return price */
    static getPrice(){
        return Thirty_Min_Functions.price}
/** return historical price */
    static priceHistory(){
        return Thirty_Min_Functions.priceHist}
/** find whether trend is going up or down */
    static trend(){
        let history = Thirty_Min_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }
/** recent history, shortens history array into last 50 digits for different analyses */
    static recentHist(){
        let history = Thirty_Min_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 50; x++)
            historytwo.push(history.splice(-1,1)[0])
        Thirty_Min_Functions.recentHisto = historytwo.reverse()
    }
/** determination of stop loss size */
    static stoploss(){
        var highs = Thirty_Min_Functions.highs
        var lows = Thirty_Min_Functions.lows
        var diff = []
        var totaldiff = 0
        var finaldiff = 0
        for(let variables = 0; variables < 30; variables++){
            diff.push(Math.abs(highs[highs.length-1-variables]-lows[lows.length-1-variables]))}
        for(let variables = 0; variables < diff.length; variables++){
            totaldiff += diff[variables]}
        if(Thirty_Min_Functions.volatility() > .618){
            finaldiff = (totaldiff/30)*1.382}
        else{
            finaldiff = (totaldiff/30)
        }
        let slceil = 0
        let slfloor = 0
        let numbuy = 0
        let newsl = 0
        if(Thirty_Min_Nexus.pot_buy){
            let diffprice = Thirty_Min_Functions.price - finaldiff
            if(!Number.isFinite(Thirty_Min_Functions.closesttwo(diffprice)[0])){
                slfloor = Thirty_Min_Functions.price - (finaldiff*3.618)
                newsl = slfloor
            }else{
                numbuy = Thirty_Min_Functions.closesttwo(diffprice)[0]
                if(!Number.isFinite(Thirty_Min_Functions.closesttwo(numbuy)[0])){
                    newsl = diffprice-(.786*(diffprice-numbuy))
                }else{
                    slfloor = (Thirty_Min_Functions.price-((Thirty_Min_Functions.price - Thirty_Min_Functions.closesttwo(numbuy)[0])*1.618*.786))
                    newsl = slfloor
                }}
            Thirty_Min_Nexus.sl = newsl
        }if(Thirty_Min_Nexus.pot_sell){
            let diffprice = finaldiff + Thirty_Min_Functions.price
            if(!Number.isFinite(Thirty_Min_Functions.closesttwo(diffprice)[1])){
                slceil = Thirty_Min_Functions.price + (finaldiff*3.618)
                newsl = slceil
            }else{
                numbuy = Thirty_Min_Functions.closesttwo(diffprice)[1]
                if(!Number.isFinite(Thirty_Min_Functions.closesttwo(numbuy)[1])){
                    newsl = diffprice+(.786*(numbuy-diffprice))
                }else{
                    slceil = (Thirty_Min_Functions.price+((Math.abs(Thirty_Min_Functions.price - Thirty_Min_Functions.closesttwo(numbuy)[1]))*1.618*.786))
                    newsl = slceil
                }}
            Thirty_Min_Nexus.sl = newsl
            }
        return finaldiff
        }
    /** finds closest support and resistance level to whatever price u put in */
    static closesttwo(num1){
    let values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
    let valdiffgreater = []
    let valdiffless = []
    for(let item = 0; item < values.length; item++){
        if (num1 < values[item]) {
            valdiffgreater.push(Math.abs(num1-values[item]))}
        if (num1 > values[item]) {
            valdiffless.push(Math.abs(num1-values[item]))}}
    let closestbelow = Thirty_Min_Functions.price-Math.min(...valdiffless)
    let closestabove = Thirty_Min_Functions.price+Math.min(...valdiffgreater)
    let closests = [closestbelow, closestabove]
    return closests
    }
/** price zones, meant to determine whether a price zone has been found or not */
    static priceZones(){
        Thirty_Min_Functions.supreslevs()
        if(Math.abs((Thirty_Min_Functions.pipCountBuy(Thirty_Min_Functions.price,Thirty_Min_Nexus.resistance))
            )/(Math.abs(Thirty_Min_Functions.pipCountBuy(Math.max(...Thirty_Min_Functions.priceHist),Math.min(...Thirty_Min_Functions.priceHist)))) < .1){
            return true
        }else if(Math.abs((Thirty_Min_Functions.pipCountBuy(Thirty_Min_Functions.price,Thirty_Min_Nexus.support))
            )/(Math.abs(Thirty_Min_Functions.pipCountBuy(Math.max(...Thirty_Min_Functions.priceHist),Math.min(...Thirty_Min_Functions.priceHist)))) < .1){
            return true
        }else{
            return false
        }
    }
/** keylev, meant to determine the closest keylevel to the current price */
    static keylev(){
        Thirty_Min_Functions.getPrice()
        if(Thirty_Min_Functions.valdiff(Thirty_Min_Functions.price, Thirty_Min_Functions.closest(Thirty_Min_Functions.price)) < .1){
            return true}
        else{
            return false}}
/**volatility, meant to determine whether or not price movement is too volatile for current parameters */
    static volatility(){
        let history = Thirty_Min_Functions.priceHist
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
        var factor = Thirty_Min_Functions.volatility()
        let history = Thirty_Min_Functions.priceHist
        let ceiling = Math.max(...history)
        let floor = Math.min(...history)
        let diffy = ceiling - floor
        let posdiff = Math.abs(Thirty_Min_Nexus.posprice - Thirty_Min_Functions.price)
        let deci = posdiff/diffy
        let input = deci*6.18
        var equation = (1-factor)*(((input*input)+input)/((input*input)+input+1))
        return equation
    }
/**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
    static priceChannels(){
        let rvalues = Thirty_Min_Functions.regression()
        if ((rvalues[0]*rvalues[0]) > .8 && (rvalues[1]*rvalues[1]) > .8) {
            return true
        }
        else{
            return false
        }
    }
/** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now*/
    static consolidation(){
        if (Thirty_Min_Functions.volatility() > .618){
            return false
        }else{
            return true
        }
    }
/** used to determine slope between two points */
    static slopes(){
        Thirty_Min_Functions.recentHist()
        let recentHistory = Thirty_Min_Functions.recentHisto
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
        Thirty_Min_Functions.recentHist()
        let recentHistory = Thirty_Min_Functions.recentHisto
        let slope = Thirty_Min_Functions.slopes()
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
        Thirty_Min_Functions.maxes = maxes
        Thirty_Min_Functions.mins = mins
    }
/** used to determine regression lines (moving averages, for example) */
    static regression(){
        Thirty_Min_Functions.maxes_mins()
        const x = []
        let length = Thirty_Min_Functions.maxes.length
        for(let value = 0; value < length; value++)
            x.push(value)
        const y = Thirty_Min_Functions.maxes
        const regressions = new regression.SimpleLinearRegression(x, y);
        const xtwo = []
        let lengthtwo = Thirty_Min_Functions.mins.length
        for(let value = 0; value < lengthtwo; value++)
            xtwo.push(value)
        const ytwo = Thirty_Min_Functions.mins
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
        let history = Thirty_Min_Functions.priceHist
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
        let price = Thirty_Min_Functions.getPrice()
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
            if (Math.abs(Thirty_Min_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Thirty_Min_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        Thirty_Min_Nexus.support = support
        Thirty_Min_Nexus.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        Thirty_Min_Nexus.finlevs = finalLevs
    }
    /** self explanatory, finds RSI and compares the last two */
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
/** self explanatory, finds MACD and compares the last two */
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
/** self explanatory, finds ROC and compares the last two */
    static roc(){
        let history = Thirty_Min_Functions.priceHist
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
/** new indicator mix that finds EMAS of RSI and compares the last two values */
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
/** pip counter */
    static pip(num1, num2){
        if(String(num1).indexOf('.') == 2) {
            Thirty_Min_Functions.multiplier = 1000
        }else if(String(num1).indexOf('.') == 3){
            Thirty_Min_Functions.multiplier = 100
        }else if(String(num1).indexOf('.') == 4){
            Thirty_Min_Functions.multiplier = 10
        }else if(String(num1).indexOf('.') == 5){
            Thirty_Min_Functions.multiplier = 1
        }else if(String(num1).indexOf('.') == 5){
            Thirty_Min_Functions.multiplier = .1
        }else if(String(num1).indexOf('.') == 6){
            Thirty_Min_Functions.multiplier = .01
        }else if(String(num1).indexOf('.') == 7){
            Thirty_Min_Functions.multiplier = .001
        }else if(String(num1).indexOf('.') == 8){
            Thirty_Min_Functions.multiplier = .0001
        }else if(String(num1).indexOf('.') == 9){
            Thirty_Min_Functions.multiplier = .00001
        }else if(String(num1).indexOf('.') == 10){
            Thirty_Min_Functions.multiplier = .000001
        }else{Thirty_Min_Functions.multiplier = 10000}
        num1 *= Thirty_Min_Functions.multiplier
        num2 *= Thirty_Min_Functions.multiplier
        return [num1, num2]}
/** pip converter */
    static pipreverse(num, num2){
        if(String(num).indexOf('.') == 2) {
            Thirty_Min_Functions.multiplier = .001
        }else if(String(num).indexOf('.') == 3){
            Thirty_Min_Functions.multiplier = .01
        }else if(String(num).indexOf('.') == 4){
            Thirty_Min_Functions.multiplier = .1
        }else if(String(num).indexOf('.') == 5){
            Thirty_Min_Functions.multiplier = 1
        }else if(String(num).indexOf('.') == 5){
            Thirty_Min_Functions.multiplier = 10
        }else if(String(num).indexOf('.') == 6){
            Thirty_Min_Functions.multiplier = 100
        }else if(String(num).indexOf('.') == 7){
            Thirty_Min_Functions.multiplier = 1000
        }else if(String(num).indexOf('.') == 8){
            Thirty_Min_Functions.multiplier = 10000
        }else if(String(num).indexOf('.') == 9){
            Thirty_Min_Functions.multiplier = 100000
        }else if(String(num).indexOf('.') == 10){
            Thirty_Min_Functions.multiplier = 1000000
        }else{Thirty_Min_Functions.multiplier = .0001}
        num2 *= Thirty_Min_Functions.multiplier
        return(num2)}

    static instrument_switcher(instrument){
    }

    /* sets value difference as a decimal-percentage of floor to ceiling*/
    /** gets value difference for normalization of data points */
    static valdiff(num1, num2){
        let history = Thirty_Min_Functions.priceHist
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
            Thirty_Min_Functions.multiplier = 1000
        } else if (String(price).indexOf('.') == 3) {
            Thirty_Min_Functions.multiplier = 100
        } else if (String(price).indexOf('.') == 4) {
            Thirty_Min_Functions.multiplier = 10
        } else if (String(price).indexOf('.') == 5) {
            Thirty_Min_Functions.multiplier = 1
        } else if (String(price).indexOf('.') == 5) {
            Thirty_Min_Functions.multiplier = .1
        } else if (String(price).indexOf('.') == 6) {
            Thirty_Min_Functions.multiplier = .01
        } else if (String(price).indexOf('.') == 7) {
            Thirty_Min_Functions.multiplier = .001
        } else if (String(price).indexOf('.') == 8) {
            Thirty_Min_Functions.multiplier = .0001
        } else if (String(price).indexOf('.') == 9) {
            Thirty_Min_Functions.multiplier = .00001
        } else if (String(price).indexOf('.') == 10) {
            Thirty_Min_Functions.multiplier = .000001
        } else {
            Thirty_Min_Functions.multiplier = 10000
        }
        return num1*Thirty_Min_Functions.multiplier
    }

    /** finds closest support and resistance level to whatever price u put in */
    static closest(num1){
        let values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        for(let item = 0; item < values.length; item++){
            if (num1 < values[item]) {
                valdiffgreater.push(Math.abs(num1-values[item]))}
            if (num1 > values[item]) {
                valdiffless.push(Math.abs(num1-values[item]))}}
        let closestbelow = Thirty_Min_Functions.price-Math.min(...valdiffless)
        let closestabove = Thirty_Min_Functions.price+Math.min(...valdiffgreater)
        let closests = [closestbelow, closestabove]
        return Math.min(...closests)
    }
    /** Counts pips between two values for buying */
    static pipCountBuy(num1, num2){
        let nums
        nums = Thirty_Min_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}
        
    /** Counts pips between two values for selling */
    static pipCountSell(num1, num2){
        let nums
        nums = Thirty_Min_Functions.pip(num1, num2)
        return(nums[0] - nums[1])}

}

class Four_Hour_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    vals = []
    timeperiods = {}
    resistance = 0
    support = 0
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
        Thirty_Min_Nexus.pair = dataspecific   
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
        let instrument = Thirty_Min_Functions.instrument_name()
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
        let instrument = Thirty_Min_Functions.instrument_name()
        Four_Hour_Functions.rejectionzones = [...new Set(Four_Hour_Functions.rejectionzones)]
        Four_Hour_Functions.timeperiods['Four_Hour'] = Four_Hour_Functions.rejectionzones
        fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Four_Hour_Functions.timeperiods, null, 2))
    }
        /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition*/
    static overall(){
        let extendedhistory = Four_Hour_Functions.extendHist
        Four_Hour_Functions.rejectionzones = [0, 0, 0]
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
                    Four_Hour_Functions.rejectionzones.push(fractals[0])
                }else{
                    let frac = fractals[val]
                    Four_Hour_Functions.rejectionzones.push(extendedhistory[frac])
            }}}
        if(Four_Hour_Functions.rejectionzones.length < 1){
            Four_Hour_Functions.rejectionzones.push(One_Hour_Functions.price)
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
            if(Thirty_Min_Nexus.pot_buy){
                if(Four_Hour_Functions.price < val){
                    diffs.push(val - Four_Hour_Functions.price)}}
            if(Thirty_Min_Nexus.pot_sell){
                if(Four_Hour_Functions.price > val){
                    diffs.push(Four_Hour_Functions.price - val)}}
        }
        if(Math.abs(Math.min(...diffs)) < Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.tp)){
            Thirty_Min_Nexus.pot_buy = false
            Thirty_Min_Nexus.pot_sell = false
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
        let posdiff = Math.abs(Thirty_Min_Nexus.posprice - Four_Hour_Functions.price)
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
        const regressions = new regression.SimpleLinearRegression(x, y);
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
        return [ronetwo, rtwotwo]
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
        let values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
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

class One_Hour_Functions{

    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    resistance = 0
    support = 0
    recentHisto = []
    finlevs = []
    support = 0
    resistance = 0
    highs = highs
    lows = lows
    

    static HistoryAssigner(){
        let instrument = Thirty_Min_Functions.instrument_name()
        One_Hour_Functions.priceHist = dataset["One_Hour"]['c']
        One_Hour_Functions.highs = dataset["One_Hour"]['h']
        One_Hour_Functions.lows = dataset["One_Hour"]['l']
        }

    static ValueAssigner(){
        let instrument = Thirty_Min_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            One_Hour_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
    /* make  function */
    /* let data = request() */
    static getPrice(){
        return One_Hour_Functions.price}

    static priceHistory(){
        return One_Hour_Functions.priceHist}

    static recentHist(){
        let history = One_Hour_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 30; x++)
            historytwo.push(history.splice(-1,1)[0])
        One_Hour_Functions.recentHisto = historytwo.reverse()
    }

    static priceZones(){
        let biggersupres = One_Hour_Functions.supreslevs()
        return biggersupres
    }

/* Add Key Part That the Levels Must Repeat 3x */
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
        One_Hour_Functions.getPrice()
        let price = One_Hour_Functions.price
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
            if (Math.abs(Thirty_Min_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Thirty_Min_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        One_Hour_Functions.support = support
        One_Hour_Functions.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        One_Hour_Functions.finlevs = finalLevs
    }

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

    static instrument_catalog(instrument){
    }

    static pipCountBuy(num1, num2){
        let nums
        nums = One_Hour_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}

}

class Fifteen_Min_Functions{
    
    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    resistance = 0
    support = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []
    
    static HistoryAssigner(){
        let instrument = Thirty_Min_Functions.instrument_name()
        Fifteen_Min_Functions.priceHist = dataset["Fifteen_Min"]['c']
        Fifteen_Min_Functions.highs = dataset["Fifteen_Min"]['h']
        Fifteen_Min_Functions.lows = dataset["Fifteen_Min"]['l']
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
    resistance = 0
    support = 0
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    lows = []
    highs = []
    
    static HistoryAssigner(){
        let instrument = Thirty_Min_Functions.instrument_name()
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



function controlbox(){
    let g = 0
    while(g == 0){
        Thirty_Min_Nexus.controlMain()
    }
    
}
var dataset = {}
async function test(){
    const fs = require('fs');
    let rawtwo = fs.readFileSync('instrument.json')
    let rawthree = fs.readFileSync('instrumentsStocks.json')
    let rawfour = fs.readFileSync('instrumentsForex.json')
    let forexlist = JSON.parse(rawfour)['instruments']
    let stocklist = JSON.parse(rawthree)['instruments']
    let instrum = JSON.parse(rawtwo)
    let instrument = instrum['instrument']
    let raw = fs.readFileSync('IDS.json')
    let ids = JSON.parse(raw)
    const axios = require('axios');
    if(forexlist.includes(instrument)){
        axios.get('http://localhost:8000/' + instrument)
        .then(res => {
            console.log('Status Code:', res.status);

            const data = res.data;
            dataset = data
            Thirty_Min_Nexus.controlMain()

        })
        .catch(err => {
            console.log('Error: ', err.message);
    });}
    if(stocklist.includes(instrument)){
        axios.get('http://localhost:8000/' + instrument)
        .then(res => {
            console.log('Status Code:', res.status);

            const data = res.data;
            dataset = data
            Thirty_Min_Nexus.controlMain()

        })
        .catch(err => {
            console.log('Error: ', err.message);
    });}
}

test()
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