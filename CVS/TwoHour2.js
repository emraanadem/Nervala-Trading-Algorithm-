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


class Two_Hour_Nexus{

    pos = false
    buy_pos = false
    biggersupres = []
    sell_pos = false
    wins = 0
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
        if (Two_Hour_Nexus.pzone == false && Two_Hour_Functions.priceZones() == true){
            Two_Hour_Nexus.pzone = true
            console.log("Price Zone Identified")
        }if (Two_Hour_Nexus.pzone == true && Two_Hour_Functions.priceZones() == false){
            Two_Hour_Nexus.pzone = false
        }if (Two_Hour_Nexus.pchan == false && Two_Hour_Functions.priceChannels() == true){
            Two_Hour_Nexus.pchan = true
            console.log("Price Channel Identified")
        }if (Two_Hour_Nexus.pchan == true && Two_Hour_Functions.priceChannels() == false){
            Two_Hour_Nexus.pchan = false}
    }
    /** stop loss for buys */
    static stopLossBuy(){
        if (Two_Hour_Functions.price <= Two_Hour_Nexus.sl){
            Two_Hour_Nexus.closePosSL()}}
    /** stop loss for selling */
    static stopLossSell(){
        if (Two_Hour_Functions.price >= Two_Hour_Nexus.sl){
            Two_Hour_Nexus.closePosSL()}}

    /**initiates the piplog for pipcounting */
    static piploginit(){
        Two_Hour_Nexus.piplog = [0, 0, 0]
    }
    /**pip logging method */
    static piplogger(){
        let piplogging = Two_Hour_Nexus.piplog
        if (Two_Hour_Nexus.buy_pos){
            piplogging.push(Two_Hour_Functions.pipCountBuy(Two_Hour_Nexus.posprice, Two_Hour_Functions.price))
            Two_Hour_Nexus.bigpipprice = Math.max(...piplogging)
            Two_Hour_Nexus.piplog = piplogging}
        if (Two_Hour_Nexus.sell_pos){
            piplogging.push(Two_Hour_Functions.pipCountSell(Two_Hour_Nexus.posprice, Two_Hour_Functions.price))
            Two_Hour_Nexus.bigpipprice = Math.max(...piplogging)
            Two_Hour_Nexus.piplog = piplogging}
    }
        /**take profit for buying */
    static takeProfitBuy(){
        if (Two_Hour_Functions.price >= Two_Hour_Nexus.tp){
            if(Two_Hour_Functions.volatility() > .618){
                if((Two_Hour_Functions.price - Two_Hour_Nexus.tp) > (Two_Hour_Nexus.tp - Two_Hour_Nexus.tstoploss)){
                        if(Two_Hour_Nexus.tp < Two_Hour_Nexus.tptwo){
                            Two_Hour_Nexus.piploginit()
                            Two_Hour_Nexus.posprice = Two_Hour_Nexus.tp
                            Two_Hour_Nexus.tp = Two_Hour_Nexus.tptwo
                            Two_Hour_Functions.tpvariation()
                            console.log('pair: ' + Two_Hour_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(Two_Hour_Nexus.tp))
                            console.log("New Take Profit 2: " + String(Two_Hour_Nexus.tptwo))
                            }}}
            else{
            Two_Hour_Nexus.closePosTP()}}
        else if (Two_Hour_Functions.price <= Two_Hour_Nexus.tstoploss){
            Two_Hour_Nexus.closePosTP()}
        else if (Two_Hour_Functions.price == Two_Hour_Nexus.tptwo){
            Two_Hour_Nexus.closePosTP()}
    }
    /** take profit for selling */
    static takeProfitSell(){
        if (Two_Hour_Functions.price <= Two_Hour_Nexus.tp){
            if(Two_Hour_Functions.volatility() > .618){
                if((Two_Hour_Nexus.tp - Two_Hour_Functions.price) > (Two_Hour_Nexus.tstoploss - Two_Hour_Nexus.tp)){
                        if(Two_Hour_Nexus.tp < Two_Hour_Nexus.tptwo){
                            Two_Hour_Nexus.piploginit()
                            Two_Hour_Nexus.posprice = Two_Hour_Nexus.tp
                            Two_Hour_Nexus.tp = Two_Hour_Nexus.tptwo
                            Two_Hour_Functions.tpvariation()
                            console.log('pair: ' + Two_Hour_Nexus.pair)
                            console.log("\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...")
                            console.log("New Target Take Profit: " + String(Two_Hour_Nexus.tp))
                            console.log("New Take Profit 2: " + String(Two_Hour_Nexus.tptwo))
                            }}}
            else{
            Two_Hour_Nexus.closePosTP()}}
        else if (Two_Hour_Functions.price >= Two_Hour_Nexus.tstoploss){
            Two_Hour_Nexus.closePosTP()}
        else if (Two_Hour_Functions.price == Two_Hour_Nexus.tptwo){
            Two_Hour_Nexus.closePosTP()}}
    /** stop loss defining method */
    static stoplossdef(){
        let stoploss = Two_Hour_Functions.stoploss()
        if(Two_Hour_Nexus.buy_pos){
            Two_Hour_Nexus.sl = Two_Hour_Functions.price - stoploss}
        if(Two_Hour_Nexus.sell_pos){
            Two_Hour_Nexus.sl = Two_Hour_Functions.price + stoploss}}
    /** define volatility for the system, tells me whether or not to alter trailing stop loss*/
    static volatilitydef(){
        if(Two_Hour_Functions.volatility() > .618 && Two_Hour_Nexus.tstoplossinits && !Two_Hour_Nexus.tstoplossvoid){
            Two_Hour_Nexus.tstoplossdefvol()}
    }
    /** initiate trailing stop loss */
    static tstoplossinit(){
        let stoploss = Two_Hour_Nexus.sldiff
        if(!Two_Hour_Nexus.tstop && !Two_Hour_Nexus.tstoplossinits && !Two_Hour_Nexus.tstoplossvoid){
            if(Two_Hour_Nexus.buy_pos){
                if(Two_Hour_Functions.price > Two_Hour_Nexus.posprice + .3*stoploss){
                    Two_Hour_Nexus.tstoplossinits = true
                    Two_Hour_Nexus.tstoplossdef()}}
            if(Two_Hour_Nexus.sell_pos){
                if(Two_Hour_Functions.price < Two_Hour_Nexus.posprice - .3*stoploss){
                    Two_Hour_Nexus.tstoplossinits = true
                    Two_Hour_Nexus.tstoplossdef()}}}
    }
    /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a 
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
    static tstoplossdefvol(){
        Two_Hour_Nexus.sldiff = Two_Hour_Functions.stoploss()
        let stoploss = Two_Hour_Nexus.sldiff
        if(Two_Hour_Nexus.buy_pos){
            if(Two_Hour_Functions.price > Two_Hour_Nexus.posprice + .3*stoploss){
                Two_Hour_Nexus.tstop = true
                Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice + (((Math.abs(Two_Hour_Functions.price-Two_Hour_Nexus.posprice))*(Two_Hour_Functions.trailingsl())))
            }}
        if(Two_Hour_Nexus.sell_pos){
            if(Two_Hour_Functions.price < Two_Hour_Nexus.posprice - .3*stoploss){
                Two_Hour_Nexus.tstop = true
                Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice - (((Math.abs(Two_Hour_Functions.price-Two_Hour_Nexus.posprice))*(Two_Hour_Functions.trailingsl())))
            }}
    }
    /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility*/
    static tstoplosscheck(){
        let tstoploss = Two_Hour_Nexus.sldiff
        if(Two_Hour_Nexus.buy_pos){
            if(Two_Hour_Functions.price < Two_Hour_Nexus.posprice + .3*tstoploss){
                Two_Hour_Nexus.tstoplossvoid = true
            }
            else{
                Two_Hour_Nexus.tstoplossvoid = false
                Two_Hour_Nexus.volatilitydef()
                Two_Hour_Nexus.tstoplossinit()
            }}
        if(Two_Hour_Nexus.sell_pos){
            if(Two_Hour_Functions.price > Two_Hour_Nexus.posprice - .3*tstoploss){
                Two_Hour_Nexus.tstoplossvoid = true
            }
            else{
                Two_Hour_Nexus.tstoplossvoid = false
                Two_Hour_Nexus.volatilitydef()
                Two_Hour_Nexus.tstoplossinit()}}
    }
    /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
    static tstoplosscont(){
        if(Two_Hour_Functions.volatility() < .618 && Two_Hour_Nexus.tstoplossinits && !Two_Hour_Nexus.tstoplossvoid){
            Two_Hour_Nexus.sldiff = Two_Hour_Functions.stoploss()
            let stoploss = Two_Hour_Nexus.sldiff
            if(Two_Hour_Nexus.buy_pos){
                if(Two_Hour_Functions.price > Two_Hour_Nexus.posprice + .3*stoploss){
                    Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice + Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, .618*Two_Hour_Nexus.bigpipprice)
            }}
            if(Two_Hour_Nexus.sell_pos){
                if(Two_Hour_Functions.price < Two_Hour_Nexus.posprice - .3*stoploss){
                    Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice - Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, .618*Two_Hour_Nexus.bigpipprice)
            }}}
    }
    /** method that defines trailing stop loss for the system to begin with trailing stop loss */
    static tstoplossdef(){
        Two_Hour_Nexus.sldiff = Two_Hour_Functions.stoploss()
        let stoploss = Two_Hour_Nexus.sldiff
        if(Two_Hour_Nexus.buy_pos){
            if(Two_Hour_Functions.price > Two_Hour_Nexus.posprice + .3*stoploss){
                Two_Hour_Nexus.tstop = true
                Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice + Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, .618*Two_Hour_Nexus.bigpipprice)
            }}
        if(Two_Hour_Nexus.sell_pos){
            if(Two_Hour_Functions.price < Two_Hour_Nexus.posprice - .3*stoploss){
                Two_Hour_Nexus.tstop = true
                Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice - Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, .618*Two_Hour_Nexus.bigpipprice)
        }}}

    /*FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS!*/
    
    /** initiates a buy signal */
    static buy(){
        Two_Hour_Functions.supreslevs()
        Two_Hour_Functions.getPrice()
        Two_Hour_Functions.stoploss()
        Two_Hour_Functions.tpvariation()
        if(!Two_Hour_Functions.rejectionzoning()){
            if (Math.abs(Two_Hour_Functions.valdiff(Two_Hour_Functions.price, Two_Hour_Functions.closest(Two_Hour_Functions.price))) > .025) {
                Two_Hour_Nexus.tp = Two_Hour_Nexus.resistance
                Two_Hour_Nexus.pos = true
                Two_Hour_Nexus.buy_pos = true
                Two_Hour_Nexus.posprice = Two_Hour_Functions.price
                Two_Hour_Functions.stoploss()
                Two_Hour_Functions.tpvariation()
                console.log('pair: ' + Two_Hour_Nexus.pair)
                console.log("Open Buy Order on Two Hour")
                console.log("Entry Price: " + String(Two_Hour_Nexus.posprice))
                console.log("Stop Loss: " + String(Two_Hour_Nexus.sl))
                console.log("Target Take Profit: " + String(Two_Hour_Nexus.tp))
                console.log("Take Profit 2: " + String(Two_Hour_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static buy(){
        Two_Hour_Functions.supreslevs()
        Two_Hour_Functions.getPrice()
        Two_Hour_Nexus.tp = Two_Hour_Nexus.resistance
        Two_Hour_Nexus.pos = true
        Two_Hour_Nexus.buy_pos = true
        Two_Hour_Nexus.posprice = Two_Hour_Functions.price
                Two_Hour_Functions.stoploss()
                Two_Hour_Functions.tpvariation()
                Two_Hour_Functions.tpvariation()
        console.log("Open Buy Order")
        console.log(Two_Hour_Nexus.sl + " : Stop Loss")
        console.log(Two_Hour_Nexus.tp + " : Target Take Profit")
        } */

    /** initiates a sell order */
    static sell(){
        Two_Hour_Functions.supreslevs()
        Two_Hour_Functions.getPrice()
        Two_Hour_Functions.stoploss()
        Two_Hour_Functions.tpvariation()
        if(!Two_Hour_Functions.rejectionzoning()){
            if (Math.abs(Two_Hour_Functions.valdiff(Two_Hour_Functions.price, Two_Hour_Functions.closest(Two_Hour_Functions.price))) > .025) {
                Two_Hour_Nexus.tp = Two_Hour_Nexus.support
                Two_Hour_Nexus.pos = true
                Two_Hour_Nexus.sell_pos = true
                Two_Hour_Nexus.posprice = Two_Hour_Functions.price
                Two_Hour_Functions.stoploss()
                Two_Hour_Functions.tpvariation()
                console.log('pair: ' + Two_Hour_Nexus.pair)
                console.log("Open Sell Order on Two Hour")
                console.log("Entry Price: " + String(Two_Hour_Nexus.posprice))
                console.log("Stop Loss: " + String(Two_Hour_Nexus.sl))
                console.log("Target Take Profit: " + String(Two_Hour_Nexus.tp))
                console.log("Take Profit 2: " + String(Two_Hour_Nexus.tptwo))
            fs.writeFileSync('trade.json', JSON.stringify('true'))}}}

    /*static sell(){
        Two_Hour_Functions.supreslevs()
        Two_Hour_Functions.getPrice()
        Two_Hour_Nexus.tp = Two_Hour_Nexus.support
        Two_Hour_Nexus.pos = true
        Two_Hour_Nexus.sell_pos = true
        Two_Hour_Nexus.posprice = Two_Hour_Functions.price
                Two_Hour_Functions.stoploss()
                Two_Hour_Functions.tpvariation()
                Two_Hour_Functions.tpvariation()
        console.log("Open Sell Order")
        console.log(Two_Hour_Nexus.sl + " : Stop Loss")
        console.log(Two_Hour_Nexus.tp + " : Target Take Profit")
        }*/

    /** checks for price movement in lower periods to get better idea of the trend */
    static controlSmallerPeriod(){
        /*Confirm Trend w/ indicators and price movement*/
        One_Hour_Functions.HistoryAssigner()
        Thirty_Min_Functions.HistoryAssigner()
        Daily_Functions.HistoryAssigner()
        Fifteen_Min_Functions.HistoryAssigner()
        Two_Hour_Functions.stoploss()
        Two_Hour_Functions.tpvariation()
        let buy = false
        let sell = false
        if(!Four_Hour_Functions.rejectionzoning() && 
            !Thirty_Min_Functions.consolidationtwo() && !Fifteen_Min_Functions.consolidationtwo()){
                if(Daily_Functions.trend() && One_Hour_Functions.ema()){
                    if(One_Hour_Functions.trend() && One_Hour_Functions.macd() && One_Hour_Functions.obv()){
                        if(Thirty_Min_Functions.ema()){
                            if(Thirty_Min_Functions.rsi() && Thirty_Min_Functions.obv()){
                                buy = true}}}}
                if(!Daily_Functions.trend() && !One_Hour_Functions.ema()){
                    if(!One_Hour_Functions.trend() && !One_Hour_Functions.macd() && !One_Hour_Functions.obv()){
                        if(!Thirty_Min_Functions.ema()){
                            if(!Thirty_Min_Functions.rsi() && !Thirty_Min_Functions.obv()){
                                sell = true}}}}}
        return [buy, sell]
    }
    /** checks for support and resistance levels in larger time periods to get a better idea of possible consolidation/reversal points */
    static controlBiggerPeriod(){
        /*Price Zones*/
        Daily_Functions.ValueAssigner()
        Weekly_Functions.ValueAssigner()
        Four_Hour_Functions.ValueAssigner()
        Daily_Functions.HistoryAssigner()
        Weekly_Functions.HistoryAssigner()
        Four_Hour_Functions.HistoryAssigner()
        Daily_Functions.priceZones()
        Four_Hour_Functions.priceZones()
        Weekly_Functions.priceZones()
        let h = new Array();
        h = Daily_Functions.finlevs
        let i = Weekly_Functions.finlevs
        let q = Four_Hour_Functions.finlevs
        q.push(i)
        let totallevs = h.push(q)
        Two_Hour_Nexus.biggersupres = totallevs
        Two_Hour_Nexus.finlevs.concat(totallevs)
    }
    /** main control method, takes control of the entire program and serves as the brain */
    static controlMain(){
        Four_Hour_Functions.rejecinit()
        Two_Hour_Functions.rejecinit()
        Two_Hour_Functions.HistoryAssigner()
        Two_Hour_Functions.ValueAssigner()
        Two_Hour_Functions.stoploss()
        Two_Hour_Functions.getPrice()
        Two_Hour_Functions.supreslevs()
        Two_Hour_Nexus.controlBiggerPeriod()
        if (!Two_Hour_Functions.consolidationtwo() && Two_Hour_Functions.overall() && !Two_Hour_Functions.consolidation()
            && !Two_Hour_Functions.keylev()){
                if (Two_Hour_Functions.ema()){
                    if (Two_Hour_Nexus.controlSmallerPeriod()[0] == true){
                        if (Two_Hour_Functions.trend() && Two_Hour_Functions.rsi() 
                            && Two_Hour_Functions.macd() && Two_Hour_Functions.roc() && Two_Hour_Functions.obv()) {
                                if (!Two_Hour_Nexus.pos){
                                    if (!Two_Hour_Nexus.buy_pos)
                                        Two_Hour_Nexus.pot_buy = true
                                        Two_Hour_Functions.stoploss()
                                        Two_Hour_Nexus.piploginit()
                                        Two_Hour_Nexus.buy()}}}}
                if (!Two_Hour_Functions.ema()){
                    if (Two_Hour_Nexus.controlSmallerPeriod()[1] == true){
                        if (!Two_Hour_Functions.trend() && !Two_Hour_Functions.rsi() 
                            && !Two_Hour_Functions.macd() && !Two_Hour_Functions.roc() && !Two_Hour_Functions.obv()) {
                                if (!Two_Hour_Nexus.pos){
                                    if (!Two_Hour_Nexus.sell_pos)
                                        Two_Hour_Nexus.pot_sell = true
                                        Two_Hour_Functions.stoploss()
                                        Two_Hour_Nexus.piploginit()
                                        Two_Hour_Nexus.sell()}}}}}
        if (Two_Hour_Nexus.pos && Two_Hour_Nexus.buy_pos){
            Two_Hour_Nexus.piplogger()
            Two_Hour_Nexus.stopLossBuy()
            Two_Hour_Nexus.tstoplosscheck()
            Two_Hour_Nexus.tstoplosscont()
            Two_Hour_Nexus.takeProfitBuy()}
        if (Two_Hour_Nexus.pos && Two_Hour_Nexus.sell_pos){
            Two_Hour_Nexus.piplogger()
            Two_Hour_Nexus.stopLossSell()
            Two_Hour_Nexus.tstoplosscheck()
            Two_Hour_Nexus.tstoplosscont()
            Two_Hour_Nexus.takeProfitSell()}
        Two_Hour_Functions.rejecsave()
        Four_Hour_Functions.rejecsave()
        /*figure out how to clear memory, and do so here after every iteration*/
        /*memory issue solved: 4/20/22 */}

    /** close position method for taking profit, and gives pip count and win/loss ratio */
    static closePosTP(){
        if (Two_Hour_Nexus.pos){
            if (Two_Hour_Nexus.buy_pos){
                Two_Hour_Nexus.buy_pos = false
                Two_Hour_Nexus.pos = false
                Two_Hour_Nexus.tstop = false
                Two_Hour_Nexus.tstoplossinits = false
                Two_Hour_Nexus.tstoplossvoid = false
                Two_Hour_Nexus.pchan = false
                Two_Hour_Nexus.pot_buy = false
                Two_Hour_Nexus.pzone = false
                Two_Hour_Nexus.wins += 1
                Two_Hour_Nexus.trades += 1
                Two_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = Two_Hour_Functions.pipCountBuy(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
                Two_Hour_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + Two_Hour_Nexus.pair)
                console.log("Take Profit Hit on Two Hour")
                console.log(Two_Hour_Nexus.wins + " Wins and     " + Two_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Two_Hour_Nexus.wins/Two_Hour_Nexus.trades)
                console.log("Pip Count: " + Two_Hour_Nexus.pips)}
            if (Two_Hour_Nexus.sell_pos){
                Two_Hour_Nexus.sell_pos = false
                Two_Hour_Nexus.pos = false
                Two_Hour_Nexus.tstop = false
                Two_Hour_Nexus.pot_sell = false
                Two_Hour_Nexus.tstoplossinits = false
                Two_Hour_Nexus.tstoplossvoid = false
                Two_Hour_Nexus.pchan = false
                Two_Hour_Nexus.pzone = false
                Two_Hour_Nexus.wins += 1
                Two_Hour_Nexus.trades += 1
                Two_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = Two_Hour_Functions.pipCountSell(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
                Two_Hour_Nexus.pips += Math.abs(pipchange)
                console.log('pair: ' + Two_Hour_Nexus.pair)
                console.log("Take Profit Hit on Two Hour")
                console.log(Two_Hour_Nexus.wins + " Wins and     " + Two_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Two_Hour_Nexus.wins/Two_Hour_Nexus.trades)
                console.log("Pip Count: " + Two_Hour_Nexus.pips)}}}

    /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
    static closePosSL(){
        if (Two_Hour_Nexus.pos){
            if (Two_Hour_Nexus.sell_pos){
                Two_Hour_Nexus.sell_pos = false
                Two_Hour_Nexus.pos = false
                Two_Hour_Nexus.tstop = false
                Two_Hour_Nexus.pot_sell = false
                Two_Hour_Nexus.tstoplossinits = false
                Two_Hour_Nexus.tstoplossvoid = false
                Two_Hour_Nexus.pchan = false
                Two_Hour_Nexus.pzone = false
                Two_Hour_Nexus.losses += 1
                Two_Hour_Nexus.trades += 1
                Two_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = Two_Hour_Functions.pipCountSell(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
                Two_Hour_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + Two_Hour_Nexus.pair)
                console.log("Stop Loss Hit on Two Hour")
                console.log(Two_Hour_Nexus.wins + " Wins and     " + Two_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Two_Hour_Nexus.wins/Two_Hour_Nexus.trades)
                console.log("Pip Count" + Two_Hour_Nexus.pips)}
            if (Two_Hour_Nexus.buy_pos){
                Two_Hour_Nexus.buy_pos = false
                Two_Hour_Nexus.pos = false
                Two_Hour_Nexus.pot_buy = false
                Two_Hour_Nexus.tstop = false
                Two_Hour_Nexus.tstoplossinits = false
                Two_Hour_Nexus.tstoplossvoid = false
                Two_Hour_Nexus.pchan = false
                Two_Hour_Nexus.pzone = false
                Two_Hour_Nexus.losses += 1
                Two_Hour_Nexus.trades += 1
                Two_Hour_Nexus.piplog = [0, 0, 0]
                let pipchange = Two_Hour_Functions.pipCountBuy(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
                Two_Hour_Nexus.pips -= Math.abs(pipchange)
                console.log('pair: ' + Two_Hour_Nexus.pair)
                console.log("Stop Loss Hit on Two Hour")
                console.log(Two_Hour_Nexus.wins + " Wins and     " + Two_Hour_Nexus.losses + " Losses")
                console.log("Win Ratio: " + Two_Hour_Nexus.wins/Two_Hour_Nexus.trades)
                console.log("Pip Count" + Two_Hour_Nexus.pips)}}}
}

class Two_Hour_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    vals = []
    timeperiods = {}
    price = 0
    support = 0
    resistance = 0
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
        Two_Hour_Nexus.pair = dataspecific   
        return dataspecific
    }
/** load historical prices from json file */
    static HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        let rawfour = fs.readFileSync('DataExtend.json')
        let rawfive= fs.readFileSync('HighExtend.json')
        let rawsix = fs.readFileSync('LowExtend.json')
        let dataspecific = undefined
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(raw)
                dataspecific = data[instrument]['Two_Hour']
            Two_Hour_Functions.priceHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawtwo)
                dataspecific = data[instrument]['Two_Hour']
            Two_Hour_Functions.highs = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawthree)
                dataspecific = data[instrument]['Two_Hour']
            Two_Hour_Functions.lows = dataspecific
        }}catch (error) {}
        dataspecific = undefined

        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawfour)
                dataspecific = data[instrument]['Two_Hour']
            Two_Hour_Functions.extendHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined

        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawfive)
                dataspecific = data[instrument]['Two_Hour']
            Two_Hour_Functions.extendHigh = dataspecific
        }}catch (error) {}
        dataspecific = undefined

        try{
            while (dataspecific === undefined){
            let data = JSON.parse(rawsix)
            dataspecific = data[instrument]['Two_Hour']
            Two_Hour_Functions.extendLow = dataspecific
        }}catch (error) {}
        let lens = []
        lens.push(Two_Hour_Functions.priceHist.length)
        lens.push(Two_Hour_Functions.highs.length)
        lens.push(Two_Hour_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Two_Hour_Functions.priceHist, Two_Hour_Functions.highs, Two_Hour_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Two_Hour_Functions.priceHist){
                    for(let item = 0; item < (Two_Hour_Functions.priceHist.length - minlens); item++){
                        Two_Hour_Functions.priceHist.splice(0,1)
                    }
                if (items == Two_Hour_Functions.lows){
                    for(let item = 0; item < (Two_Hour_Functions.lows.length - minlens); item++){
                        Two_Hour_Functions.lows.splice(0,1)
                    }
                if (items == Two_Hour_Functions.highs){
                    for(let item = 0; item < (Two_Hour_Functions.highs.length - minlens); item++){
                        Two_Hour_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(Two_Hour_Functions.extendHist.length)
        lens.push(Two_Hour_Functions.extendHigh.length)
        lens.push(Two_Hour_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [Two_Hour_Functions.extendHist, Two_Hour_Functions.extendHigh, Two_Hour_Functions.extendLow]
        for (items in lists){
            if (items.length > minlens){
                if (items == Two_Hour_Functions.extendHist){
                    for(let item = 0; item < (Two_Hour_Functions.extendHist.length - minlens); item++){
                        Two_Hour_Functions.extendHist.splice(0,1)
                    }
                if (items == Two_Hour_Functions.extendLow){
                    for(let item = 0; item < (Two_Hour_Functions.extendLow.length - minlens); item++){
                        Two_Hour_Functions.extendLow.splice(0,1)
                    }
                if (items == Two_Hour_Functions.extendHigh){
                    for(let item = 0; item < (Two_Hour_Functions.extendHigh.length - minlens); item++){
                        Two_Hour_Functions.extendHigh.splice(0,1)
                    }}}}}}}
                
/** load price from json file */
    static ValueAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            Two_Hour_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
/** second consolidation method, meant to strengthen consolidation identification */
    static consolidationtwo(){
        let history = Two_Hour_Functions.priceHist
        let highs = Two_Hour_Functions.highs
        let lows = Two_Hour_Functions.lows
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
        let tp = Two_Hour_Nexus.tp
        let values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        let closesttp = 0
        let filteredvaldiff = []
        let nexttp = 0
        let referenceval = 0
        let num1 = Two_Hour_Nexus.price
        let volval = Two_Hour_Functions.volatility()
        if(Two_Hour_Nexus.buy_pos){
            for(let item = 0; item < values.length; item++){
                if (num1 < values[item]) {
                    valdiffgreater.push(Math.abs(num1-values[item]))}}
            closesttp = Two_Hour_Nexus.tp
            filteredvaldiff = [...new Set(valdiffgreater)]
            for(const valuers in filteredvaldiff){
                referenceval = closesttp - num1
                if ((referenceval >= valuers)){
                    filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                }
            }
            if(volval > .618){
                Two_Hour_Nexus.tp = Two_Hour_Functions.price+(Math.abs(Two_Hour_Functions.price-Two_Hour_Nexus.tp)*1.382)
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)){
                        nexttp = Two_Hour_Functions.price+(Math.abs(Two_Hour_Functions.price-Math.min(...filteredvaldiff))*1.382)
                }else{
                    nexttp = Two_Hour_Functions.price + ((Two_Hour_Nexus.tp-Two_Hour_Functions.price)*1.618)
    
                }
            }else{
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)){
                    nexttp = Two_Hour_Functions.price+Math.min(...filteredvaldiff)
                }else{
                    nexttp = Two_Hour_Functions.price + ((Two_Hour_Functions.tp - Two_Hour_Functions.price)*1.382)
                }}}
        if(Two_Hour_Nexus.sell_pos){
            for(let item = 0; item < values.length; item++){
                if (num1 > values[item]) {
                    valdiffless.push(Math.abs(num1-values[item]))}}
            closesttp = Two_Hour_Nexus.tp
            filteredvaldiff = [...new Set(valdiffless)]
            for(const valuers in filteredvaldiff){
                referenceval = num1 - closesttp
                if ((referenceval >= valuers)){
                    filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
                    
                }
            }
            if(volval > .618){
                Two_Hour_Nexus.tp = Two_Hour_Functions.price-(Math.abs(Two_Hour_Functions.price-Two_Hour_Nexus.tp)*1.382)
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)){
                        nexttp = Two_Hour_Functions.price-(Math.abs(Two_Hour_Functions.price-Math.min(...filteredvaldiff))*1.382)
                }else{
                    nexttp = Two_Hour_Functions.price - ((Two_Hour_Functions.price - Two_Hour_Nexus.tp)*1.618)
    
                }
            }else{
                if(Number.isFinite(Math.min(...filteredvaldiff)) &&  Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0
                    && !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)){
                    nexttp = Two_Hour_Functions.price+Math.min(...filteredvaldiff)
                }else{
                    nexttp = Two_Hour_Functions.price - ((Two_Hour_Functions.price - Two_Hour_Nexus.tp)*1.382)
                }}}
        Two_Hour_Nexus.tptwo = nexttp
        }

    /**fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
    static fib(){
        let recents = Two_Hour_Functions.recentHisto
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
        let currentprice = Two_Hour_Functions.price
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
        let instrument = Two_Hour_Functions.instrument_name()
        if(!fs.existsSync('./Rejection_Archive/'+String(instrument)+'.json')){
            Two_Hour_Functions.timeperiods = {}
            Two_Hour_Functions.timeperiods['Fifteen_Min'] = [0, 0, 0]
            Two_Hour_Functions.timeperiods['Thirty_Min'] = [0, 0, 0]
            Two_Hour_Functions.timeperiods['One_Hour'] = [0, 0, 0]
            Two_Hour_Functions.timeperiods['Two_Hour'] = [0, 0, 0]
            Two_Hour_Functions.timeperiods['Four_Hour'] = [0, 0, 0]
            Two_Hour_Functions.timeperiods['Daily'] = [0, 0, 0]
            Two_Hour_Functions.timeperiods['Weekly'] = [0, 0, 0]
            fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Two_Hour_Functions.timeperiods, null, 2))
        }
        let raw = fs.readFileSync('./Rejection_Archive/'+String(instrument)+'.json')
        Two_Hour_Functions.timeperiods = JSON.parse(raw)
        Two_Hour_Functions.rejectionzones = JSON.parse(raw)['Two_Hour']
    }
    /** Rejection Zone Saver */
    static rejecsave(){
        let instrument = Two_Hour_Functions.instrument_name()
        Two_Hour_Functions.rejectionzones = [...new Set(Two_Hour_Functions.rejectionzones)]
        Two_Hour_Functions.timeperiods['Two_Hour'] = Two_Hour_Functions.rejectionzones
        fs.writeFileSync('./Rejection_Archive/'+String(instrument)+'.json', JSON.stringify(Two_Hour_Functions.timeperiods, null, 2))
    }

    /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition*/
    static overall(){
        let extendedhistory = Two_Hour_Functions.extendHist
        Two_Hour_Functions.rejectionzones = [0, 0, 0]
        let price = Two_Hour_Functions.price
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
        let result = Two_Hour_Functions.analysis(studylist, extendedhistory, pricerange)
        return result
    }
    /** Do past Analysis to see if this is a good trade, based on static overall() method */
    static analysis(cases, extendedhistory, pricerange){
        let histnorm = Two_Hour_Functions.priceHist
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
                    Two_Hour_Functions.rejectionzones.push(fractals[0])
                }else{
                    let frac = fractals[val]
                    Two_Hour_Functions.rejectionzones.push(extendedhistory[frac])
            }}}
        if(Two_Hour_Functions.rejectionzones.length < 1){
            Two_Hour_Functions.rejectionzones.push(Two_Hour_Functions.price)
        }
        if(rejection > 2){
            return false
        }else{
            return true
        }
        
    }

    /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
    static rejectionzoning(){
        Two_Hour_Functions.overall()
        let rejects = Two_Hour_Functions.rejectionzones
        let diffs = []
        for(const val in rejects){
            if(Two_Hour_Nexus.pot_buy){
                if(Two_Hour_Functions.price < val){
                    diffs.push(val - Two_Hour_Functions.price)}}
            if(Two_Hour_Nexus.pot_sell){
                if(Two_Hour_Functions.price > val){
                    diffs.push(Two_Hour_Functions.price - val)}}
        }

        if(Math.abs(Math.min(...diffs)) < Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.tp)){
            Two_Hour_Nexus.pot_buy = false
            Two_Hour_Nexus.pot_sell = false
            return true
        }else{
            return false
        }
    }
