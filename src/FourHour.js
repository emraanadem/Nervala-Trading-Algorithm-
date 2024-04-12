import * as fs from 'fs'
import * as regression from 'ml-regression-simple-linear'
import { EMA as emas, RSI as rsis, MACD as macds, ROC as rocs, BollingerBands as bolls, SMA as smas, ATR as tr } from 'technicalindicators'
import { createModel } from 'polynomial-regression'
import * as nerdamer from 'nerdamer/all.min.js'
import * as roots from 'kld-polynomial'

let instrum = ''

class Four_Hour_Nexus {
  pos = false
  buy_pos = false
  pot_buy = false
  biggersupres = []
  pot_sell = false
  sell_pos = false
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
  tptwo = 0
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
  static announcer () {
    if (Four_Hour_Nexus.pzone == false && Four_Hour_Functions.priceZones() == true) {
      Four_Hour_Nexus.pzone = true
      console.log('Price Zone Identified')
    } if (Four_Hour_Nexus.pzone == true && Four_Hour_Functions.priceZones() == false) {
      Four_Hour_Nexus.pzone = false
    } if (Four_Hour_Nexus.pchan == false && Four_Hour_Functions.priceChannels() == true) {
      Four_Hour_Nexus.pchan = true
      console.log('Price Channel Identified')
    } if (Four_Hour_Nexus.pchan == true && Four_Hour_Functions.priceChannels() == false) {
      Four_Hour_Nexus.pchan = false
    }
  }

  /** stop loss for buys */
  static stopLossBuy () {
    if (Four_Hour_Functions.price <= Four_Hour_Nexus.sl) {
      Four_Hour_Nexus.closePosSL()
    }
  }

  /** stop loss for selling */
  static stopLossSell () {
    if (Four_Hour_Functions.price >= Four_Hour_Nexus.sl) {
      Four_Hour_Nexus.closePosSL()
    }
  }

  /** initiates the piplog for pipcounting */
  static piploginit () {
    Four_Hour_Nexus.piplog = [0, 0, 0]
  }

  /** pip logging method */
  static piplogger () {
    const piplogging = Four_Hour_Nexus.piplog
    if (Four_Hour_Nexus.buy_pos) {
      piplogging.push(Four_Hour_Functions.pipCountBuy(Four_Hour_Nexus.posprice, Four_Hour_Functions.price))
      Four_Hour_Nexus.bigpipprice = Math.max(...piplogging)
      Four_Hour_Nexus.piplog = piplogging
    }
    if (Four_Hour_Nexus.sell_pos) {
      piplogging.push(Four_Hour_Functions.pipCountSell(Four_Hour_Nexus.posprice, Four_Hour_Functions.price))
      Four_Hour_Nexus.bigpipprice = Math.max(...piplogging)
      Four_Hour_Nexus.piplog = piplogging
    }
  }