/** return price */
    static getPrice(){
        return Two_Hour_Functions.price}
/** return historical price */
    static priceHistory(){
        return Two_Hour_Functions.priceHist}
/** find whether trend is going up or down */
    static trend(){
        let history = Two_Hour_Functions.priceHist
        if (history[history.length-1] > history[history.length-2] && history[history.length-2] > history[history.length-3])
            return true
        if (history[history.length-1] < history[history.length-2] && history[history.length-2] < history[history.length-3])
            return false
    }
/** recent history, shortens history array into last 50 digits for different analyses */
    static recentHist(){
        let history = Two_Hour_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 50; x++)
            historytwo.push(history.splice(-1,1)[0])
        Two_Hour_Functions.recentHisto = historytwo.reverse()
    }
/** determination of stop loss size */
    static stoploss(){
        var highs = Two_Hour_Functions.highs
        var lows = Two_Hour_Functions.lows
        var diff = []
        var totaldiff = 0
        var finaldiff = 0
        for(let variables = 0; variables < 30; variables++){
            diff.push(Math.abs(highs[highs.length-1-variables]-lows[lows.length-1-variables]))}
        for(let variables = 0; variables < diff.length; variables++){
            totaldiff += diff[variables]}
        if(Two_Hour_Functions.volatility() > .618){
            finaldiff = (totaldiff/30)*1.382}
        else{
            finaldiff = (totaldiff/30)
        }
        let slceil = 0
        let slfloor = 0
        let numbuy = 0
        let newsl = 0
        if(Two_Hour_Nexus.pot_buy){
            let diffprice = Two_Hour_Functions.price - finaldiff
            if(!Number.isFinite(Two_Hour_Functions.closesttwo(diffprice)[0])){
                slfloor = Two_Hour_Functions.price - (finaldiff*3.618)
                newsl = slfloor
            }else{
                numbuy = Two_Hour_Functions.closesttwo(diffprice)[0]
                if(!Number.isFinite(Two_Hour_Functions.closesttwo(numbuy)[0])){
                    newsl = diffprice-(.786*(diffprice-numbuy))
                }else{
                    slfloor = (Two_Hour_Functions.price-((Two_Hour_Functions.price - Two_Hour_Functions.closesttwo(numbuy)[0])*1.618*.786))
                    newsl = slfloor
                }}
            Two_Hour_Nexus.sl = newsl
        }if(Two_Hour_Nexus.pot_sell){
            let diffprice = finaldiff + Two_Hour_Functions.price
            if(!Number.isFinite(Two_Hour_Functions.closesttwo(diffprice)[1])){
                slceil = Two_Hour_Functions.price + (finaldiff*3.618)
                newsl = slceil
            }else{
                numbuy = Two_Hour_Functions.closesttwo(diffprice)[1]
                if(!Number.isFinite(Two_Hour_Functions.closesttwo(numbuy)[1])){
                    newsl = diffprice+(.786*(numbuy-diffprice))
                }else{
                    slceil = (Two_Hour_Functions.price+((Math.abs(Two_Hour_Functions.price - Two_Hour_Functions.closesttwo(numbuy)[1]))*1.618*.786))
                    newsl = slceil
                }}
            Two_Hour_Nexus.sl = newsl
            }
        return finaldiff
        }
    /** finds closest support and resistance level to whatever price u put in */
    static closesttwo(num1){
    let values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
    let valdiffgreater = []
    let valdiffless = []
    for(let item = 0; item < values.length; item++){
        if (num1 < values[item]) {
            valdiffgreater.push(Math.abs(num1-values[item]))}
        if (num1 > values[item]) {
            valdiffless.push(Math.abs(num1-values[item]))}}
    let closestbelow = Two_Hour_Functions.price-Math.min(...valdiffless)
    let closestabove = Two_Hour_Functions.price+Math.min(...valdiffgreater)
    let closests = [closestbelow, closestabove]
    return closests
    }