  /** take profit for buying */
  static takeProfitBuy () {
    if (Four_Hour_Functions.price >= Four_Hour_Nexus.tp) {
      if (Four_Hour_Functions.volatility() > 0.618) {
        if ((Four_Hour_Functions.price - Four_Hour_Nexus.tp) > (Four_Hour_Nexus.tp - Four_Hour_Nexus.tstoploss)) {
          if (Four_Hour_Nexus.tp < Four_Hour_Nexus.tptwo) {
            Four_Hour_Nexus.piploginit()
            Four_Hour_Nexus.posprice = Four_Hour_Nexus.tp
            Four_Hour_Nexus.tp = Four_Hour_Nexus.tptwo
            Four_Hour_Functions.tpvariation()
            console.log('pair: ' + Four_Hour_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Four_Hour_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Four_Hour_Nexus.tptwo))
          }
        }
      } else {
        Four_Hour_Nexus.closePosTP()
      }
    } else if (Four_Hour_Functions.price <= Four_Hour_Nexus.tstoploss) {
      Four_Hour_Nexus.closePosTP()
    } else if (Four_Hour_Functions.price == Four_Hour_Nexus.tptwo) {
      Four_Hour_Nexus.closePosTP()
    }
  }

  /** take profit for selling */
  static takeProfitSell () {
    if (Four_Hour_Functions.price <= Four_Hour_Nexus.tp) {
      if (Four_Hour_Functions.volatility() > 0.618) {
        if ((Four_Hour_Nexus.tp - Four_Hour_Functions.price) > (Four_Hour_Nexus.tstoploss - Four_Hour_Nexus.tp)) {
          if (Four_Hour_Nexus.tp < Four_Hour_Nexus.tptwo) {
            Four_Hour_Nexus.piploginit()
            Four_Hour_Nexus.posprice = Four_Hour_Nexus.tp
            Four_Hour_Nexus.tp = Four_Hour_Nexus.tptwo
            Four_Hour_Functions.tpvariation()
            console.log('pair: ' + Four_Hour_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Four_Hour_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Four_Hour_Nexus.tptwo))
          }
        }
      } else {
        Four_Hour_Nexus.closePosTP()
      }
    } else if (Four_Hour_Functions.price >= Four_Hour_Nexus.tstoploss) {
      Four_Hour_Nexus.closePosTP()
    } else if (Four_Hour_Functions.price == Four_Hour_Nexus.tptwo) {
      Four_Hour_Nexus.closePosTP()
    }
  }

  /** stop loss defining method */
  static stoplossdef () {
    const stoploss = Four_Hour_Functions.stoploss()
    if (Four_Hour_Nexus.buy_pos) {
      Four_Hour_Nexus.sl = Four_Hour_Functions.price - stoploss
    }
    if (Four_Hour_Nexus.sell_pos) {
      Four_Hour_Nexus.sl = Four_Hour_Functions.price + stoploss
    }
  }

  /** define volatility for the system, tells me whether or not to alter trailing stop loss */
  static volatilitydef () {
    if (Four_Hour_Functions.volatility() > 0.618 && Four_Hour_Nexus.tstoplossinits && !Four_Hour_Nexus.tstoplossvoid) {
      Four_Hour_Nexus.tstoplossdefvol()
    }
  }

  /** initiate trailing stop loss */
  static tstoplossinit () {
    const stoploss = Four_Hour_Nexus.sldiff
    if (!Four_Hour_Nexus.tstop && !Four_Hour_Nexus.tstoplossinits && !Four_Hour_Nexus.tstoplossvoid) {
      if (Four_Hour_Nexus.buy_pos) {
        if (Four_Hour_Functions.price > Four_Hour_Nexus.posprice + 0.3 * stoploss) {
          Four_Hour_Nexus.tstoplossinits = true
          Four_Hour_Nexus.tstoplossdef()
        }
      }
      if (Four_Hour_Nexus.sell_pos) {
        if (Four_Hour_Functions.price < Four_Hour_Nexus.posprice - 0.3 * stoploss) {
          Four_Hour_Nexus.tstoplossinits = true
          Four_Hour_Nexus.tstoplossdef()
        }
      }
    }
  }

  /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
  static tstoplossdefvol () {
    Four_Hour_Nexus.sldiff = Four_Hour_Functions.stoploss()
    const stoploss = Four_Hour_Nexus.sldiff
    if (Four_Hour_Nexus.buy_pos) {
      if (Four_Hour_Functions.price > Four_Hour_Nexus.posprice + 0.3 * stoploss) {
        Four_Hour_Nexus.tstop = true
        Four_Hour_Nexus.tstoploss = Four_Hour_Nexus.posprice + (((Math.abs(Four_Hour_Functions.price - Four_Hour_Nexus.posprice)) * (Four_Hour_Functions.trailingsl())))
      }
    }
    if (Four_Hour_Nexus.sell_pos) {
      if (Four_Hour_Functions.price < Four_Hour_Nexus.posprice - 0.3 * stoploss) {
        Four_Hour_Nexus.tstop = true
        Four_Hour_Nexus.tstoploss = Four_Hour_Nexus.posprice - (((Math.abs(Four_Hour_Functions.price - Four_Hour_Nexus.posprice)) * (Four_Hour_Functions.trailingsl())))
      }
    }
  }

  /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility */
  static tstoplosscheck () {
    const tstoploss = Four_Hour_Nexus.sldiff
    if (Four_Hour_Nexus.buy_pos) {
      if (Four_Hour_Functions.price < Four_Hour_Nexus.posprice + 0.3 * tstoploss) {
        Four_Hour_Nexus.tstoplossvoid = true
      } else {
        Four_Hour_Nexus.tstoplossvoid = false
        Four_Hour_Nexus.volatilitydef()
        Four_Hour_Nexus.tstoplossinit()
      }
    }
    if (Four_Hour_Nexus.sell_pos) {
      if (Four_Hour_Functions.price > Four_Hour_Nexus.posprice - 0.3 * tstoploss) {
        Four_Hour_Nexus.tstoplossvoid = true
      } else {
        Four_Hour_Nexus.tstoplossvoid = false
        Four_Hour_Nexus.volatilitydef()
        Four_Hour_Nexus.tstoplossinit()
      }
    }
  }

  /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
  static tstoplosscont () {
    if (Four_Hour_Functions.volatility() < 0.618 && Four_Hour_Nexus.tstoplossinits && !Four_Hour_Nexus.tstoplossvoid) {
      Four_Hour_Nexus.sldiff = Four_Hour_Functions.stoploss()
      const stoploss = Four_Hour_Nexus.sldiff
      if (Four_Hour_Nexus.buy_pos) {
        if (Four_Hour_Functions.price > Four_Hour_Nexus.posprice + 0.3 * stoploss) {
          Four_Hour_Nexus.tstoploss = Four_Hour_Nexus.posprice + Four_Hour_Functions.pipreverse(Four_Hour_Nexus.posprice, 0.618 * Four_Hour_Nexus.bigpipprice)
        }
      }
      if (Four_Hour_Nexus.sell_pos) {
        if (Four_Hour_Functions.price < Four_Hour_Nexus.posprice - 0.3 * stoploss) {
          Four_Hour_Nexus.tstoploss = Four_Hour_Nexus.posprice - Four_Hour_Functions.pipreverse(Four_Hour_Nexus.posprice, 0.618 * Four_Hour_Nexus.bigpipprice)
        }
      }
    }
  }

  /** method that defines trailing stop loss for the system to begin with trailing stop loss */
  static tstoplossdef () {
    Four_Hour_Nexus.sldiff = Four_Hour_Functions.stoploss()
    const stoploss = Four_Hour_Nexus.sldiff
    if (Four_Hour_Nexus.buy_pos) {
      if (Four_Hour_Functions.price > Four_Hour_Nexus.posprice + 0.3 * stoploss) {
        Four_Hour_Nexus.tstop = true
        Four_Hour_Nexus.tstoploss = Four_Hour_Nexus.posprice + Four_Hour_Functions.pipreverse(Four_Hour_Nexus.posprice, 0.618 * Four_Hour_Nexus.bigpipprice)
      }
    }
    if (Four_Hour_Nexus.sell_pos) {
      if (Four_Hour_Functions.price < Four_Hour_Nexus.posprice - 0.3 * stoploss) {
        Four_Hour_Nexus.tstop = true
        Four_Hour_Nexus.tstoploss = Four_Hour_Nexus.posprice - Four_Hour_Functions.pipreverse(Four_Hour_Nexus.posprice, 0.618 * Four_Hour_Nexus.bigpipprice)
      }
    }
  }

  /* FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS! */

  /** initiates a buy signal */
  static buy () {
    Four_Hour_Functions.supreslevs()
    Four_Hour_Functions.getPrice()
    Four_Hour_Functions.stoploss()
    Four_Hour_Functions.tpvariation()
    if (!Four_Hour_Functions.rejectionzoning()) {
      if (Math.abs(Four_Hour_Functions.valdiff(Four_Hour_Functions.price, Four_Hour_Functions.closest(Four_Hour_Functions.price))) > 0.025) {
        Four_Hour_Nexus.tp = Four_Hour_Nexus.resistance
        Four_Hour_Nexus.pos = true
        Four_Hour_Nexus.buy_pos = true
        Four_Hour_Nexus.posprice = Four_Hour_Functions.price
        Four_Hour_Functions.stoploss()
        Four_Hour_Functions.tpvariation()
        console.log('pair: ' + Four_Hour_Nexus.pair)
        console.log('Open Buy Order on Four Hour')
        console.log('Entry Price: ' + String(Four_Hour_Nexus.posprice))
        console.log('Stop Loss: ' + String(Four_Hour_Nexus.sl))
        console.log('Target Take Profit: ' + String(Four_Hour_Nexus.tp))
        console.log('Take Profit 2: ' + String(Four_Hour_Nexus.tptwo))
        fs.writeFileSync('trade.json', JSON.stringify('true'))
      }
    }
  }

  /* static buy(){
        Four_Hour_Functions.supreslevs()
        Four_Hour_Functions.getPrice()
        Four_Hour_Nexus.tp = Four_Hour_Nexus.resistance
        Four_Hour_Nexus.pos = true
        Four_Hour_Nexus.buy_pos = true
        Four_Hour_Nexus.posprice = Four_Hour_Functions.price
                Four_Hour_Functions.stoploss()
                Four_Hour_Functions.tpvariation()
        console.log("Open Buy Order")
        console.log(Four_Hour_Nexus.sl + " : Stop Loss")
        console.log(Four_Hour_Nexus.tp + " : Target Take Profit")
        } */

  /** initiates a sell order */
  static sell () {
    Four_Hour_Functions.supreslevs()
    Four_Hour_Functions.getPrice()
    Four_Hour_Functions.stoploss()
    Four_Hour_Functions.tpvariation()
    if (!Four_Hour_Functions.rejectionzoning()) {
      if (Math.abs(Four_Hour_Functions.valdiff(Four_Hour_Functions.price, Four_Hour_Functions.closest(Four_Hour_Functions.price))) > 0.025) {
        Four_Hour_Nexus.tp = Four_Hour_Nexus.support
        Four_Hour_Nexus.pos = true
        Four_Hour_Nexus.sell_pos = true
        Four_Hour_Nexus.posprice = Four_Hour_Functions.price
        Four_Hour_Functions.stoploss()
        Four_Hour_Functions.tpvariation()
        console.log('pair: ' + Four_Hour_Nexus.pair)
        console.log('Open Sell Order on Four Hour')
        console.log('Entry Price: ' + String(Four_Hour_Nexus.posprice))
        console.log('Stop Loss: ' + String(Four_Hour_Nexus.sl))
        console.log('Target Take Profit: ' + String(Four_Hour_Nexus.tp))
        console.log('Take Profit 2: ' + String(Four_Hour_Nexus.tptwo))
        fs.writeFileSync('trade.json', JSON.stringify('true'))
      }
    }
  }

  /* static sell(){
        Four_Hour_Functions.supreslevs()
        Four_Hour_Functions.getPrice()
        Four_Hour_Nexus.tp = Four_Hour_Nexus.support
        Four_Hour_Nexus.pos = true
        Four_Hour_Nexus.sell_pos = true
        Four_Hour_Nexus.posprice = Four_Hour_Functions.price
                Four_Hour_Functions.stoploss()
                Four_Hour_Functions.tpvariation()
        console.log("Open Sell Order")
        console.log(Four_Hour_Nexus.sl + " : Stop Loss")
        console.log(Four_Hour_Nexus.tp + " : Target Take Profit")
        } */

  /** checks for price movement in lower periods to get better idea of the trend */
  static controlSmallerPeriod () {
    try {
      /* Confirm Trend w/ indicators and price movement */
      One_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.HistoryAssigner()
      Daily_Functions.HistoryAssigner()
      Fifteen_Min_Functions.HistoryAssigner()
      Four_Hour_Functions.stoploss()
      Four_Hour_Functions.tpvariation()
      let buy = false
      let sell = false
      if (!Thirty_Min_Functions.consolidationtwo() && !Fifteen_Min_Functions.consolidationtwo()) {
        if (One_Hour_Functions.ema()) {
          if (Thirty_Min_Functions.trend() && One_Hour_Functions.macd() && One_Hour_Functions.obv()) {
            if (Thirty_Min_Functions.ema()) {
              if (Thirty_Min_Functions.rsi() && Thirty_Min_Functions.obv()) {
                buy = true
              }
            }
          }
        }
        if (!One_Hour_Functions.ema()) {
          if (!Thirty_Min_Functions.trend() && !One_Hour_Functions.macd() && !One_Hour_Functions.obv()) {
            if (!Thirty_Min_Functions.ema()) {
              if (!Thirty_Min_Functions.rsi() && !Thirty_Min_Functions.obv()) {
                sell = true
              }
            }
          }
        }
      }
      return [buy, sell]
    } catch (error) {
      console.log(error)
    }
  }

  /** checks for support and resistance levels in larger time periods to get a better idea of possible consolidation/reversal points */
  static controlBiggerPeriod () {
    try {
      /* Price Zones */
      Daily_Functions.ValueAssigner()
      Weekly_Functions.ValueAssigner()
      Daily_Functions.HistoryAssigner()
      Weekly_Functions.HistoryAssigner()
    } catch (error) {
      console.log(error)
    }
    Daily_Functions.priceZones()
    Weekly_Functions.priceZones()
    let h = [0]
    h = Daily_Functions.finlevs
    const i = Weekly_Functions.finlevs
    const totallevs = h.push(i)
    Four_Hour_Nexus.biggersupres = totallevs
    Four_Hour_Nexus.finlevs.concat(totallevs)
  }

  /** main control method, takes control of the entire program and serves as the brain */
  static controlMain () {
    try {
      Four_Hour_Functions.rejecinit()
      Four_Hour_Functions.HistoryAssigner()
      Four_Hour_Functions.ValueAssigner()
      Four_Hour_Functions.stoploss()
      Four_Hour_Functions.getPrice()
      Four_Hour_Functions.supreslevs()
      Four_Hour_Nexus.controlBiggerPeriod()
      if (!Four_Hour_Functions.consolidationtwo() && Four_Hour_Functions.overall() && !Four_Hour_Functions.consolidation() &&
            !Four_Hour_Functions.keylev()) {
        if (Four_Hour_Functions.ema()) {
          if (Four_Hour_Nexus.controlSmallerPeriod()[0] == true) {
            if (Four_Hour_Functions.trend() && Four_Hour_Functions.rsi() &&
                            Four_Hour_Functions.macd() && Four_Hour_Functions.roc() && Four_Hour_Functions.obv()) {
              if (!Four_Hour_Nexus.pos) {
                if (!Four_Hour_Nexus.buy_pos) { Four_Hour_Nexus.pot_buy = true }
                Four_Hour_Functions.stoploss()
                Four_Hour_Nexus.piploginit()
                Four_Hour_Nexus.buy()
              }
            }
          }
        }
        if (!Four_Hour_Functions.ema()) {
          if (Four_Hour_Nexus.controlSmallerPeriod()[1] == true) {
            if (!Four_Hour_Functions.trend() && !Four_Hour_Functions.rsi() &&
                            !Four_Hour_Functions.macd() && !Four_Hour_Functions.roc() && !Four_Hour_Functions.obv()) {
              if (!Four_Hour_Nexus.pos) {
                if (!Four_Hour_Nexus.sell_pos) { Four_Hour_Nexus.pot_sell = true }
                Four_Hour_Functions.stoploss()
                Four_Hour_Nexus.piploginit()
                Four_Hour_Nexus.sell()
              }
            }
          }
        }
      }
      if (Four_Hour_Nexus.pos && Four_Hour_Nexus.buy_pos) {
        Four_Hour_Nexus.piplogger()
        Four_Hour_Nexus.stopLossBuy()
        Four_Hour_Nexus.tstoplosscheck()
        Four_Hour_Nexus.tstoplosscont()
        Four_Hour_Nexus.takeProfitBuy()
      }
      if (Four_Hour_Nexus.pos && Four_Hour_Nexus.sell_pos) {
        Four_Hour_Nexus.piplogger()
        Four_Hour_Nexus.stopLossSell()
        Four_Hour_Nexus.tstoplosscheck()
        Four_Hour_Nexus.tstoplosscont()
        Four_Hour_Nexus.takeProfitSell()
      }
      Four_Hour_Functions.rejecsave()
    } catch (error) {
      console.log(error)
    }
    /* figure out how to clear memory, and do so here after every iteration */
    /* memory issue solved: 4/20/22 */ }

  /** close position method for taking profit, and gives pip count and win/loss ratio */
  static closePosTP () {
    if (Four_Hour_Nexus.pos) {
      if (Four_Hour_Nexus.buy_pos) {
        Four_Hour_Nexus.buy_pos = false
        Four_Hour_Nexus.pos = false
        Four_Hour_Nexus.pot_buy = false
        Four_Hour_Nexus.tstop = false
        Four_Hour_Nexus.tstoplossinits = false
        Four_Hour_Nexus.tstoplossvoid = false
        Four_Hour_Nexus.pchan = false
        Four_Hour_Nexus.pzone = false
        Four_Hour_Nexus.wins += 1
        Four_Hour_Nexus.trades += 1
        Four_Hour_Nexus.piplog = [0, 0, 0]
        const pipchange = Four_Hour_Functions.pipCountBuy(Four_Hour_Nexus.posprice, Four_Hour_Functions.price)
        Four_Hour_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Four_Hour_Nexus.pair)
        console.log('Take Profit Hit on Four Hour')
        console.log(Four_Hour_Nexus.wins + ' Wins and     ' + Four_Hour_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Four_Hour_Nexus.wins / Four_Hour_Nexus.trades)
        console.log('Pip Count: ' + Four_Hour_Nexus.pips)
      }
      if (Four_Hour_Nexus.sell_pos) {
        Four_Hour_Nexus.sell_pos = false
        Four_Hour_Nexus.pos = false
        Four_Hour_Nexus.tstop = false
        Four_Hour_Nexus.pot_sell = false
        Four_Hour_Nexus.tstoplossinits = false
        Four_Hour_Nexus.tstoplossvoid = false
        Four_Hour_Nexus.pchan = false
        Four_Hour_Nexus.pzone = false
        Four_Hour_Nexus.wins += 1
        Four_Hour_Nexus.trades += 1
        Four_Hour_Nexus.piplog = [0, 0, 0]
        const pipchange = Four_Hour_Functions.pipCountSell(Four_Hour_Nexus.posprice, Four_Hour_Functions.price)
        Four_Hour_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Four_Hour_Nexus.pair)
        console.log('Take Profit Hit on Four Hour')
        console.log(Four_Hour_Nexus.wins + ' Wins and     ' + Four_Hour_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Four_Hour_Nexus.wins / Four_Hour_Nexus.trades)
        console.log('Pip Count: ' + Four_Hour_Nexus.pips)
      }
    }
  }

  /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
  static closePosSL () {
    if (Four_Hour_Nexus.pos) {
      if (Four_Hour_Nexus.sell_pos) {
        Four_Hour_Nexus.sell_pos = false
        Four_Hour_Nexus.pos = false
        Four_Hour_Nexus.tstop = false
        Four_Hour_Nexus.pot_sell = false
        Four_Hour_Nexus.tstoplossinits = false
        Four_Hour_Nexus.tstoplossvoid = false
        Four_Hour_Nexus.pchan = false
        Four_Hour_Nexus.pzone = false
        Four_Hour_Nexus.losses += 1
        Four_Hour_Nexus.trades += 1
        Four_Hour_Nexus.piplog = [0, 0, 0]
        const pipchange = Four_Hour_Functions.pipCountSell(Four_Hour_Nexus.posprice, Four_Hour_Functions.price)
        Four_Hour_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Four_Hour_Nexus.pair)
        console.log('Stop Loss Hit on Four Hour')
        console.log(Four_Hour_Nexus.wins + ' Wins and     ' + Four_Hour_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Four_Hour_Nexus.wins / Four_Hour_Nexus.trades)
        console.log('Pip Count' + Four_Hour_Nexus.pips)
      }
      if (Four_Hour_Nexus.buy_pos) {
        Four_Hour_Nexus.buy_pos = false
        Four_Hour_Nexus.pos = false
        Four_Hour_Nexus.tstop = false
        Four_Hour_Nexus.pot_buy = false
        Four_Hour_Nexus.tstoplossinits = false
        Four_Hour_Nexus.tstoplossvoid = false
        Four_Hour_Nexus.pchan = false
        Four_Hour_Nexus.pzone = false
        Four_Hour_Nexus.losses += 1
        Four_Hour_Nexus.trades += 1
        Four_Hour_Nexus.piplog = [0, 0, 0]
        const pipchange = Four_Hour_Functions.pipCountBuy(Four_Hour_Nexus.posprice, Four_Hour_Functions.price)
        Four_Hour_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Four_Hour_Nexus.pair)
        console.log('Stop Loss Hit on Four Hour')
        console.log(Four_Hour_Nexus.wins + ' Wins and     ' + Four_Hour_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Four_Hour_Nexus.wins / Four_Hour_Nexus.trades)
        console.log('Pip Count' + Four_Hour_Nexus.pips)
      }
    }
  }
}