/** price zones, meant to determine whether a price zone has been found or not */
    static priceZones(){
        Two_Hour_Functions.supreslevs()
        if(Math.abs((Two_Hour_Functions.pipCountBuy(Two_Hour_Functions.price,Two_Hour_Nexus.resistance))
            )/(Math.abs(Two_Hour_Functions.pipCountBuy(Math.max(...Two_Hour_Functions.priceHist),Math.min(...Two_Hour_Functions.priceHist)))) < .1){
            return true
        }else if(Math.abs((Two_Hour_Functions.pipCountBuy(Two_Hour_Functions.price,Two_Hour_Nexus.support))
            )/(Math.abs(Two_Hour_Functions.pipCountBuy(Math.max(...Two_Hour_Functions.priceHist),Math.min(...Two_Hour_Functions.priceHist)))) < .1){
            return true
        }else{
            return false
        }
    }
/** keylev, meant to determine the closest keylevel to the current price */
    static keylev(){
        Two_Hour_Functions.getPrice()
        if(Two_Hour_Functions.valdiff(Two_Hour_Functions.price, Two_Hour_Functions.closest(Two_Hour_Functions.price)) < .1){
            return true}
        else{
            return false}}
/**volatility, meant to determine whether or not price movement is too volatile for current parameters */
    static volatility(){
        let history = Two_Hour_Functions.priceHist
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
        var factor = Two_Hour_Functions.volatility()
        let history = Two_Hour_Functions.priceHist
        let ceiling = Math.max(...history)
        let floor = Math.min(...history)
        let diffy = ceiling - floor
        let posdiff = Math.abs(Two_Hour_Nexus.posprice - Two_Hour_Functions.price)
        let deci = posdiff/diffy
        let input = deci*6.18
        var equation = (1-factor)*(((input*input)+input)/((input*input)+input+1))
        return equation
    }