class Four_Hour_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  rejectionzones = new Array()
  extendHigh = []
  extendLow = []
  timeperiods = {}
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  highs = []
  lows = []

  /** load instrument name from json file */
  static instrument_name () {
    Four_Hour_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Four_Hour_Functions.priceHist = dataset.Four_Hour.c
    Four_Hour_Functions.highs = dataset.Four_Hour.h
    Four_Hour_Functions.lows = dataset.Four_Hour.l
    Four_Hour_Functions.extendHist = dataset['Four_Hour Extend'].c
    Four_Hour_Functions.extendHigh = dataset['Four_Hour Extend'].h
    Four_Hour_Functions.extendLow = dataset['Four_Hour Extend'].l
  }

  /** load price from json file */
  static ValueAssigner () {
    Four_Hour_Functions.price = liveprice
  }

  /** second consolidation method, meant to strengthen consolidation identification */
  static consolidationtwo () {
    const history = Four_Hour_Functions.priceHist
    const highs = Four_Hour_Functions.highs
    const lows = Four_Hour_Functions.lows
    const histmax = Math.max(...history)
    const histmin = Math.min(...history)
    const histdiff = histmax - histmin
    const q = bolls.calculate({ period: 10, values: history, stdDev: 1 })
    const n = tr.calculate({ high: highs, low: lows, close: history, period: 8 })
    const h = new Array()
    const i = []
    const j = []
    for (let value = 0; value < q.length; value++) {
      h.push(q[value].lower)
      i.push(q[value].upper)
      j.push(q[value].middle)
    }
    const smmas = smas.calculate({ period: 14, values: h })
    const smmass = smas.calculate({ period: 14, values: i })
    /* keep midpoint just in case */
    const smmasss = smas.calculate({ period: 14, values: j })
    const smmaslast = smmas[smmas.length - 1]
    const smmasslast = smmass[smmass.length - 1]
    const smadiff = smmasslast - smmaslast
    const ndiffone = n[n.length - 1] - n[n.length - 2]
    const ndifftwo = n[n.length - 2] - n[n.length - 3]
    const benchmark = 0.025 * histdiff
    if (smadiff > benchmark && (n[n.length - 1] > n[n.length - 2] && ndiffone > ndifftwo)) {
      return false
    } else {
      return true
    }
  }

  /** TP variation, helps change TP depending on volatility and price movement depending on whether or not the code has surpassed TP1 and
     * is about to hit TP2
     */
  static tpvariation () {
    const tp = Four_Hour_Nexus.tp
    const values = Four_Hour_Nexus.finlevs.concat(Four_Hour_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    const num1 = Four_Hour_Nexus.price
    const volval = Four_Hour_Functions.volatility()
    if (Four_Hour_Nexus.buy_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 < values[item]) {
          valdiffgreater.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Four_Hour_Nexus.tp
      filteredvaldiff = [...new Set(valdiffgreater)]
      for (const valuers in filteredvaldiff) {
        referenceval = closesttp - num1
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Four_Hour_Nexus.tp = Four_Hour_Functions.price + (Math.abs(Four_Hour_Functions.price - Four_Hour_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Four_Hour_Functions.price)) {
          nexttp = Four_Hour_Functions.price + (Math.abs(Four_Hour_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Four_Hour_Functions.price + ((Four_Hour_Nexus.tp - Four_Hour_Functions.price) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Four_Hour_Functions.price)) {
          nexttp = Four_Hour_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Four_Hour_Functions.price + ((Four_Hour_Functions.tp - Four_Hour_Functions.price) * 1.382)
        }
      }
    }
    if (Four_Hour_Nexus.sell_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 > values[item]) {
          valdiffless.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Four_Hour_Nexus.tp
      filteredvaldiff = [...new Set(valdiffless)]
      for (const valuers in filteredvaldiff) {
        referenceval = num1 - closesttp
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Four_Hour_Nexus.tp = Four_Hour_Functions.price - (Math.abs(Four_Hour_Functions.price - Four_Hour_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Four_Hour_Functions.price)) {
          nexttp = Four_Hour_Functions.price - (Math.abs(Four_Hour_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Four_Hour_Functions.price - ((Four_Hour_Functions.price - Four_Hour_Nexus.tp) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Four_Hour_Functions.price)) {
          nexttp = Four_Hour_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Four_Hour_Functions.price - ((Four_Hour_Functions.price - Four_Hour_Nexus.tp) * 1.382)
        }
      }
    }
    Four_Hour_Nexus.tptwo = nexttp
  }

  /** fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
  static fib () {
    const recents = Four_Hour_Functions.recentHisto
    const dataset = []
    for (let x = 1; x < 51; x++) {
      dataset.push([x, recents[x - 1]])
    }
    const mod = createModel()
    mod.fit(dataset, [4])
    mod.estimate(4, 25)
    const equation = mod.expressions()['4']
    const q = nerdamer.diff((equation))
    const newequation = q.text()
    const root = roots.getRoots((newequation))
    const baseprice = 0
    const currentprice = Four_Hour_Functions.price
    const diff = Math.abs(baseprice - currentprice)
    if (currentprice < baseprice) {
      const fib1 = diff * 0.236 + currentprice
      const fib2 = diff * 0.382 + currentprice
      const fib3 = diff * 0.5 + currentprice
      const fib4 = diff * 0.618 + currentprice
      const fib5 = diff * 0.786 + currentprice
      const fib6 = diff * 1.00 + currentprice
    }
    if (currentprice > baseprice) {
      const fib1 = diff * 0.236 + baseprice
      const fib2 = diff * 0.382 + baseprice
      const fib3 = diff * 0.5 + baseprice
      const fib4 = diff * 0.618 + baseprice
      const fib5 = diff * 0.786 + baseprice
      const fib6 = diff * 1.00 + baseprice
    }
    /* Finish finding roots of derivative, from this point select the root with the highest x value,
        then register fib levels from the price corresponding to that x value, depending on whether or not its a buy or sell */
  }

  /** Rejection Zone Initiator */
  static rejecinit () {
    const instrument = Four_Hour_Functions.instrument_name()
    if (!fs.existsSync('./Rejection_Archive/' + String(instrument) + '.json')) {
      Four_Hour_Functions.timeperiods = {}
      Four_Hour_Functions.timeperiods.Fifteen_Min = [0, 0, 0]
      Four_Hour_Functions.timeperiods.Thirty_Min = [0, 0, 0]
      Four_Hour_Functions.timeperiods.One_Hour = [0, 0, 0]
      Four_Hour_Functions.timeperiods.Two_Hour = [0, 0, 0]
      Four_Hour_Functions.timeperiods.Four_Hour = [0, 0, 0]
      Four_Hour_Functions.timeperiods.Daily = [0, 0, 0]
      Four_Hour_Functions.timeperiods.Weekly = [0, 0, 0]
      fs.writeFileSync('./Rejection_Archive/' + String(instrument) + '.json', JSON.stringify(Four_Hour_Functions.timeperiods, null, 2))
    }
    const raw = fs.readFileSync('./Rejection_Archive/' + String(instrument) + '.json')
    Four_Hour_Functions.timeperiods = JSON.parse(raw)
    Four_Hour_Functions.rejectionzones = JSON.parse(raw).Four_Hour
  }

  /** Rejection Zone Saver */
  static rejecsave () {
    const instrument = Four_Hour_Functions.instrument_name()
    Four_Hour_Functions.rejectionzones = [...new Set(Four_Hour_Functions.rejectionzones)]
    Four_Hour_Functions.timeperiods.Four_Hour = Four_Hour_Functions.rejectionzones
    fs.writeFileSync('./Rejection_Archive/' + String(instrument) + '.json', JSON.stringify(Four_Hour_Functions.timeperiods, null, 2))
  }

  /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition */
  static overall () {
    const extendedhistory = Four_Hour_Functions.extendHist
    Four_Hour_Functions.rejectionzones = [0, 0, 0]
    const price = Four_Hour_Functions.price
    const max = Math.max(...extendedhistory)
    const min = Math.min(...extendedhistory)
    const buffer = (max - min) * 0.05
    const lower = price - buffer
    const upper = price + buffer
    const pricerange = [lower, upper]
    const studylist = []
    for (let val = 0; val < extendedhistory.length; val++) {
      if (extendedhistory[val] <= upper && extendedhistory[val] >= lower) {
        studylist.push([val, extendedhistory[val]])
      }
    }
    const result = Four_Hour_Functions.analysis(studylist, extendedhistory, pricerange)
    return result
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis (cases, extendedhistory, pricerange) {
    const histnorm = Four_Hour_Functions.priceHist
    const normdiff = (Math.max(...histnorm) - Math.min(...histnorm)) * 0.025
    const q = bolls.calculate({ period: 10, values: extendedhistory, stdDev: 1 })
    const h = new Array()
    const i = []
    const j = []
    for (let value = 0; value < q.length; value++) {
      h.push(q[value].lower)
      i.push(q[value].upper)
      j.push(q[value].middle)
    }
    const smmas = smas.calculate({ period: 14, values: h })
    const smmass = smas.calculate({ period: 14, values: i })
    /* keep midpoint just in case */
    const smmasss = smas.calculate({ period: 14, values: j })
    const histdiff = (pricerange[1] - pricerange[0]) / 2
    const benchmark = 0.025 * histdiff
    const fractals = []
    let rejection = 0
    for (let val = 0; val < cases.length; val++) {
      fractals.push(cases[val][0])
    }
    for (let val = 0; val < fractals.length; val++) {
      let mincount = 0
      let maxcount = 0
      for (let value = 0; value < 3; value++) {
        if ((fractals[val] < extendedhistory.length - 2) && (fractals[val] > 1)) {
          if (extendedhistory[fractals[val]] > extendedhistory[fractals[val] - value]) {
            maxcount++
          }
          if (extendedhistory[fractals[val]] > extendedhistory[fractals[val] + value]) {
            maxcount++
          }
          if (extendedhistory[fractals[val]] < extendedhistory[fractals[val] - value]) {
            mincount++
          }
          if (extendedhistory[fractals[val]] < extendedhistory[fractals[val] + value]) {
            mincount++
          }
        }
      }
      if (mincount || maxcount > 4) {
        rejection++
        if (fractals.length < 1) {
          fractals.push(0)
          Four_Hour_Functions.rejectionzones.push(fractals[0])
        } else {
          const frac = fractals[val]
          Four_Hour_Functions.rejectionzones.push(extendedhistory[frac])
        }
      }
    }
    if (Four_Hour_Functions.rejectionzones.length < 1) {
      Four_Hour_Functions.rejectionzones.push(Four_Hour_Functions.price)
    }
    if (rejection > 2) {
      return false
    } else {
      return true
    }
  }

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Four_Hour_Functions.overall()
    const rejects = Four_Hour_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Four_Hour_Nexus.pot_buy) {
        if (Four_Hour_Functions.price < val) {
          diffs.push(val - Four_Hour_Functions.price)
        }
      }
      if (Four_Hour_Nexus.pot_sell) {
        if (Four_Hour_Functions.price > val) {
          diffs.push(Four_Hour_Functions.price - val)
        }
      }
    }
    if (Math.abs(Math.min(...diffs)) < Math.abs(Four_Hour_Functions.price - Four_Hour_Nexus.tp)) {
      Four_Hour_Nexus.pot_buy = false
      Four_Hour_Nexus.pot_sell = false
      return true
    } else {
      return false
    }
  }

  /** return price */
  static getPrice () {
    return Four_Hour_Functions.price
  }

  /** return historical price */
  static priceHistory () {
    return Four_Hour_Functions.priceHist
  }

  /** find whether trend is going up or down */
  static trend () {
    const history = Four_Hour_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] > history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] < history[history.length - 3]) { return false }
  }

  /** recent history, shortens history array into last 50 digits for different analyses */
  static recentHist () {
    const history = Four_Hour_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 50; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Four_Hour_Functions.recentHisto = historytwo.reverse()
  }

  /** determination of stop loss size */
  static stoploss () {
    const highs = Four_Hour_Functions.highs
    const lows = Four_Hour_Functions.lows
    const diff = []
    let totaldiff = 0
    let finaldiff = 0
    for (let variables = 0; variables < 30; variables++) {
      diff.push(Math.abs(highs[highs.length - 1 - variables] - lows[lows.length - 1 - variables]))
    }
    for (let variables = 0; variables < diff.length; variables++) {
      totaldiff += diff[variables]
    }
    if (Four_Hour_Functions.volatility() > 0.618) {
      finaldiff = (totaldiff / 30) * 1.382
    } else {
      finaldiff = (totaldiff / 30)
    }
    let slceil = 0
    let slfloor = 0
    let numbuy = 0
    let newsl = 0
    if (Four_Hour_Nexus.pot_buy) {
      const diffprice = Four_Hour_Functions.price - finaldiff
      if (!Number.isFinite(Four_Hour_Functions.closesttwo(diffprice)[0])) {
        slfloor = Four_Hour_Functions.price - (finaldiff * 3.618)
        newsl = slfloor
      } else {
        numbuy = Four_Hour_Functions.closesttwo(diffprice)[0]
        if (!Number.isFinite(Four_Hour_Functions.closesttwo(numbuy)[0])) {
          newsl = diffprice - (0.786 * (diffprice - numbuy))
        } else {
          slfloor = (Four_Hour_Functions.price - ((Four_Hour_Functions.price - Four_Hour_Functions.closesttwo(numbuy)[0]) * 1.618 * 0.786))
          newsl = slfloor
        }
      }
      Four_Hour_Nexus.sl = newsl
    } if (Four_Hour_Nexus.pot_sell) {
      const diffprice = finaldiff + Four_Hour_Functions.price
      if (!Number.isFinite(Four_Hour_Functions.closesttwo(diffprice)[1])) {
        slceil = Four_Hour_Functions.price + (finaldiff * 3.618)
        newsl = slceil
      } else {
        numbuy = Four_Hour_Functions.closesttwo(diffprice)[1]
        if (!Number.isFinite(Four_Hour_Functions.closesttwo(numbuy)[1])) {
          newsl = diffprice + (0.786 * (numbuy - diffprice))
        } else {
          slceil = (Four_Hour_Functions.price + ((Math.abs(Four_Hour_Functions.price - Four_Hour_Functions.closesttwo(numbuy)[1])) * 1.618 * 0.786))
          newsl = slceil
        }
      }
      Four_Hour_Nexus.sl = newsl
    }
    return finaldiff
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closesttwo (num1) {
    const values = Four_Hour_Nexus.finlevs.concat(Four_Hour_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    for (let item = 0; item < values.length; item++) {
      if (num1 < values[item]) {
        valdiffgreater.push(Math.abs(num1 - values[item]))
      }
      if (num1 > values[item]) {
        valdiffless.push(Math.abs(num1 - values[item]))
      }
    }
    const closestbelow = Four_Hour_Functions.price - Math.min(...valdiffless)
    const closestabove = Four_Hour_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return closests
  }

  /** price zones, meant to determine whether a price zone has been found or not */
  static priceZones () {
    Four_Hour_Functions.supreslevs()
    if (Math.abs((Four_Hour_Functions.pipCountBuy(Four_Hour_Functions.price, Four_Hour_Nexus.resistance))
    ) / (Math.abs(Four_Hour_Functions.pipCountBuy(Math.max(...Four_Hour_Functions.priceHist), Math.min(...Four_Hour_Functions.priceHist)))) < 0.1) {
      return true
    } else if (Math.abs((Four_Hour_Functions.pipCountBuy(Four_Hour_Functions.price, Four_Hour_Nexus.support))
    ) / (Math.abs(Four_Hour_Functions.pipCountBuy(Math.max(...Four_Hour_Functions.priceHist), Math.min(...Four_Hour_Functions.priceHist)))) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** keylev, meant to determine the closest keylevel to the current price */
  static keylev () {
    Four_Hour_Functions.getPrice()
    if (Four_Hour_Functions.valdiff(Four_Hour_Functions.price, Four_Hour_Functions.closest(Four_Hour_Functions.price)) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** volatility, meant to determine whether or not price movement is too volatile for current parameters */
  static volatility () {
    const history = Four_Hour_Functions.priceHist
    const r = rsis.calculate({ period: 14, values: history })
    const q = r[r.length - 1]
    let diff = 0
    if (q > 50) { diff = q - 0 } else if (q <= 50) { diff = 100 - q }
    const difference = diff / 100
    const equation = ((Math.abs((100) * Math.sin(difference)))) / (Math.abs(100 * Math.sin(1.05)))
    return equation
  }

  /** trailing stop loss factor, uses derived equation to create a sort of "bubble" around price movement to prevent trades being taken out early */
  static trailingsl () {
    const factor = Four_Hour_Functions.volatility()
    const history = Four_Hour_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const diffy = ceiling - floor
    const posdiff = Math.abs(Four_Hour_Nexus.posprice - Four_Hour_Functions.price)
    const deci = posdiff / diffy
    const input = deci * 6.18
    const equation = (1 - factor) * (((input * input) + input) / ((input * input) + input + 1))
    return equation
  }

  /**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
  static priceChannels () {
    const rvalues = Four_Hour_Functions.regression()
    if ((rvalues[0] * rvalues[0]) > 0.8 && (rvalues[1] * rvalues[1]) > 0.8) {
      return true
    } else {
      return false
    }
  }

  /** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now */
  static consolidation () {
    if (Four_Hour_Functions.volatility() > 0.618) {
      return false
    } else {
      return true
    }
  }

  /** used to determine slope between two points */
  static slopes () {
    Four_Hour_Functions.recentHist()
    const recentHistory = Four_Hour_Functions.recentHisto
    const slope = []
    for (let value = 0; value < recentHistory.length - 1; value++) {
      slope.push(recentHistory[value + 1] - recentHistory[value])
    }
    return slope
  }

  /* Make stricter, 3+ values or more to be a max or min once real data comes thru */
  /* UPDATE: stricter values not working that well, but its identifying price channels so ... should I change? I don't know */
  /** used to determine relative maxes and mins for identification of price channels */
  static maxes_mins () {
    Four_Hour_Functions.recentHist()
    const recentHistory = Four_Hour_Functions.recentHisto
    const slope = Four_Hour_Functions.slopes()
    const maxes = []
    const mins = []
    for (let value = 3; value < slope.length - 2; value++) {
      if (slope[value - 1] > 0 && slope[value] < 0) {
        if (slope[value - 2] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) } else if (slope[value - 3] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) }
      } else if (slope[value - 1] < 0 && slope[value] > 0) {
        if (slope[value - 2] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) } else if (slope[value - 3] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) }
      }
    }
    Four_Hour_Functions.maxes = maxes
    Four_Hour_Functions.mins = mins
  }

  /** used to determine regression lines (moving averages, for example) */
  static regression () {
    Four_Hour_Functions.maxes_mins()
    const x = []
    const length = Four_Hour_Functions.maxes.length
    for (let value = 0; value < length; value++) { x.push(value) }
    const y = Four_Hour_Functions.maxes
    const regressions = new regression.SimpleLinearRegression(x, y)
    const xtwo = []
    const lengthtwo = Four_Hour_Functions.mins.length
    for (let value = 0; value < lengthtwo; value++) { xtwo.push(value) }
    const ytwo = Four_Hour_Functions.mins
    const regressionstwo = new regression.SimpleLinearRegression(xtwo, ytwo)
    const roneone = Object.values(regressions.score(x, y))[0]
    const ronetwo = Object.values(regressions.score(x, y))[1]
    const rtwoone = Object.values(regressionstwo.score(xtwo, ytwo))[0]
    const rtwotwo = Object.values(regressionstwo.score(xtwo, ytwo))[1]
    return [ronetwo, rtwotwo]
  }

  /* Add Key Part That the Levels Must Repeat 3x */
  /* Key part added, test for results */
  /** finds support and resistance levels, very important for code function, would love to improve this */
  static supreslevs () {
    const history = Four_Hour_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const difference = ceiling - floor
    const levels = []
    const levelss = []
    let levelsss = []
    let finalLevs = []
    let count = 0
    for (let item = 0; item < history.length; item++) { levels.push((history[item] - floor) / (difference)) }
    for (let item = 0; item < levels.length; item++) { levels[item] = levels[item].toFixed(3) }
    for (let item = 0; item < levels.length; item++) {
      for (let items = 0; items < levels.length; items++) {
        if (levels[item] == levels[items]) {
          count++
        }
      }
      if (count > 3) {
        levelss.push(levels[item])
      }
      count = 0
    }
    levelsss = [...new Set(levelss)]
    finalLevs = levelsss
    const price = Four_Hour_Functions.getPrice()
    const larger = []
    const smaller = []
    const largertwo = []
    const smallertwo = []
    const smaller_diff = []
    const larger_diff = []
    for (let item = 0; item < finalLevs.length; item++) {
      if (price > ((finalLevs[item] * difference) + floor)) { smaller.push(((finalLevs[item] * difference) + floor)) }
      if (price < ((finalLevs[item] * difference) + floor)) { larger.push(((finalLevs[item] * difference) + floor)) }
    }
    for (let item = 0; item < smaller.length; item++) {
      if (Math.abs(Four_Hour_Functions.valdiff(price, smaller[item])) > 0.05) {
        smallertwo.push(smaller[item])
      }
    }
    for (let item = 0; item < larger.length; item++) {
      if (Math.abs(Four_Hour_Functions.valdiff(price, larger[item])) > 0.05) {
        largertwo.push(larger[item])
      }
    }
    if (smallertwo.length < 1) {
      smallertwo.push(price - Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    if (largertwo.length < 1) {
      largertwo.push(price + Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    for (let item = 0; item < smallertwo.length; item++) {
      smaller_diff.push(Math.abs((smallertwo[item] - price)))
    }
    for (let item = 0; item < largertwo.length; item++) {
      larger_diff.push(Math.abs((largertwo[item] - price)))
    }
    const support = price - Math.min(...smaller_diff)
    const resistance = price + Math.min(...larger_diff)
    Four_Hour_Nexus.support = support
    Four_Hour_Nexus.resistance = resistance
    for (const item in finalLevs) {
      finalLevs[item] = (finalLevs[item] * difference) + floor
    }
    Four_Hour_Nexus.finlevs = finalLevs
  }

  /** self explanatory, finds RSI and compares the last two */
  static rsi () {
    const history = Four_Hour_Functions.priceHist
    const history2 = []
    for (let item = 0; item < history.length; item++) { history2.push(history[item]) }
    history2.splice(-1, 1)
    const q = rsis.calculate({ period: 14, values: history })
    const r = rsis.calculate({ period: 14, values: history2 })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** self explanatory, finds MACD and compares the last two */
  static macd () {
    const history = Four_Hour_Functions.priceHist
    const x = []
    const q = emas.calculate({ period: 12, values: history })
    const r = emas.calculate({ period: 26, values: history })
    const s = macds.calculate({ values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false })
    for (let i = 0; i < r.length; i++) { x.push(q[i + 14] - r[i]) }
    const qlast = s[s.length - 1].histogram
    const rlast = s[s.length - 2].histogram
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** self explanatory, finds ROC and compares the last two */
  static roc () {
    const history = Four_Hour_Functions.priceHist
    const history2 = []
    for (let item = 0; item < history.length; item++) { history2.push(history[item]) }
    history2.splice(-1, 1)
    const q = rocs.calculate({ period: 10, values: history })
    const r = rocs.calculate({ period: 10, values: history2 })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** self explanatory, finds EMA and compares the last two */
  static ema () {
    const history = Four_Hour_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** new indicator mix that finds EMAS of RSI and compares the last two values */
  static obv () {
    const history = Four_Hour_Functions.priceHist
    const qs = rsis.calculate({ period: 14, values: history })
    const q = emas.calculate({ period: 8, values: qs })
    const qlast = q[q.length - 1]
    const r = emas.calculate({ period: 14, values: qs })
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** pip counter */
  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      Four_Hour_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 3) {
      Four_Hour_Functions.multiplier = 100
    } else if (String(num1).indexOf('.') == 4) {
      Four_Hour_Functions.multiplier = 10
    } else if (String(num1).indexOf('.') == 5) {
      Four_Hour_Functions.multiplier = 1
    } else if (String(num1).indexOf('.') == 5) {
      Four_Hour_Functions.multiplier = 0.1
    } else if (String(num1).indexOf('.') == 6) {
      Four_Hour_Functions.multiplier = 0.01
    } else if (String(num1).indexOf('.') == 7) {
      Four_Hour_Functions.multiplier = 0.001
    } else if (String(num1).indexOf('.') == 8) {
      Four_Hour_Functions.multiplier = 0.0001
    } else if (String(num1).indexOf('.') == 9) {
      Four_Hour_Functions.multiplier = 0.00001
    } else if (String(num1).indexOf('.') == 10) {
      Four_Hour_Functions.multiplier = 0.000001
    } else { Four_Hour_Functions.multiplier = 10000 }
    num1 *= Four_Hour_Functions.multiplier
    num2 *= Four_Hour_Functions.multiplier
    return [num1, num2]
  }

  /** pip converter */
  static pipreverse (num, num2) {
    if (String(num).indexOf('.') == 2) {
      Four_Hour_Functions.multiplier = 0.001
    } else if (String(num).indexOf('.') == 3) {
      Four_Hour_Functions.multiplier = 0.01
    } else if (String(num).indexOf('.') == 4) {
      Four_Hour_Functions.multiplier = 0.1
    } else if (String(num).indexOf('.') == 5) {
      Four_Hour_Functions.multiplier = 1
    } else if (String(num).indexOf('.') == 5) {
      Four_Hour_Functions.multiplier = 10
    } else if (String(num).indexOf('.') == 6) {
      Four_Hour_Functions.multiplier = 100
    } else if (String(num).indexOf('.') == 7) {
      Four_Hour_Functions.multiplier = 1000
    } else if (String(num).indexOf('.') == 8) {
      Four_Hour_Functions.multiplier = 10000
    } else if (String(num).indexOf('.') == 9) {
      Four_Hour_Functions.multiplier = 100000
    } else if (String(num).indexOf('.') == 10) {
      Four_Hour_Functions.multiplier = 1000000
    } else { Four_Hour_Functions.multiplier = 0.0001 }
    num2 *= Four_Hour_Functions.multiplier
    return (num2)
  }

  static instrument_switcher (instrument) {
  }

  /* sets value difference as a decimal-percentage of floor to ceiling */
  /** gets value difference for normalization of data points */
  static valdiff (num1, num2) {
    const history = Four_Hour_Functions.priceHist
    const floor = Math.min(...history)
    const ceil = Math.max(...history)
    const valdiffer = ceil - floor
    const diff = Math.abs(num1 - num2)
    const valuediff = diff / valdiffer
    return valuediff
  }

  /** Pip difference calculator */
  static pipdiffy (price, num1) {
    if (String(price).indexOf('.') == 2) {
      Four_Hour_Functions.multiplier = 1000
    } else if (String(price).indexOf('.') == 3) {
      Four_Hour_Functions.multiplier = 100
    } else if (String(price).indexOf('.') == 4) {
      Four_Hour_Functions.multiplier = 10
    } else if (String(price).indexOf('.') == 5) {
      Four_Hour_Functions.multiplier = 1
    } else if (String(price).indexOf('.') == 5) {
      Four_Hour_Functions.multiplier = 0.1
    } else if (String(price).indexOf('.') == 6) {
      Four_Hour_Functions.multiplier = 0.01
    } else if (String(price).indexOf('.') == 7) {
      Four_Hour_Functions.multiplier = 0.001
    } else if (String(price).indexOf('.') == 8) {
      Four_Hour_Functions.multiplier = 0.0001
    } else if (String(price).indexOf('.') == 9) {
      Four_Hour_Functions.multiplier = 0.00001
    } else if (String(price).indexOf('.') == 10) {
      Four_Hour_Functions.multiplier = 0.000001
    } else {
      Four_Hour_Functions.multiplier = 10000
    }
    return num1 * Four_Hour_Functions.multiplier
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closest (num1) {
    const values = Four_Hour_Nexus.finlevs.concat(Four_Hour_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    for (let item = 0; item < values.length; item++) {
      if (num1 < values[item]) {
        valdiffgreater.push(Math.abs(num1 - values[item]))
      }
      if (num1 > values[item]) {
        valdiffless.push(Math.abs(num1 - values[item]))
      }
    }
    const closestbelow = Four_Hour_Functions.price - Math.min(...valdiffless)
    const closestabove = Four_Hour_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return Math.min(...closests)
  }

  /** Counts pips between two values for buying */
  static pipCountBuy (num1, num2) {
    let nums
    nums = Four_Hour_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }

  /** Counts pips between two values for selling */
  static pipCountSell (num1, num2) {
    let nums
    nums = Four_Hour_Functions.pip(num1, num2)
    return (nums[0] - nums[1])
  }
}

class Daily_Functions {
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

  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Daily_Functions.priceHist = dataset.Daily.c
    Daily_Functions.highs = dataset.Daily.h
    Daily_Functions.lows = dataset.Daily.l
    Daily_Functions.extendHist = dataset['Daily Extend'].c
    Daily_Functions.extendHigh = dataset['Daily Extend'].h
    Daily_Functions.extendLow = dataset['Daily Extend'].l
  }

  static ValueAssigner () {
    Daily_Functions.price = liveprice
  }

  static trend () {
    Daily_Functions.recentHist()
    const hist = Daily_Functions.recentHisto
    const x = []
    const length = hist.length
    for (let value = 0; value < length; value++) { x.push(value) }
    const y = hist
    const regressions = new regression.SimpleLinearRegression(x, y)
    const slope = regressions.slope
    if (slope > 1) {
      return true
    } else if (slope < 1) {
      return false
    }
  }

  /* make  function */
  /* let data = request() */
  static getPrice () {
    return Daily_Functions.price
  }

  static priceHistory () {
    return Daily_Functions.priceHist
  }

  static recentHist () {
    const history = Daily_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 30; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Daily_Functions.recentHisto = historytwo.reverse()
  }

  static priceZones () {
    const biggersupres = Daily_Functions.supreslevs()
    return biggersupres
  }

  /* Add Key Part That the Levels Must Repeat 3x */
  static supreslevs () {
    const history = Daily_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const difference = ceiling - floor
    const levels = []
    const levelss = []
    let levelsss = []
    let finalLevs = []
    let count = 0
    for (let item = 0; item < history.length; item++) { levels.push((history[item] - floor) / (difference)) }
    for (let item = 0; item < levels.length; item++) { levels[item] = levels[item].toFixed(3) }
    for (let item = 0; item < levels.length; item++) {
      for (let items = 0; items < levels.length; items++) {
        if (levels[item] == levels[items]) {
          count++
        }
      }
      if (count > 3) {
        levelss.push(levels[item])
      }
      count = 0
    }
    levelsss = [...new Set(levelss)]
    finalLevs = levelsss
    Daily_Functions.getPrice()
    const price = Daily_Functions.price
    const larger = []
    const smaller = []
    const largertwo = []
    const smallertwo = []
    const smaller_diff = []
    const larger_diff = []
    for (let item = 0; item < finalLevs.length; item++) {
      if (price > ((finalLevs[item] * difference) + floor)) { smaller.push(((finalLevs[item] * difference) + floor)) }
      if (price < ((finalLevs[item] * difference) + floor)) { larger.push(((finalLevs[item] * difference) + floor)) }
    }
    for (let item = 0; item < smaller.length; item++) {
      if (Math.abs(Four_Hour_Functions.valdiff(price, smaller[item])) > 0.05) {
        smallertwo.push(smaller[item])
      }
    }
    for (let item = 0; item < larger.length; item++) {
      if (Math.abs(Four_Hour_Functions.valdiff(price, larger[item])) > 0.05) {
        largertwo.push(larger[item])
      }
    }
    if (smallertwo.length < 1) {
      smallertwo.push(price - Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    if (largertwo.length < 1) {
      largertwo.push(price + Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    for (let item = 0; item < smallertwo.length; item++) {
      smaller_diff.push(Math.abs((smallertwo[item] - price)))
    }
    for (let item = 0; item < largertwo.length; item++) {
      larger_diff.push(Math.abs((largertwo[item] - price)))
    }
    const support = price - Math.min(...smaller_diff)
    const resistance = price + Math.min(...larger_diff)
    Daily_Functions.support = support
    Daily_Functions.resistance = resistance
    for (const item in finalLevs) {
      finalLevs[item] = (finalLevs[item] * difference) + floor
    }
    Daily_Functions.finlevs = finalLevs
  }

  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      Daily_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 3) {
      Daily_Functions.multiplier = 100
    } else if (String(num1).indexOf('.') == 4) {
      Daily_Functions.multiplier = 10
    } else if (String(num1).indexOf('.') == 5) {
      Daily_Functions.multiplier = 1
    } else if (String(num1).indexOf('.') == 5) {
      Daily_Functions.multiplier = 0.1
    } else if (String(num1).indexOf('.') == 6) {
      Daily_Functions.multiplier = 0.01
    } else if (String(num1).indexOf('.') == 7) {
      Daily_Functions.multiplier = 0.001
    } else if (String(num1).indexOf('.') == 8) {
      Daily_Functions.multiplier = 0.0001
    } else if (String(num1).indexOf('.') == 9) {
      Daily_Functions.multiplier = 0.00001
    } else if (String(num1).indexOf('.') == 10) {
      Daily_Functions.multiplier = 0.000001
    } else { Daily_Functions.multiplier = 10000 }
    num1 *= Daily_Functions.multiplier
    num2 *= Daily_Functions.multiplier
    return [num1, num2]
  }

  static instrument_catalog (instrument) {
  }

  static pipCountBuy (num1, num2) {
    let nums
    nums = Daily_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }
}

class Weekly_Functions {
  multiplier = 0
  priceHist = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  finlevs = []
  support = 0
  resistance = 0
  highs = []
  lows = []

  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Weekly_Functions.priceHist = dataset.Weekly.c
    Weekly_Functions.highs = dataset.Weekly.h
    Weekly_Functions.lows = dataset.Weekly.l
  }

  static ValueAssigner () {
    Weekly_Functions.price = liveprice
  }

  /* make  function */
  /* let data = request() */
  static getPrice () {
    return Weekly_Functions.price
  }

  static priceHistory () {
    return Weekly_Functions.priceHist
  }

  static recentHist () {
    const history = Weekly_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 30; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Weekly_Functions.recentHisto = historytwo.reverse()
  }

  static priceZones () {
    const biggersupres = Weekly_Functions.supreslevs()
    return biggersupres
  }

  /* Add Key Part That the Levels Must Repeat 3x */
  static supreslevs () {
    const history = Weekly_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const difference = ceiling - floor
    const levels = []
    const levelss = []
    let levelsss = []
    let finalLevs = []
    let count = 0
    for (let item = 0; item < history.length; item++) { levels.push((history[item] - floor) / (difference)) }
    for (let item = 0; item < levels.length; item++) { levels[item] = levels[item].toFixed(3) }
    for (let item = 0; item < levels.length; item++) {
      for (let items = 0; items < levels.length; items++) {
        if (levels[item] == levels[items]) {
          count++
        }
      }
      if (count > 3) {
        levelss.push(levels[item])
      }
      count = 0
    }
    levelsss = [...new Set(levelss)]
    finalLevs = levelsss
    Weekly_Functions.getPrice()
    const price = Weekly_Functions.price
    const larger = []
    const smaller = []
    const largertwo = []
    const smallertwo = []
    const smaller_diff = []
    const larger_diff = []
    for (let item = 0; item < finalLevs.length; item++) {
      if (price > ((finalLevs[item] * difference) + floor)) { smaller.push(((finalLevs[item] * difference) + floor)) }
      if (price < ((finalLevs[item] * difference) + floor)) { larger.push(((finalLevs[item] * difference) + floor)) }
    }
    for (let item = 0; item < smaller.length; item++) {
      if (Math.abs(Four_Hour_Functions.valdiff(price, smaller[item])) > 0.05) {
        smallertwo.push(smaller[item])
      }
    }
    for (let item = 0; item < larger.length; item++) {
      if (Math.abs(Four_Hour_Functions.valdiff(price, larger[item])) > 0.05) {
        largertwo.push(larger[item])
      }
    }
    if (smallertwo.length < 1) {
      smallertwo.push(price - Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    if (largertwo.length < 1) {
      largertwo.push(price + Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    for (let item = 0; item < smallertwo.length; item++) {
      smaller_diff.push(Math.abs((smallertwo[item] - price)))
    }
    for (let item = 0; item < largertwo.length; item++) {
      larger_diff.push(Math.abs((largertwo[item] - price)))
    }
    const support = price - Math.min(...smaller_diff)
    const resistance = price + Math.min(...larger_diff)
    Weekly_Functions.support = support
    Weekly_Functions.resistance = resistance
    for (const item in finalLevs) {
      finalLevs[item] = (finalLevs[item] * difference) + floor
    }
    Weekly_Functions.finlevs = finalLevs
  }

  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      Weekly_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 3) {
      Weekly_Functions.multiplier = 100
    } else if (String(num1).indexOf('.') == 4) {
      Weekly_Functions.multiplier = 10
    } else if (String(num1).indexOf('.') == 5) {
      Weekly_Functions.multiplier = 1
    } else if (String(num1).indexOf('.') == 5) {
      Weekly_Functions.multiplier = 0.1
    } else if (String(num1).indexOf('.') == 6) {
      Weekly_Functions.multiplier = 0.01
    } else if (String(num1).indexOf('.') == 7) {
      Weekly_Functions.multiplier = 0.001
    } else if (String(num1).indexOf('.') == 8) {
      Weekly_Functions.multiplier = 0.0001
    } else if (String(num1).indexOf('.') == 9) {
      Weekly_Functions.multiplier = 0.00001
    } else if (String(num1).indexOf('.') == 10) {
      Weekly_Functions.multiplier = 0.000001
    } else { Weekly_Functions.multiplier = 10000 }
    num1 *= Weekly_Functions.multiplier
    num2 *= Weekly_Functions.multiplier
    return [num1, num2]
  }

  static instrument_catalog (instrument) {
  }

  static pipCountBuy (num1, num2) {
    let nums
    nums = Weekly_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }
}

class One_Hour_Functions {
  multiplier = 0
  priceHist = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  highs = []
  lows = []

  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    One_Hour_Functions.priceHist = dataset.One_Hour.c
    One_Hour_Functions.highs = dataset.One_Hour.h
    One_Hour_Functions.lows = dataset.One_Hour.l
    One_Hour_Functions.extendHist = dataset['One_Hour Extend'].c
    One_Hour_Functions.extendHigh = dataset['One_Hour Extend'].h
    One_Hour_Functions.extendLow = dataset['One_Hour Extend'].l
  }

  static trend () {
    const history = One_Hour_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] > history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] < history[history.length - 3]) { return false }
  }

  static rsi () {
    const history = One_Hour_Functions.priceHist
    const history2 = []
    for (let item = 0; item < history.length; item++) { history2.push(history[item]) }
    history2.splice(-1, 1)
    const q = rsis.calculate({ period: 14, values: history })
    const r = rsis.calculate({ period: 14, values: history2 })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static macd () {
    const history = One_Hour_Functions.priceHist
    const x = []
    const q = emas.calculate({ period: 12, values: history })
    const r = emas.calculate({ period: 26, values: history })
    const s = macds.calculate({ values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false })
    for (let i = 0; i < r.length; i++) { x.push(q[i + 14] - r[i]) }
    const qlast = s[s.length - 1].histogram
    const rlast = s[s.length - 2].histogram
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static ema () {
    const history = One_Hour_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static obv () {
    const history = One_Hour_Functions.priceHist
    const qs = rsis.calculate({ period: 14, values: history })
    const q = emas.calculate({ period: 8, values: qs })
    const qlast = q[q.length - 1]
    const r = emas.calculate({ period: 14, values: qs })
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }
}

class Thirty_Min_Functions {
  multiplier = 0
  priceHist = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  lows = []
  highs = []

  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Thirty_Min_Functions.priceHist = dataset.Thirty_Min.c
    Thirty_Min_Functions.highs = dataset.Thirty_Min.h
    Thirty_Min_Functions.lows = dataset.Thirty_Min.l
  }

  static consolidationtwo () {
    const history = Thirty_Min_Functions.priceHist
    const highs = Thirty_Min_Functions.highs
    const lows = Thirty_Min_Functions.lows
    const histmax = Math.max(...history)
    const histmin = Math.min(...history)
    const histdiff = histmax - histmin
    const q = bolls.calculate({ period: 10, values: history, stdDev: 1 })
    const n = tr.calculate({ high: highs, low: lows, close: history, period: 8 })
    const h = new Array()
    const i = []
    const j = []
    for (let value = 0; value < q.length; value++) {
      h.push(q[value].lower)
      i.push(q[value].upper)
      j.push(q[value].middle)
    }
    const smmas = smas.calculate({ period: 14, values: h })
    const smmass = smas.calculate({ period: 14, values: i })
    /* keep midpoint just in case */
    const smmasss = smas.calculate({ period: 14, values: j })
    const smmaslast = smmas[smmas.length - 1]
    const smmasslast = smmass[smmass.length - 1]
    const smadiff = smmasslast - smmaslast
    const ndiffone = n[n.length - 1] - n[n.length - 2]
    const ndifftwo = n[n.length - 2] - n[n.length - 3]
    const benchmark = 0.0125 * histdiff
    if (smadiff > benchmark) {
      return false
    } else {
      return true
    }
  }

  static trend () {
    const history = Thirty_Min_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] > history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] < history[history.length - 3]) { return false }
  }

  static rsi () {
    const history = Thirty_Min_Functions.priceHist
    const history2 = []
    for (let item = 0; item < history.length; item++) { history2.push(history[item]) }
    history2.splice(-1, 1)
    const q = rsis.calculate({ period: 14, values: history })
    const r = rsis.calculate({ period: 14, values: history2 })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static macd () {
    const history = Thirty_Min_Functions.priceHist
    const x = []
    const q = emas.calculate({ period: 12, values: history })
    const r = emas.calculate({ period: 26, values: history })
    const s = macds.calculate({ values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false })
    for (let i = 0; i < r.length; i++) { x.push(q[i + 14] - r[i]) }
    const qlast = s[s.length - 1].histogram
    const rlast = s[s.length - 2].histogram
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static ema () {
    const history = Thirty_Min_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static obv () {
    const history = Thirty_Min_Functions.priceHist
    const qs = rsis.calculate({ period: 14, values: history })
    const q = emas.calculate({ period: 8, values: qs })
    const qlast = q[q.length - 1]
    const r = emas.calculate({ period: 14, values: qs })
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }
}

class Fifteen_Min_Functions {
  multiplier = 0
  priceHist = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  lows = []
  highs = []

  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Fifteen_Min_Functions.priceHist = dataset.Fifteen_Min.c
    Fifteen_Min_Functions.highs = dataset.Fifteen_Min.h
    Fifteen_Min_Functions.lows = dataset.Fifteen_Min.l
  }

  static consolidationtwo () {
    const history = Fifteen_Min_Functions.priceHist
    const highs = Fifteen_Min_Functions.highs
    const lows = Fifteen_Min_Functions.lows
    const histmax = Math.max(...history)
    const histmin = Math.min(...history)
    const histdiff = histmax - histmin
    const q = bolls.calculate({ period: 10, values: history, stdDev: 1 })
    const n = tr.calculate({ high: highs, low: lows, close: history, period: 8 })
    const h = new Array()
    const i = []
    const j = []
    for (let value = 0; value < q.length; value++) {
      h.push(q[value].lower)
      i.push(q[value].upper)
      j.push(q[value].middle)
    }
    const smmas = smas.calculate({ period: 14, values: h })
    const smmass = smas.calculate({ period: 14, values: i })
    /* keep midpoint just in case */
    const smmasss = smas.calculate({ period: 14, values: j })
    const smmaslast = smmas[smmas.length - 1]
    const smmasslast = smmass[smmass.length - 1]
    const smadiff = smmasslast - smmaslast
    const ndiffone = n[n.length - 1] - n[n.length - 2]
    const ndifftwo = n[n.length - 2] - n[n.length - 3]
    const benchmark = 0.0125 * histdiff
    if (smadiff > benchmark) {
      return false
    } else {
      return true
    }
  }

  static trend () {
    const history = Fifteen_Min_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] > history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] < history[history.length - 3]) { return false }
  }

  static rsi () {
    const history = Fifteen_Min_Functions.priceHist
    const history2 = []
    for (let item = 0; item < history.length; item++) { history2.push(history[item]) }
    history2.splice(-1, 1)
    const q = rsis.calculate({ period: 14, values: history })
    const r = rsis.calculate({ period: 14, values: history2 })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static macd () {
    const history = Fifteen_Min_Functions.priceHist
    const x = []
    const q = emas.calculate({ period: 12, values: history })
    const r = emas.calculate({ period: 26, values: history })
    const s = macds.calculate({ values: history, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false })
    for (let i = 0; i < r.length; i++) { x.push(q[i + 14] - r[i]) }
    const qlast = s[s.length - 1].histogram
    const rlast = s[s.length - 2].histogram
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static ema () {
    const history = Fifteen_Min_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static obv () {
    const history = Fifteen_Min_Functions.priceHist
    const qs = rsis.calculate({ period: 14, values: history })
    const q = emas.calculate({ period: 8, values: qs })
    const qlast = q[q.length - 1]
    const r = emas.calculate({ period: 14, values: qs })
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }
}

var dataset = {}
var liveprice = 0

export function testfourhour (data, price, instrument) {
  instrum = instrument
  liveprice = price
  dataset = data
  Four_Hour_Nexus.controlMain()
}
/* Edit Trailing Stop Loss so that there is a sort of "bubble" or "cloud" that follows the price around and gives it some space to rebound up or down
depending on the type of trade, so that it doesn't result in trades that exit super early due to opposite price action */
/* Fix all issues and complete working of the project so you can sell it, get updates from Erm n Pat */
/* Update: 6/04/22: Only thing left is to see how fibonnaci can be added to the program, as fibonacci
                            may not be needed due to support and resistance levels already being used */

/* Update: 6/07/22: Aside from fib, make sure to change the supreslevs filler support and resistance levels to a variable pip value of the average of
                            the last 15 candles */
/* UPDATE: THIS HAS BEEN COMPLETED. */

/* Bro this app is gonna take off I promise. Get that grind on bro you got this. */

/* © 2024 Emraan Adem Ibrahim. See the license terms in the file 'license.txt' which should
 have been included with this distribution. */