/**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
    static priceChannels(){
        let rvalues = Two_Hour_Functions.regression()
        if ((rvalues[0]*rvalues[0]) > .8 && (rvalues[1]*rvalues[1]) > .8) {
            return true
        }
        else{
            return false
        }
    }
/** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now*/
    static consolidation(){
        if (Two_Hour_Functions.volatility() > .618){
            return false
        }else{
            return true
        }
    }
/** used to determine slope between two points */
    static slopes(){
        Two_Hour_Functions.recentHist()
        let recentHistory = Two_Hour_Functions.recentHisto
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
        Two_Hour_Functions.recentHist()
        let recentHistory = Two_Hour_Functions.recentHisto
        let slope = Two_Hour_Functions.slopes()
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
        Two_Hour_Functions.maxes = maxes
        Two_Hour_Functions.mins = mins
    }
/** used to determine regression lines (moving averages, for example) */
    static regression(){
        Two_Hour_Functions.maxes_mins()
        const x = []
        let length = Two_Hour_Functions.maxes.length
        for(let value = 0; value < length; value++)
            x.push(value)
        const y = Two_Hour_Functions.maxes
        const regressions = new regression.SimpleLinearRegression(x, y);
        const xtwo = []
        let lengthtwo = Two_Hour_Functions.mins.length
        for(let value = 0; value < lengthtwo; value++)
            xtwo.push(value)
        const ytwo = Two_Hour_Functions.mins
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
        let history = Two_Hour_Functions.priceHist
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
        let price = Two_Hour_Functions.getPrice()
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
            if (Math.abs(Two_Hour_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Two_Hour_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Two_Hour_Functions.pipreverse(price, Two_Hour_Functions.pipdiffy(price, Two_Hour_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Two_Hour_Functions.pipreverse(price, Two_Hour_Functions.pipdiffy(price, Two_Hour_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        Two_Hour_Nexus.support = support
        Two_Hour_Nexus.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        Two_Hour_Nexus.finlevs = finalLevs
    }
    /** self explanatory, finds RSI and compares the last two */
    static rsi(){
        let history = Two_Hour_Functions.priceHist
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
        let history = Two_Hour_Functions.priceHist
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
        let history = Two_Hour_Functions.priceHist
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
        let history = Two_Hour_Functions.priceHist
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
        let history = Two_Hour_Functions.priceHist
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
            Two_Hour_Functions.multiplier = 1000
        }else if(String(num1).indexOf('.') == 3){
            Two_Hour_Functions.multiplier = 100
        }else if(String(num1).indexOf('.') == 4){
            Two_Hour_Functions.multiplier = 10
        }else if(String(num1).indexOf('.') == 5){
            Two_Hour_Functions.multiplier = 1
        }else if(String(num1).indexOf('.') == 5){
            Two_Hour_Functions.multiplier = .1
        }else if(String(num1).indexOf('.') == 6){
            Two_Hour_Functions.multiplier = .01
        }else if(String(num1).indexOf('.') == 7){
            Two_Hour_Functions.multiplier = .001
        }else if(String(num1).indexOf('.') == 8){
            Two_Hour_Functions.multiplier = .0001
        }else if(String(num1).indexOf('.') == 9){
            Two_Hour_Functions.multiplier = .00001
        }else if(String(num1).indexOf('.') == 10){
            Two_Hour_Functions.multiplier = .000001
        }else{Two_Hour_Functions.multiplier = 10000}
        num1 *= Two_Hour_Functions.multiplier
        num2 *= Two_Hour_Functions.multiplier
        return [num1, num2]}
/** pip converter */
    static pipreverse(num, num2){
        if(String(num).indexOf('.') == 2) {
            Two_Hour_Functions.multiplier = .001
        }else if(String(num).indexOf('.') == 3){
            Two_Hour_Functions.multiplier = .01
        }else if(String(num).indexOf('.') == 4){
            Two_Hour_Functions.multiplier = .1
        }else if(String(num).indexOf('.') == 5){
            Two_Hour_Functions.multiplier = 1
        }else if(String(num).indexOf('.') == 5){
            Two_Hour_Functions.multiplier = 10
        }else if(String(num).indexOf('.') == 6){
            Two_Hour_Functions.multiplier = 100
        }else if(String(num).indexOf('.') == 7){
            Two_Hour_Functions.multiplier = 1000
        }else if(String(num).indexOf('.') == 8){
            Two_Hour_Functions.multiplier = 10000
        }else if(String(num).indexOf('.') == 9){
            Two_Hour_Functions.multiplier = 100000
        }else if(String(num).indexOf('.') == 10){
            Two_Hour_Functions.multiplier = 1000000
        }else{Two_Hour_Functions.multiplier = .0001}
        num2 *= Two_Hour_Functions.multiplier
        return(num2)}

    static instrument_switcher(instrument){
    }

    /* sets value difference as a decimal-percentage of floor to ceiling*/
    /** gets value difference for normalization of data points */
    static valdiff(num1, num2){
        let history = Two_Hour_Functions.priceHist
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
            Two_Hour_Functions.multiplier = 1000
        } else if (String(price).indexOf('.') == 3) {
            Two_Hour_Functions.multiplier = 100
        } else if (String(price).indexOf('.') == 4) {
            Two_Hour_Functions.multiplier = 10
        } else if (String(price).indexOf('.') == 5) {
            Two_Hour_Functions.multiplier = 1
        } else if (String(price).indexOf('.') == 5) {
            Two_Hour_Functions.multiplier = .1
        } else if (String(price).indexOf('.') == 6) {
            Two_Hour_Functions.multiplier = .01
        } else if (String(price).indexOf('.') == 7) {
            Two_Hour_Functions.multiplier = .001
        } else if (String(price).indexOf('.') == 8) {
            Two_Hour_Functions.multiplier = .0001
        } else if (String(price).indexOf('.') == 9) {
            Two_Hour_Functions.multiplier = .00001
        } else if (String(price).indexOf('.') == 10) {
            Two_Hour_Functions.multiplier = .000001
        } else {
            Two_Hour_Functions.multiplier = 10000
        }
        return num1*Two_Hour_Functions.multiplier
    }

    /** finds closest support and resistance level to whatever price u put in */
    static closest(num1){
        let values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
        let valdiffgreater = []
        let valdiffless = []
        for(let item = 0; item < values.length; item++){
            if (num1 < values[item]) {
                valdiffgreater.push(Math.abs(num1-values[item]))}
            if (num1 > values[item]) {
                valdiffless.push(Math.abs(num1-values[item]))}}
        let closestbelow = Two_Hour_Functions.price-Math.min(...valdiffless)
        let closestabove = Two_Hour_Functions.price+Math.min(...valdiffgreater)
        let closests = [closestbelow, closestabove]
        return Math.min(...closests)
    }
    /** Counts pips between two values for buying */
    static pipCountBuy(num1, num2){
        let nums
        nums = Two_Hour_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}
        
    /** Counts pips between two values for selling */
    static pipCountSell(num1, num2){
        let nums
        nums = Two_Hour_Functions.pip(num1, num2)
        return(nums[0] - nums[1])}

}

class Four_Hour_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    support = 0
    resistance = 0
    timeperiods = {}
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
        Two_Hour_Nexus.pair = dataspecific   
        return dataspecific
    }
/** load historical prices from json file */
   static HistoryAssigner(){
        let instrument = Four_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        let rawfour = fs.readFileSync('DataExtend.json')
        let rawfive= fs.readFileSync('HighExtend.json')
        let rawsix = fs.readFileSync('LowExtend.json')
        let dataspecific = undefined
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(raw)
                dataspecific = data[instrument]['Four_Hour']
            Four_Hour_Functions.priceHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawtwo)
                dataspecific = data[instrument]['Four_Hour']
            Four_Hour_Functions.highs = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawthree)
                dataspecific = data[instrument]['Four_Hour']
            Four_Hour_Functions.lows = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawfour)
                dataspecific = data[instrument]['Four_Hour']
            Four_Hour_Functions.extendHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        
        try{
            while (dataspecific === undefined){
                let data = JSON.parse(rawfive)
                dataspecific = data[instrument]['Four_Hour']
            Four_Hour_Functions.extendHigh = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        
        try{
            while (dataspecific === undefined){
            let data = JSON.parse(rawsix)
            dataspecific = data[instrument]['Four_Hour']
            Four_Hour_Functions.extendLow = dataspecific
        }}catch (error) {}
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
                    }}}}}}}
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
        let instrument = Two_Hour_Functions.instrument_name()
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
        let instrument = Two_Hour_Functions.instrument_name()
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
            if(Two_Hour_Nexus.pot_buy){
                if(Four_Hour_Functions.price < val){
                    diffs.push(val - Four_Hour_Functions.price)}}
            if(Two_Hour_Nexus.pot_sell){
                if(Four_Hour_Functions.price > val){
                    diffs.push(Four_Hour_Functions.price - val)}}
        }
        if(Math.abs(Math.min(...diffs)) < Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.tp)){
            Two_Hour_Nexus.pot_buy = false
            Two_Hour_Nexus.pot_sell = false
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
        let posdiff = Math.abs(Two_Hour_Nexus.posprice - Four_Hour_Functions.price)
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
        let values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
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

class Daily_Functions{

    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    maxes = []
    mins = []
    support = 0
    resistance = 0
    recentHisto = []
    resistance = 0
    support = 0
    finlevs = []
    highs = []
    lows = []

    static HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        let dataspecific = undefined
        try{
            while(dataspecific === undefined){
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]['Daily']
            Daily_Functions.priceHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while(dataspecific === undefined){
            let data = JSON.parse(rawtwo)
            let dataspecific = data[instrument]['Daily']
            Daily_Functions.highs = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while(dataspecific === undefined){
            let data = JSON.parse(rawthree)
            let dataspecific = data[instrument]['Daily']
            Daily_Functions.lows = dataspecific
        }}catch (error) {}
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
        }

    static ValueAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
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
            if (Math.abs(Two_Hour_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Two_Hour_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Two_Hour_Functions.pipreverse(price, Two_Hour_Functions.pipdiffy(price, Two_Hour_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Two_Hour_Functions.pipreverse(price, Two_Hour_Functions.pipdiffy(price, Two_Hour_Functions.stoploss())))}
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

class Weekly_Functions{

    multiplier = 0
    priceHist = []
    vals = []
    price = 0
    support = 0
    resistance = 0
    maxes = []
    mins = []
    recentHisto = []
    finlevs = []
    support = 0
    resistance = 0
    highs = []
    lows = []
    

    static HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        let dataspecific = undefined
        try{
            while(dataspecific === undefined){
                let data = JSON.parse(raw)
                let dataspecific = data[instrument]['Weekly']
            Weekly_Functions.priceHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while(dataspecific === undefined){
                let data = JSON.parse(rawtwo)
                let dataspecific = data[instrument]['Weekly']
            Weekly_Functions.highs = dataspecific
        }}catch (error) {}
        dataspecific = undefined

        try{
            while(dataspecific == undefined){
            let data = JSON.parse(rawthree)
            let dataspecific = data[instrument]['Weekly']
            Weekly_Functions.lows = dataspecific
        }}catch (error) {}
        let lens = []
        lens.push(Weekly_Functions.priceHist.length)
        lens.push(Weekly_Functions.highs.length)
        lens.push(Weekly_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Weekly_Functions.priceHist, Weekly_Functions.highs, Weekly_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Weekly_Functions.priceHist){
                    for(let item = 0; item < (Weekly_Functions.priceHist.length - minlens); item++){
                        Weekly_Functions.priceHist.splice(0,1)
                    }
                if (items == Weekly_Functions.lows){
                    for(let item = 0; item < (Weekly_Functions.lows.length - minlens); item++){
                        Weekly_Functions.lows.splice(0,1)
                    }
                if (items == Weekly_Functions.highs){
                    for(let item = 0; item < (Weekly_Functions.highs.length - minlens); item++){
                        Weekly_Functions.highs.splice(0,1)
                    }}}}}}}
        

    static ValueAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            Weekly_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
    /* make  function */
    /* let data = request() */
    static getPrice(){
        return Weekly_Functions.price}

    static priceHistory(){
        return Weekly_Functions.priceHist}

    static recentHist(){
        let history = Weekly_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 30; x++)
            historytwo.push(history.splice(-1,1)[0])
        Weekly_Functions.recentHisto = historytwo.reverse()
    }

    static priceZones(){
        let biggersupres = Weekly_Functions.supreslevs()
        return biggersupres
    }

/* Add Key Part That the Levels Must Repeat 3x */
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
        Weekly_Functions.getPrice()
        let price = Weekly_Functions.price
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
            if (Math.abs(Two_Hour_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Two_Hour_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Two_Hour_Functions.pipreverse(price, Two_Hour_Functions.pipdiffy(price, Two_Hour_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Two_Hour_Functions.pipreverse(price, Two_Hour_Functions.pipdiffy(price, Two_Hour_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        Weekly_Functions.support = support
        Weekly_Functions.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        Weekly_Functions.finlevs = finalLevs
    }

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

    static instrument_catalog(instrument){
    }

    static pipCountBuy(num1, num2){
        let nums
        nums = Weekly_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}

}

class One_Hour_Functions{
    
    multiplier = 0
    priceHist = []
    vals = []
    support = 0
    resistance = 0
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []
    
    static HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        let dataspecific = undefined
        try{
            while(dataspecific === undefined){
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]['One_Hour']
            One_Hour_Functions.priceHist = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while(dataspecific === undefined){
            let data = JSON.parse(rawtwo)
            let dataspecific = data[instrument]['One_Hour']
            One_Hour_Functions.highs = dataspecific
        }}catch (error) {}
        dataspecific = undefined
        try{
            while(dataspecific === undefined){
            let data = JSON.parse(rawthree)
            let dataspecific = data[instrument]['One_Hour']
            One_Hour_Functions.lows = dataspecific
        }}catch (error) {}
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
                    }}}}}}}
    
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
    support = 0
    resistance = 0
    highs = []
    
    static HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
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

class Fifteen_Min_Functions{
    
    
    multiplier = 0
    priceHist = []
    vals = []
    support = 0
    resistance = 0
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    lows = []
    highs = []
    
    static HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        let dataspecific = undefined
        try{
            while(dataspecific === undefined){
                let data = JSON.parse(raw)
                let dataspecific = data[instrument]['Fifteen_Min']
            Fifteen_Min_Functions.priceHist = dataspecific
        }}catch (error) {}
        try{
            dataspecific = undefined
            while(dataspecific === undefined){
                let data = JSON.parse(rawtwo)
                let dataspecific = data[instrument]['Fifteen_Min']
            Fifteen_Min_Functions.highs = dataspecific
        }}catch (error) {}
        try{
            dataspecific = undefined
            while(dataspecific == undefined){
            let data = JSON.parse(rawthree)
            let dataspecific = data[instrument]['Fifteen_Min']
            Fifteen_Min_Functions.lows = dataspecific
        }}catch (error) {}
        let lens = []
        lens.push(Fifteen_Min_Functions.priceHist.length)
        lens.push(Fifteen_Min_Functions.highs.length)
        lens.push(Fifteen_Min_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Fifteen_Min_Functions.priceHist, Fifteen_Min_Functions.highs, Fifteen_Min_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Fifteen_Min_Functions.priceHist){
                    for(let item = 0; item < (Fifteen_Min_Functions.priceHist.length - minlens); item++){
                        Fifteen_Min_Functions.priceHist.splice(0,1)
                    }
                if (items == Fifteen_Min_Functions.lows){
                    for(let item = 0; item < (Fifteen_Min_Functions.lows.length - minlens); item++){
                        Fifteen_Min_Functions.lows.splice(0,1)
                    }
                if (items == Fifteen_Min_Functions.highs){
                    for(let item = 0; item < (Fifteen_Min_Functions.highs.length - minlens); item++){
                        Fifteen_Min_Functions.highs.splice(0,1)
                    }}}}}}}

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

function controlbox(){
    let g = 0
    while(g == 0){
        Two_Hour_Nexus.controlMain()
    }
    
}

Two_Hour_Nexus.controlMain()
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