import * as fs from 'fs'
import * as regression from 'ml-regression-simple-linear'
import { EMA as emas, RSI as rsis, MACD as macds, ROC as rocs, BollingerBands as bolls, SMA as smas, ATR as tr } from 'technicalindicators'
import { createModel } from 'polynomial-regression'
import * as nerdamer from 'nerdamer/all.min.js'
import * as roots from 'kld-polynomial'
import { sendSignal } from './metatrader-connector.js'

// At the top of the file after imports
let instrum = '';
var dataset = {};
var liveprice = 0;

class Thirty_Min_Nexus {
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
  backtest = false

  /** announce price zones and price channels */
  static announcer () {
    if (Thirty_Min_Nexus.pzone == false && Thirty_Min_Functions.priceZones() == true) {
      Thirty_Min_Nexus.pzone = true
      console.log('Price Zone Identified')
    } if (Thirty_Min_Nexus.pzone == true && Thirty_Min_Functions.priceZones() == false) {
      Thirty_Min_Nexus.pzone = false
    } if (Thirty_Min_Nexus.pchan == false && Thirty_Min_Functions.priceChannels() == true) {
      Thirty_Min_Nexus.pchan = true
      console.log('Price Channel Identified')
    } if (Thirty_Min_Nexus.pchan == true && Thirty_Min_Functions.priceChannels() == false) {
      Thirty_Min_Nexus.pchan = false
    }
  }

  /** stop loss for buys */
  static stopLossBuy () {
    if (Thirty_Min_Functions.price <= Thirty_Min_Nexus.sl) {
      Thirty_Min_Nexus.closePosSL()
    }
  }

  /** stop loss for selling */
  static stopLossSell () {
    if (Thirty_Min_Functions.price >= Thirty_Min_Nexus.sl) {
      Thirty_Min_Nexus.closePosSL()
    }
  }

  /** initiates the piplog for pipcounting */
  static piploginit () {
    Thirty_Min_Nexus.piplog = [0, 0, 0]
  }

  /** pip logging method */
  static piplogger () {
    const piplogging = Thirty_Min_Nexus.piplog
    if (Thirty_Min_Nexus.buy_pos) {
      piplogging.push(Thirty_Min_Functions.pipCountBuy(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price))
      Thirty_Min_Nexus.bigpipprice = Math.max(...piplogging)
      Thirty_Min_Nexus.piplog = piplogging
    }
    if (Thirty_Min_Nexus.sell_pos) {
      piplogging.push(Thirty_Min_Functions.pipCountSell(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price))
      Thirty_Min_Nexus.bigpipprice = Math.max(...piplogging)
      Thirty_Min_Nexus.piplog = piplogging
    }
  }

  /** take profit for buying */
  static takeProfitBuy () {
    if (Thirty_Min_Functions.price >= Thirty_Min_Nexus.tp) {
      if (Thirty_Min_Functions.volatility() > 0.618) {
        if ((Thirty_Min_Functions.price - Thirty_Min_Nexus.tp) > (Thirty_Min_Nexus.tp - Thirty_Min_Nexus.tstoploss)) {
          if (Thirty_Min_Nexus.tp < Thirty_Min_Nexus.tptwo) {
            Thirty_Min_Nexus.piploginit()
            Thirty_Min_Nexus.posprice = Thirty_Min_Nexus.tp
            Thirty_Min_Nexus.tp = Thirty_Min_Nexus.tptwo
            Thirty_Min_Functions.tpvariation()
            console.log('pair: ' + Thirty_Min_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Thirty_Min_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Thirty_Min_Nexus.tptwo))
          }
        }
      } else {
        Thirty_Min_Nexus.closePosTP()
      }
    } else if (Thirty_Min_Functions.price <= Thirty_Min_Nexus.tstoploss) {
      Thirty_Min_Nexus.closePosTP()
    } else if (Thirty_Min_Functions.price == Thirty_Min_Nexus.tptwo) {
      Thirty_Min_Nexus.closePosTP()
    }
  }

  /** take profit for selling */
  static takeProfitSell () {
    if (Thirty_Min_Functions.price <= Thirty_Min_Nexus.tp) {
      if (Thirty_Min_Functions.volatility() > 0.618) {
        if ((Thirty_Min_Nexus.tp - Thirty_Min_Functions.price) > (Thirty_Min_Nexus.tstoploss - Thirty_Min_Nexus.tp)) {
          if (Thirty_Min_Nexus.tp < Thirty_Min_Nexus.tptwo) {
            Thirty_Min_Nexus.piploginit()
            Thirty_Min_Nexus.posprice = Thirty_Min_Nexus.tp
            Thirty_Min_Nexus.tp = Thirty_Min_Nexus.tptwo
            Thirty_Min_Functions.tpvariation()
            console.log('pair: ' + Thirty_Min_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Thirty_Min_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Thirty_Min_Nexus.tptwo))
          }
        }
      } else {
        Thirty_Min_Nexus.closePosTP()
      }
    } else if (Thirty_Min_Functions.price >= Thirty_Min_Nexus.tstoploss) {
      Thirty_Min_Nexus.closePosTP()
    } else if (Thirty_Min_Functions.price == Thirty_Min_Nexus.tptwo) {
      Thirty_Min_Nexus.closePosTP()
    }
  }

  /** stop loss defining method */
  static stoplossdef () {
    const stoploss = Thirty_Min_Functions.stoploss()
    if (Thirty_Min_Nexus.buy_pos) {
      Thirty_Min_Nexus.sl = Thirty_Min_Functions.price - stoploss
    }
    if (Thirty_Min_Nexus.sell_pos) {
      Thirty_Min_Nexus.sl = Thirty_Min_Functions.price + stoploss
    }
  }

  /** define volatility for the system, tells me whether or not to alter trailing stop loss */
  static volatilitydef () {
    if (Thirty_Min_Functions.volatility() > 0.618 && Thirty_Min_Nexus.tstoplossinits && !Thirty_Min_Nexus.tstoplossvoid) {
      Thirty_Min_Nexus.tstoplossdefvol()
    }
  }

  /** initiate trailing stop loss */
  static tstoplossinit () {
    const stoploss = Thirty_Min_Nexus.sldiff
    if (!Thirty_Min_Nexus.tstop && !Thirty_Min_Nexus.tstoplossinits && !Thirty_Min_Nexus.tstoplossvoid) {
      if (Thirty_Min_Nexus.buy_pos) {
        if (Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + 0.3 * stoploss) {
          Thirty_Min_Nexus.tstoplossinits = true
          Thirty_Min_Nexus.tstoplossdef()
        }
      }
      if (Thirty_Min_Nexus.sell_pos) {
        if (Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - 0.3 * stoploss) {
          Thirty_Min_Nexus.tstoplossinits = true
          Thirty_Min_Nexus.tstoplossdef()
        }
      }
    }
  }

  /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
  static tstoplossdefvol () {
    Thirty_Min_Nexus.sldiff = Thirty_Min_Functions.stoploss()
    const stoploss = Thirty_Min_Nexus.sldiff
    if (Thirty_Min_Nexus.buy_pos) {
      if (Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + 0.3 * stoploss) {
        Thirty_Min_Nexus.tstop = true
        Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice + (((Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.posprice)) * (Thirty_Min_Functions.trailingsl())))
      }
    }
    if (Thirty_Min_Nexus.sell_pos) {
      if (Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - 0.3 * stoploss) {
        Thirty_Min_Nexus.tstop = true
        Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice - (((Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.posprice)) * (Thirty_Min_Functions.trailingsl())))
      }
    }
  }

  /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility */
  static tstoplosscheck () {
    const tstoploss = Thirty_Min_Nexus.sldiff
    if (Thirty_Min_Nexus.buy_pos) {
      if (Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice + 0.3 * tstoploss) {
        Thirty_Min_Nexus.tstoplossvoid = true
      } else {
        Thirty_Min_Nexus.tstoplossvoid = false
        Thirty_Min_Nexus.volatilitydef()
        Thirty_Min_Nexus.tstoplossinit()
      }
    }
    if (Thirty_Min_Nexus.sell_pos) {
      if (Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice - 0.3 * tstoploss) {
        Thirty_Min_Nexus.tstoplossvoid = true
      } else {
        Thirty_Min_Nexus.tstoplossvoid = false
        Thirty_Min_Nexus.volatilitydef()
        Thirty_Min_Nexus.tstoplossinit()
      }
    }
  }

  /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
  static tstoplosscont () {
    if (Thirty_Min_Functions.volatility() < 0.618 && Thirty_Min_Nexus.tstoplossinits && !Thirty_Min_Nexus.tstoplossvoid) {
      Thirty_Min_Nexus.sldiff = Thirty_Min_Functions.stoploss()
      const stoploss = Thirty_Min_Nexus.sldiff
      if (Thirty_Min_Nexus.buy_pos) {
        if (Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + 0.3 * stoploss) {
          Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice + Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, 0.618 * Thirty_Min_Nexus.bigpipprice)
        }
      }
      if (Thirty_Min_Nexus.sell_pos) {
        if (Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - 0.3 * stoploss) {
          Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice - Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, 0.618 * Thirty_Min_Nexus.bigpipprice)
        }
      }
    }
  }

  /** method that defines trailing stop loss for the system to begin with trailing stop loss */
  static tstoplossdef () {
    Thirty_Min_Nexus.sldiff = Thirty_Min_Functions.stoploss()
    const stoploss = Thirty_Min_Nexus.sldiff
    if (Thirty_Min_Nexus.buy_pos) {
      if (Thirty_Min_Functions.price > Thirty_Min_Nexus.posprice + 0.3 * stoploss) {
        Thirty_Min_Nexus.tstop = true
        Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice + Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, 0.618 * Thirty_Min_Nexus.bigpipprice)
      }
    }
    if (Thirty_Min_Nexus.sell_pos) {
      if (Thirty_Min_Functions.price < Thirty_Min_Nexus.posprice - 0.3 * stoploss) {
        Thirty_Min_Nexus.tstop = true
        Thirty_Min_Nexus.tstoploss = Thirty_Min_Nexus.posprice - Thirty_Min_Functions.pipreverse(Thirty_Min_Nexus.posprice, 0.618 * Thirty_Min_Nexus.bigpipprice)
      }
    }
  }

  /* FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS! */

  /** initiates a buy signal */
  static buy () {
    Thirty_Min_Functions.supreslevs()
    Thirty_Min_Functions.getPrice()
    Thirty_Min_Functions.stoploss()
    Thirty_Min_Functions.tpvariation()
    if (!Thirty_Min_Functions.rejectionzoning()) {
      if (Math.abs(Thirty_Min_Functions.valdiff(Thirty_Min_Functions.price, Thirty_Min_Functions.closest(Thirty_Min_Functions.price))) > 0.025) {
        Thirty_Min_Nexus.tp = Thirty_Min_Nexus.resistance
        Thirty_Min_Nexus.pos = true
        Thirty_Min_Nexus.buy_pos = true
        Thirty_Min_Nexus.posprice = Thirty_Min_Functions.price
        Thirty_Min_Functions.stoploss()
        Thirty_Min_Functions.tpvariation()
        console.log('pair: ' + Thirty_Min_Nexus.pair)
        console.log('Open Buy Order on Thirty Min')
        console.log('Entry Price: ' + String(Thirty_Min_Nexus.posprice))
        console.log('Stop Loss: ' + String(Thirty_Min_Nexus.sl))
        console.log('Target Take Profit: ' + String(Thirty_Min_Nexus.tp))
        console.log('Take Profit 2: ' + String(Thirty_Min_Nexus.tptwo))
    }
    }
    
    // Add at the end of the method where a buy is executed:
    sendSignal(
      'BUY',
      Thirty_Min_Nexus.pair,
      Thirty_Min_Nexus.sl,
      Thirty_Min_Nexus.tp, 
      0.01,
      'ThirtyMin'
    );
  }

  /* static buy(){
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
  static sell () {
    Thirty_Min_Functions.supreslevs()
    Thirty_Min_Functions.getPrice()
    Thirty_Min_Functions.stoploss()
    Thirty_Min_Functions.tpvariation()
    if (!Thirty_Min_Functions.rejectionzoning()) {
      if (Math.abs(Thirty_Min_Functions.valdiff(Thirty_Min_Functions.price, Thirty_Min_Functions.closest(Thirty_Min_Functions.price))) > 0.025) {
        Thirty_Min_Nexus.tp = Thirty_Min_Nexus.support
        Thirty_Min_Nexus.pos = true
        Thirty_Min_Nexus.sell_pos = true
        Thirty_Min_Nexus.posprice = Thirty_Min_Functions.price
        Thirty_Min_Functions.stoploss()
        Thirty_Min_Functions.tpvariation()
        console.log('pair: ' + Thirty_Min_Nexus.pair)
        console.log('Open Sell Order on Thirty Min')
        console.log('Entry Price: ' + String(Thirty_Min_Nexus.posprice))
        console.log('Stop Loss: ' + String(Thirty_Min_Nexus.sl))
        console.log('Target Take Profit: ' + String(Thirty_Min_Nexus.tp))
        console.log('Take Profit 2: ' + String(Thirty_Min_Nexus.tptwo))
      }
    }
    
    // Add at the end of the method where a sell is executed:
    sendSignal(
      'SELL',
      Thirty_Min_Nexus.pair,
      Thirty_Min_Nexus.sl,
      Thirty_Min_Nexus.tp,
      0.01,
      'ThirtyMin'
    );
  }

  /* static sell(){
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
        } */

  /** checks for price movement in lower periods to get better idea of the trend */
  static controlSmallerPeriod () {
    try {
      /* Confirm Trend w/ indicators and price movement */
      Fifteen_Min_Functions.HistoryAssigner()
      Five_Min_Functions.HistoryAssigner()
      Four_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.stoploss()
      Thirty_Min_Functions.tpvariation()
      let buy = false
      let sell = false
      if (!Four_Hour_Functions.rejectionzoning() &&
            !Five_Min_Functions.consolidationtwo()) {
        if (Four_Hour_Functions.trend() && Fifteen_Min_Functions.ema()) {
          if (Fifteen_Min_Functions.trend() && Fifteen_Min_Functions.macd() && Fifteen_Min_Functions.obv()) {
            if (Five_Min_Functions.ema()) {
              if (Five_Min_Functions.rsi() && Five_Min_Functions.obv()) {
                buy = true
              }
            }
          }
        }
        if (!Four_Hour_Functions.trend() && !Fifteen_Min_Functions.ema()) {
          if (!Fifteen_Min_Functions.trend() && !Fifteen_Min_Functions.macd() && !Fifteen_Min_Functions.obv()) {
            if (!Five_Min_Functions.ema()) {
              if (!Five_Min_Functions.rsi() && !Five_Min_Functions.obv()) {
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
      Four_Hour_Functions.ValueAssigner()
      One_Hour_Functions.ValueAssigner()
      Four_Hour_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Four_Hour_Functions.priceZones()
      One_Hour_Functions.priceZones()
    } catch (error) {
      console.log(error)
    }
    let h = new Array()
    h = Four_Hour_Functions.finlevs
    const i = One_Hour_Functions.finlevs
    const totallevs = h.push(i)
    Thirty_Min_Nexus.biggersupres = totallevs
    Thirty_Min_Nexus.finlevs.concat(totallevs)
  }

  /** main control method, takes control of the entire program and serves as the brain */
  static controlMain () {
    try {
      Thirty_Min_Functions.HistoryAssigner()
      Thirty_Min_Functions.ValueAssigner()
      Thirty_Min_Functions.getPrice()
      Thirty_Min_Functions.stoploss()
      Fifteen_Min_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Five_Min_Functions.HistoryAssigner()
      Four_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.supreslevs()
      Four_Hour_Functions.supreslevs()
      One_Hour_Functions.supreslevs()
      Thirty_Min_Nexus.controlSmallerPeriod()
      Thirty_Min_Nexus.controlBiggerPeriod()
      Thirty_Min_Functions.recentHist()
      if (!Thirty_Min_Functions.consolidationtwo() && Thirty_Min_Functions.overall() && !Thirty_Min_Functions.consolidation() &&
            !Thirty_Min_Functions.keylev()) {
        if (Thirty_Min_Functions.ema()) {
          if (Thirty_Min_Nexus.controlSmallerPeriod()[0] == true) {
            if (Thirty_Min_Functions.trend() && Thirty_Min_Functions.rsi() &&
                            Thirty_Min_Functions.macd() && Thirty_Min_Functions.roc() && Thirty_Min_Functions.obv()) {
              if (!Thirty_Min_Nexus.pos) {
                if (!Thirty_Min_Nexus.buy_pos) { Thirty_Min_Nexus.pot_buy = true }
                Thirty_Min_Functions.stoploss()
                Thirty_Min_Nexus.piploginit()
                Thirty_Min_Nexus.buy()
              }
            }
          }
        }
        if (!Thirty_Min_Functions.ema()) {
          if (Thirty_Min_Nexus.controlSmallerPeriod()[1] == true) {
            if (!Thirty_Min_Functions.trend() && !Thirty_Min_Functions.rsi() &&
                            !Thirty_Min_Functions.macd() && !Thirty_Min_Functions.roc() && !Thirty_Min_Functions.obv()) {
              if (!Thirty_Min_Nexus.pos) {
                if (!Thirty_Min_Nexus.sell_pos) { Thirty_Min_Nexus.pot_sell = true }
                Thirty_Min_Functions.stoploss()
                Thirty_Min_Nexus.piploginit()
                Thirty_Min_Nexus.sell()
              }
            }
          }
        }
      }
      if (Thirty_Min_Nexus.pos && Thirty_Min_Nexus.buy_pos) {
        Thirty_Min_Nexus.piplogger()
        Thirty_Min_Nexus.stopLossBuy()
        Thirty_Min_Nexus.tstoplosscheck()
        Thirty_Min_Nexus.tstoplosscont()
        Thirty_Min_Nexus.takeProfitBuy()
      }
      if (Thirty_Min_Nexus.pos && Thirty_Min_Nexus.sell_pos) {
        Thirty_Min_Nexus.piplogger()
        Thirty_Min_Nexus.stopLossSell()
        Thirty_Min_Nexus.tstoplosscheck()
        Thirty_Min_Nexus.tstoplosscont()
        Thirty_Min_Nexus.takeProfitSell()
      }
    } catch (error) {
      console.log(error)
    }
    /* figure out how to clear memory, and do so here after every iteration */
    /* memory issue solved: 4/20/22 */ }

  /** close position method for taking profit, and gives pip count and win/loss ratio */
  static closePosTP () {
    if (Thirty_Min_Nexus.pos) {
      if (Thirty_Min_Nexus.buy_pos) {
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
        const pipchange = Thirty_Min_Functions.pipCountBuy(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
        Thirty_Min_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Thirty_Min_Nexus.pair)
        console.log('Take Profit Hit on Thirty Min')
        console.log(Thirty_Min_Nexus.wins + ' Wins and     ' + Thirty_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Thirty_Min_Nexus.wins / Thirty_Min_Nexus.trades)
        console.log('Pip Count: ' + Thirty_Min_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Thirty_Min_Nexus.pair,
          0,
          0,
          0.01,
          'ThirtyMin'
        );
      }
      if (Thirty_Min_Nexus.sell_pos) {
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
        const pipchange = Thirty_Min_Functions.pipCountSell(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
        Thirty_Min_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Thirty_Min_Nexus.pair)
        console.log('Take Profit Hit on Thirty Min')
        console.log(Thirty_Min_Nexus.wins + ' Wins and     ' + Thirty_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Thirty_Min_Nexus.wins / Thirty_Min_Nexus.trades)
        console.log('Pip Count: ' + Thirty_Min_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Thirty_Min_Nexus.pair,
          0,
          0,
          0.01,
          'ThirtyMin'
        );
      }
    }
  }

  /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
  static closePosSL () {
    if (Thirty_Min_Nexus.pos) {
      if (Thirty_Min_Nexus.sell_pos) {
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
        const pipchange = Thirty_Min_Functions.pipCountSell(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
        Thirty_Min_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Thirty_Min_Nexus.pair)
        console.log('Stop Loss Hit on Thirty Min')
        console.log(Thirty_Min_Nexus.wins + ' Wins and     ' + Thirty_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Thirty_Min_Nexus.wins / Thirty_Min_Nexus.trades)
        console.log('Pip Count: ' + Thirty_Min_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Thirty_Min_Nexus.pair,
          0,
          0,
          0.01,
          'ThirtyMin'
        );
      }
      if (Thirty_Min_Nexus.buy_pos) {
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
        const pipchange = Thirty_Min_Functions.pipCountBuy(Thirty_Min_Nexus.posprice, Thirty_Min_Functions.price)
        Thirty_Min_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Thirty_Min_Nexus.pair)
        console.log('Stop Loss Hit on Thirty Min')
        console.log(Thirty_Min_Nexus.wins + ' Wins and     ' + Thirty_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Thirty_Min_Nexus.wins / Thirty_Min_Nexus.trades)
        console.log('Pip Count: ' + Thirty_Min_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Thirty_Min_Nexus.pair,
          0,
          0,
          0.01,
          'ThirtyMin'
        );
      }
    }
  }

  // Add a method for trailing stop modifications if applicable
  static updateTrailingStop() {
    if (Thirty_Min_Nexus.tstop && Thirty_Min_Nexus.pos) {
      sendSignal('ThirtyMin', {
        action: 'MODIFY',
        symbol: Thirty_Min_Nexus.pair,
        stopLoss: Thirty_Min_Nexus.tstoploss,
        takeProfit: Thirty_Min_Nexus.tp,
        reason: 'Trailing stop update from 30-min strategy'
      });
    }
  }
}

class Thirty_Min_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  rejectionzones = new Array()
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
  static instrument_name () {
    Thirty_Min_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Thirty_Min_Functions.instrument_name()
    Thirty_Min_Functions.priceHist = dataset.Thirty_Min.c
    Thirty_Min_Functions.highs = dataset.Thirty_Min.h
    Thirty_Min_Functions.lows = dataset.Thirty_Min.l
    Thirty_Min_Functions.extendHist = dataset.Thirty_Min_Extend.c
    Thirty_Min_Functions.extendHigh = dataset.Thirty_Min_Extend.h
    Thirty_Min_Functions.extendLow = dataset.Thirty_Min_Extend.l
  }

  /** load price from json file */
  static ValueAssigner () {
    Thirty_Min_Functions.price = liveprice
  }

  /** second consolidation method, meant to strengthen consolidation identification */
  static consolidationtwo () {
    const history = Thirty_Min_Functions.priceHist;
    const highs = Thirty_Min_Functions.highs;
    const lows = Thirty_Min_Functions.lows;
    const histmax = Math.max(...highs);
    const histmin = Math.min(...lows);
    
    // More data points needed for 30min timeframe
    const minDataPoints = 30;
    if (history.length < minDataPoints) {
        return true;
    }
    
    // Longer lookback for 30min to catch patterns
    const lookbackPeriod = Math.min(60, history.length);
    const recentHistory = history.slice(-lookbackPeriod);
    const recentHighs = highs.slice(-lookbackPeriod);
    const recentLows = lows.slice(-lookbackPeriod);
    const recentClose = history.slice(-lookbackPeriod);
    
    // Tighter Bollinger Bands for 30min
    const bollingerBands = bolls.calculate({
        period: 20,
        values: recentHistory,
        stdDev: 1.8 // Tighter for 30min
    });
    
    const bandWidths = bollingerBands.map(band => (band.upper - band.lower) / band.middle);
    const recentBandWidths = bandWidths.slice(-6); // More recent periods
    const avgBandWidth = recentBandWidths.reduce((sum, width) => sum + width, 0) / recentBandWidths.length;
    
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0];
    const isTightBands = avgBandWidth < 0.015; // Tighter threshold for 30min
    
    // True Range analysis
    const trValues = tr.calculate({
        high: recentHighs,
        low: recentLows,
        close: recentClose,
        period: 14
    });
    
    const recentTR = trValues.slice(-6);
    const avgTR = recentTR.reduce((sum, val) => sum + val, 0) / recentTR.length;
    const normalizedATR = avgTR / recentHistory[recentHistory.length - 1];
    
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0];
    const isLowVolatility = normalizedATR < 0.006; // Tighter for 30min
    
    // Range analysis
    const priceRange = histmax - histmin;
    const priceRangePercent = priceRange / histmin;
    
    const sum = recentHistory.reduce((a, b) => a + b, 0);
    const mean = sum / recentHistory.length;
    const stdDev = Math.sqrt(
        recentHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentHistory.length
    );
    const relativeStdDev = stdDev / mean;
    
    const isNarrowRange = priceRangePercent < 0.015; // Tighter for 30min
    const isLowDeviation = relativeStdDev < 0.008; // Tighter for 30min
    
    // Directional analysis - more moves needed for 30min
    let hasDirectionalMovement = false;
    let consecutiveHigherHighs = 0;
    let consecutiveLowerLows = 0;
    const pattern_window = 6; // More candles for 30min
    
    for (let i = 1; i < pattern_window; i++) {
        if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1]) {
            consecutiveHigherHighs++;
        }
        if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1]) {
            consecutiveLowerLows++;
        }
    }
    
    if (consecutiveHigherHighs >= 4 || consecutiveLowerLows >= 4) { // More moves needed
        hasDirectionalMovement = true;
    }
    
    // Scoring system
    let consolidationScore = 0;
    let totalFactors = 0;
    
    if (bandWidthShrinking) consolidationScore++;
    if (isTightBands) consolidationScore++;
    totalFactors += 2;
    
    if (trTrend) consolidationScore++;
    if (isLowVolatility) consolidationScore++;
    totalFactors += 2;
    
    if (isNarrowRange) consolidationScore++;
    if (isLowDeviation) consolidationScore++;
    totalFactors += 2;
    
    if (!hasDirectionalMovement) consolidationScore++;
    totalFactors += 1;
    
    const consolidationProbability = consolidationScore / totalFactors;
    return consolidationProbability >= 0.65; // Stricter threshold for 30min
  }

  /** TP variation, helps change TP depending on volatility and price movement depending on whether or not the code has surpassed TP1 and
     * is about to hit TP2
     */
  static tpvariation () {
    const tp = Thirty_Min_Nexus.tp
    const values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    const num1 = Thirty_Min_Nexus.price
    const volval = Thirty_Min_Functions.volatility()
    if (Thirty_Min_Nexus.buy_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 < values[item]) {
          valdiffgreater.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Thirty_Min_Nexus.tp
      filteredvaldiff = [...new Set(valdiffgreater)]
      for (const valuers in filteredvaldiff) {
        referenceval = closesttp - num1
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Thirty_Min_Nexus.tp = Thirty_Min_Functions.price + (Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)) {
          nexttp = Thirty_Min_Functions.price + (Math.abs(Thirty_Min_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Thirty_Min_Functions.price + ((Thirty_Min_Nexus.tp - Thirty_Min_Functions.price) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)) {
          nexttp = Thirty_Min_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Thirty_Min_Functions.price + ((Thirty_Min_Functions.tp - Thirty_Min_Functions.price) * 1.382)
        }
      }
    }
    if (Thirty_Min_Nexus.sell_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 > values[item]) {
          valdiffless.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Thirty_Min_Nexus.tp
      filteredvaldiff = [...new Set(valdiffless)]
      for (const valuers in filteredvaldiff) {
        referenceval = num1 - closesttp
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Thirty_Min_Nexus.tp = Thirty_Min_Functions.price - (Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)) {
          nexttp = Thirty_Min_Functions.price - (Math.abs(Thirty_Min_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Thirty_Min_Functions.price - ((Thirty_Min_Functions.price - Thirty_Min_Nexus.tp) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Thirty_Min_Functions.price)) {
          nexttp = Thirty_Min_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Thirty_Min_Functions.price - ((Thirty_Min_Functions.price - Thirty_Min_Nexus.tp) * 1.382)
        }
      }
    }
    Thirty_Min_Nexus.tptwo = nexttp
  }

  /** fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
  static fib () {
    const recents = Thirty_Min_Functions.recentHisto
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
    const currentprice = Thirty_Min_Functions.price
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

  /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition */
  static overall () {
    // ... existing code ...
    
    // Modified parameters to better suit thirty-minute timeframe
    const minConsolidationPeriod = 8  // Reduced from higher value
    const volatilityThreshold = 0.35  // Adjusted for 30min volatility characteristics
    const priceActionThreshold = 0.45 // More sensitive to price action on shorter timeframe
    
    // Check if we have enough price data
    if (Thirty_Min_Functions.priceHist && Thirty_Min_Functions.priceHist.length > 0) {
      const recentHistory = Thirty_Min_Functions.priceHist.slice(-25) // Look at last 25 candles
      const volatility = Thirty_Min_Functions.volatility()
      
      // Calculate price movement characteristics
      const highPoint = Math.max(...recentHistory)
      const lowPoint = Math.min(...recentHistory)
      const priceRange = highPoint - lowPoint
      const avgPrice = recentHistory.reduce((sum, price) => sum + price, 0) / recentHistory.length
      
      // Calculate standard deviation as a measure of volatility
      const stdDev = Thirty_Min_Functions.calculateStdDev(recentHistory)
      const normalizedStdDev = stdDev / avgPrice
      
      // Calculate directional movement
      const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length/2))
      const secondHalf = recentHistory.slice(Math.floor(recentHistory.length/2))
      const firstAvg = firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length
      const directionStrength = Math.abs(secondAvg - firstAvg) / avgPrice
      
      // Check for consolidation pattern (sideways movement)
      const isConsolidating = normalizedStdDev < volatilityThreshold && 
                             directionStrength < priceActionThreshold &&
                             Thirty_Min_Functions.consolidationtwo()
      
      // Check recent price action relative to support/resistance
      if (Thirty_Min_Nexus.finlevs && Thirty_Min_Nexus.finlevs.length > 0) {
        const currentPrice = Thirty_Min_Functions.getPrice()
        const nearestLevel = Thirty_Min_Functions.closest(currentPrice)
        const distanceToLevel = Math.abs(currentPrice - nearestLevel) / currentPrice
        
        // If price is near a key level and volatility is moderate, more likely to trade
        if (distanceToLevel < 0.003 && normalizedStdDev > 0.0015 && normalizedStdDev < 0.006) {
          return true
        }
      }
      
      // Evaluate RSI and trend conditions
      const rsi = Thirty_Min_Functions.rsi()
      if ((rsi < 30 || rsi > 70) && Thirty_Min_Functions.trend() !== 'none') {
        // Oversold or overbought conditions with a trend can be good for trading
        return true
      }
      
      // Combination of factors for decision
      if (isConsolidating && Thirty_Min_Functions.priceChannels()) {
        return true
      }
      
      // Look for breakout potential
      if (normalizedStdDev < volatilityThreshold * 0.7 && 
          directionStrength > priceActionThreshold * 0.8 &&
          Thirty_Min_Functions.consolidation()) {
        return true
      }
    }
    
    return false
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis (cases, extendedhistory, pricerange, highs, lows, keyLevels) {
    // Initialize rejection zones array
    Thirty_Min_Functions.rejectionzones = []
    
    // Get current price and normal history
    const price = Thirty_Min_Functions.price
    const histnorm = Thirty_Min_Functions.priceHist
    
    // Calculate price statistics
    const priceStdDev = Thirty_Min_Functions.calculateStdDev(extendedhistory.slice(-50))
    const histRange = Math.max(...histnorm) - Math.min(...histnorm)
    
    // Significant price movement threshold (scaled by market volatility)
    const significantMove = histRange * 0.02
    
    // Calculate technical indicators
    const bollingerBands = bolls.calculate({ 
      period: 20, 
      values: extendedhistory, 
      stdDev: 2 
    })
    
    // Extract upper and lower bands
    const lowerBands = bollingerBands.map(band => band.lower)
    const upperBands = bollingerBands.map(band => band.upper)
    const middleBands = bollingerBands.map(band => band.middle)
    
    // Calculate smoothed versions for trend detection
    const smoothedLower = smas.calculate({ period: 10, values: lowerBands })
    const smoothedUpper = smas.calculate({ period: 10, values: upperBands })
    const smoothedMiddle = smas.calculate({ period: 10, values: middleBands })
    
    // Define rejection threshold based on market volatility - increased to make rejection zones harder to identify
    const rejectionThreshold = 5.5
    
    // Define volatility based threshold adjustment
    const volAdjustment = Thirty_Min_Functions.volatility ? 
      Math.max(0.8, Math.min(1.2, Thirty_Min_Functions.volatility() * 10)) : 
      1.0
      
    // Track identified rejection zones
    const rejectionZones = []
    let rejection = 0
    
    // Extract indices from cases for analysis
    const potentialRejectionPoints = cases.map(c => c[0])
    
    // Analyze each potential rejection point
    for (let i = 0; i < potentialRejectionPoints.length; i++) {
      const idx = potentialRejectionPoints[i]
      
      // Skip if too close to start or end of data
      if (idx < 5 || idx >= extendedhistory.length - 5) continue
      
      // Count patterns that suggest rejection
      let rejectionEvidence = 0
      
      // Pattern 1: Local high/low formations
      let isLocalHigh = true
      let isLocalLow = true
      
      for (let j = 1; j <= 3; j++) {
        // Check if local high
        if (extendedhistory[idx] <= extendedhistory[idx - j] || 
            extendedhistory[idx] <= extendedhistory[idx + j]) {
          isLocalHigh = false
        }
        
        // Check if local low
        if (extendedhistory[idx] >= extendedhistory[idx - j] || 
            extendedhistory[idx] >= extendedhistory[idx + j]) {
          isLocalLow = false
        }
      }
      
      if (isLocalHigh || isLocalLow) rejectionEvidence += 2
      
      // Pattern 2: Price reversal after reaching this level
      const preBehavior = extendedhistory[idx] - extendedhistory[idx - 3]
      const postBehavior = extendedhistory[idx + 3] - extendedhistory[idx]
      
      // If direction changed after this point (sign change between pre and post)
      if (preBehavior * postBehavior < 0 && 
          Math.abs(postBehavior) > significantMove) {
        rejectionEvidence += 1.5
      }
      
      // Pattern 3: Proximity to Bollinger Band
      const bandProximity = Math.min(
        Math.abs(extendedhistory[idx] - upperBands[idx]), 
        Math.abs(extendedhistory[idx] - lowerBands[idx])
      )
      
      if (bandProximity < priceStdDev * 0.5) {
        rejectionEvidence += 1
      }
      
      // Pattern 4: Volume spike analysis if available (stub for future implementation)
      // if (volume data available) { check for volume spike }
      
      // Pattern 5: Candlestick patterns if available
      if (highs && lows) {
        const highLowRange = highs[idx] - lows[idx]
        const bodySize = Math.abs(extendedhistory[idx] - extendedhistory[idx-1])
        
        // Detect potential doji, hammer, or shooting star
        if (highLowRange > bodySize * 2) {
          rejectionEvidence += 1
        }
      }
      
      // Pattern 6: Check for confluence with key levels from multiple timeframes
      const currentPrice = extendedhistory[idx]
      for (const level of keyLevels) {
        const distancePercent = Math.abs(currentPrice - level) / currentPrice
        if (distancePercent < 0.005) { // Within 0.5%
          rejectionEvidence += 1.5
          break
        }
      }
      
      // Adjust evidence by volatility
      rejectionEvidence *= volAdjustment
      
      // If enough evidence found, mark as rejection zone
      if (rejectionEvidence >= rejectionThreshold) {
        rejection++
        rejectionZones.push(extendedhistory[idx])
        Thirty_Min_Functions.rejectionzones.push(extendedhistory[idx])
      }
    }
    
    // Check if current price is near an identified rejection zone
    let nearRejectionZone = false
    const rejectionProximityThreshold = priceStdDev * 2
    
    for (const zone of rejectionZones) {
      if (Math.abs(price - zone) < rejectionProximityThreshold) {
        nearRejectionZone = true
        break
      }
    }
    
    // Also check distance to newly identified zones that aren't yet in the system
    for (const zone of Thirty_Min_Functions.rejectionzones) {
      if (Math.abs(price - zone) < rejectionProximityThreshold) {
        nearRejectionZone = true
        break
      }
    }
    
    // Allow more rejection zones before prohibiting trades
    return !(rejection > 3 || nearRejectionZone)
  }
  
  /**
   * Calculate standard deviation of a numeric array
   * @param {number[]} values - Array of price values
   * @return {number} Standard deviation
   */
  static calculateStdDev(values) {
    const n = values.length
    if (n < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    return Math.sqrt(variance)
  }

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Thirty_Min_Functions.overall()
    const rejects = Thirty_Min_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Thirty_Min_Nexus.pot_buy) {
        if (Thirty_Min_Functions.price < val) {
          diffs.push(val - Thirty_Min_Functions.price)
        }
      }
      if (Thirty_Min_Nexus.pot_sell) {
        if (Thirty_Min_Functions.price > val) {
          diffs.push(Thirty_Min_Functions.price - val)
        }
      }
    }

    if (Math.abs(Math.min(...diffs)) < Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.tp)) {
      Thirty_Min_Nexus.pot_buy = false
      Thirty_Min_Nexus.pot_sell = false
      return true
    } else {
      return false
    }
  }

  /** return price */
  static getPrice () {
    return Thirty_Min_Functions.price
  }

  /** return historical price */
  static priceHistory () {
    return Thirty_Min_Functions.priceHist
  }

  /** find whether trend is going up or down */
  static trend () {
    const history = Thirty_Min_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

  /** recent history, shortens history array into last 50 digits for different analyses */
  static recentHist () {
    const history = Thirty_Min_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 50; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Thirty_Min_Functions.recentHisto = historytwo.reverse()
  }

  /** determination of stop loss size */
  static stoploss () {
    const highs = Thirty_Min_Functions.highs
    const lows = Thirty_Min_Functions.lows
    const diff = []
    let totaldiff = 0
    let finaldiff = 0
    for (let variables = 0; variables < 30; variables++) {
      diff.push(Math.abs(highs[highs.length - 1 - variables] - lows[lows.length - 1 - variables]))
    }
    for (let variables = 0; variables < diff.length; variables++) {
      totaldiff += diff[variables]
    }
    if (Thirty_Min_Functions.volatility() > 0.618) {
      finaldiff = (totaldiff / 30) * 1.382
    } else {
      finaldiff = (totaldiff / 30)
    }
    let slceil = 0
    let slfloor = 0
    let numbuy = 0
    let newsl = 0
    if (Thirty_Min_Nexus.pot_buy) {
      const diffprice = Thirty_Min_Functions.price - finaldiff
      if (!Number.isFinite(Thirty_Min_Functions.closesttwo(diffprice)[0])) {
        slfloor = Thirty_Min_Functions.price - (finaldiff * 3.618)
        newsl = slfloor
      } else {
        numbuy = Thirty_Min_Functions.closesttwo(diffprice)[0]
        if (!Number.isFinite(Thirty_Min_Functions.closesttwo(numbuy)[0])) {
          newsl = diffprice - (0.786 * (diffprice - numbuy))
        } else {
          slfloor = (Thirty_Min_Functions.price - ((Thirty_Min_Functions.price - Thirty_Min_Functions.closesttwo(numbuy)[0]) * 1.618 * 0.786))
          newsl = slfloor
        }
      }
      Thirty_Min_Nexus.sl = newsl
    } if (Thirty_Min_Nexus.pot_sell) {
      const diffprice = finaldiff + Thirty_Min_Functions.price
      if (!Number.isFinite(Thirty_Min_Functions.closesttwo(diffprice)[1])) {
        slceil = Thirty_Min_Functions.price + (finaldiff * 3.618)
        newsl = slceil
      } else {
        numbuy = Thirty_Min_Functions.closesttwo(diffprice)[1]
        if (!Number.isFinite(Thirty_Min_Functions.closesttwo(numbuy)[1])) {
          newsl = diffprice + (0.786 * (numbuy - diffprice))
        } else {
          slceil = (Thirty_Min_Functions.price + ((Math.abs(Thirty_Min_Functions.price - Thirty_Min_Functions.closesttwo(numbuy)[1])) * 1.618 * 0.786))
          newsl = slceil
        }
      }
      Thirty_Min_Nexus.sl = newsl
    }
    return finaldiff
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closesttwo (num1) {
    const values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
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
    const closestbelow = Thirty_Min_Functions.price - Math.min(...valdiffless)
    const closestabove = Thirty_Min_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return closests
  }

  /** price zones, meant to determine whether a price zone has been found or not */
  static priceZones () {
    Thirty_Min_Functions.supreslevs()
    if (Math.abs((Thirty_Min_Functions.pipCountBuy(Thirty_Min_Functions.price, Thirty_Min_Nexus.resistance))
    ) / (Math.abs(Thirty_Min_Functions.pipCountBuy(Math.max(...Thirty_Min_Functions.priceHist), Math.min(...Thirty_Min_Functions.priceHist)))) < 0.1) {
      return true
    } else if (Math.abs((Thirty_Min_Functions.pipCountBuy(Thirty_Min_Functions.price, Thirty_Min_Nexus.support))
    ) / (Math.abs(Thirty_Min_Functions.pipCountBuy(Math.max(...Thirty_Min_Functions.priceHist), Math.min(...Thirty_Min_Functions.priceHist)))) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** keylev, meant to determine the closest keylevel to the current price */
  static keylev () {
    Thirty_Min_Functions.getPrice()
    if (Thirty_Min_Functions.valdiff(Thirty_Min_Functions.price, Thirty_Min_Functions.closest(Thirty_Min_Functions.price)) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** volatility, meant to determine whether or not price movement is too volatile for current parameters */
  static volatility () {
    const history = Thirty_Min_Functions.priceHist
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
    const factor = Thirty_Min_Functions.volatility()
    const history = Thirty_Min_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const diffy = ceiling - floor
    const posdiff = Math.abs(Thirty_Min_Nexus.posprice - Thirty_Min_Functions.price)
    const deci = posdiff / diffy
    const input = deci * 6.18
    const equation = (1 - factor) * (((input * input) + input) / ((input * input) + input + 1))
    return equation
  }

  /**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
  static priceChannels () {
    const rvalues = Thirty_Min_Functions.regression()
    if ((rvalues[0] * rvalues[0]) > 0.8 && (rvalues[1] * rvalues[1]) > 0.8) {
      return true
    } else {
      return false
    }
  }

  /** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now */
  static consolidation () {
    if (Thirty_Min_Functions.volatility() > 0.618) {
      return false
    } else {
      return true
    }
  }

  /** used to determine slope between two points */
  static slopes () {
    Thirty_Min_Functions.recentHist()
    const recentHistory = Thirty_Min_Functions.recentHisto
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
    Thirty_Min_Functions.recentHist()
    const recentHistory = Thirty_Min_Functions.recentHisto
    const slope = Thirty_Min_Functions.slopes()
    const maxes = []
    const mins = []
    for (let value = 3; value < slope.length - 2; value++) {
      if (slope[value - 1] > 0 && slope[value] < 0) {
        if (slope[value - 2] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) } else if (slope[value - 3] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) }
      } else if (slope[value - 1] < 0 && slope[value] > 0) {
        if (slope[value - 2] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) } else if (slope[value - 3] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) }
      }
    }
    Thirty_Min_Functions.maxes = maxes
    Thirty_Min_Functions.mins = mins
  }

  /** used to determine regression lines (moving averages, for example) */
  static regression () {
    Thirty_Min_Functions.maxes_mins()
    const x = []
    const length = Thirty_Min_Functions.maxes.length
    for (let value = 0; value < length; value++) { x.push(value) }
    const y = Thirty_Min_Functions.maxes
    const regressions = new regression.SimpleLinearRegression(x, y)
    const xtwo = []
    const lengthtwo = Thirty_Min_Functions.mins.length
    for (let value = 0; value < lengthtwo; value++) { xtwo.push(value) }
    const ytwo = Thirty_Min_Functions.mins
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
    // Get price history data
    const history = Thirty_Min_Functions.priceHist
    const highs = Thirty_Min_Functions.highs 
    const lows = Thirty_Min_Functions.lows 
    const price = Thirty_Min_Functions.getPrice()
    
    // Identify potential levels using various methods
    const levels = []
    
    // Method 1: Find historical price clusters using histogram approach
    const histogramBins = 100
    const ceiling = Math.max(...highs)
    const floor = Math.min(...lows)
    const binSize = (ceiling - floor) / histogramBins
    const histogram = new Array(histogramBins).fill(0)
    
    // Fill histogram with price occurrences
    for (let i = 0; i < history.length; i++) {
      const binIndex = Math.min(Math.floor((history[i] - floor) / binSize), histogramBins - 1)
      histogram[binIndex]++
    }
    
    // Find histogram peaks (high-frequency price zones)
    const threshold = Math.max(3, Math.floor(history.length / 50)) // Adjust threshold based on data size
    for (let i = 0; i < histogramBins; i++) {
      if (histogram[i] >= threshold) {
        levels.push(floor + (i + 0.5) * binSize)
      }
    }
    
    // Method 2: Identify swing highs and lows (price pivots)
    const windowSize = Math.min(10, Math.floor(history.length / 10))
    for (let i = windowSize; i < history.length - windowSize; i++) {
      // Check for swing high (local peak)
      let isSwingHigh = true
      for (let j = i - windowSize; j < i; j++) {
        if (highs[j] >= highs[i]) {
          isSwingHigh = false
          break
        }
      }
      for (let j = i + 1; j <= i + windowSize; j++) {
        if (j < highs.length && highs[j] >= highs[i]) {
          isSwingHigh = false
          break
        }
      }
      if (isSwingHigh) {
        levels.push(highs[i])
      }
      
      // Check for swing low (local valley)
      let isSwingLow = true
      for (let j = i - windowSize; j < i; j++) {
        if (lows[j] <= lows[i]) {
          isSwingLow = false
          break
        }
      }
      for (let j = i + 1; j <= i + windowSize; j++) {
        if (j < lows.length && lows[j] <= lows[i]) {
          isSwingLow = false
          break
        }
      }
      if (isSwingLow) {
        levels.push(lows[i])
      }
    }
    
    // Cluster similar levels to avoid redundancy
    const clusterThreshold = binSize * 1.5 // Adjust based on instrument volatility
    const clusteredLevels = []
    
    // Sort levels for clustering
    levels.sort((a, b) => a - b)
    
    if (levels.length > 0) {
      let currentCluster = [levels[0]]
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] < clusterThreshold) {
          // Add to current cluster
          currentCluster.push(levels[i])
        } else {
          // Calculate cluster average and add to result
          const sum = currentCluster.reduce((acc, val) => acc + val, 0)
          clusteredLevels.push(sum / currentCluster.length)
          // Start new cluster
          currentCluster = [levels[i]]
        }
      }
      // Add final cluster
      if (currentCluster.length > 0) {
        const sum = currentCluster.reduce((acc, val) => acc + val, 0)
        clusteredLevels.push(sum / currentCluster.length)
      }
    }
    
    // Filter levels by distance from current price
    const finalLevs = clusteredLevels
    const larger = []  // Levels above current price
    const smaller = [] // Levels below current price
    
    for (let level of finalLevs) {
      if (level < price) {
        smaller.push(level)
      } else if (level > price) {
        larger.push(level)
      }
    }
    
    // Ensure we have at least one support and resistance level
    if (smaller.length < 1) {
      smaller.push(price - Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    Thirty_Min_Nexus.support = support
    Thirty_Min_Nexus.resistance = resistance
    Thirty_Min_Nexus.finlevs = finalLevs
  }

  /** self explanatory, finds RSI and compares the last two */
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

  /** self explanatory, finds MACD and compares the last two */
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

  /** self explanatory, finds ROC and compares the last two */
  static roc () {
    const history = Thirty_Min_Functions.priceHist
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
    const history = Thirty_Min_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** new indicator mix that finds EMAS of RSI and compares the last two values */
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

  /** pip counter */
  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      Thirty_Min_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 3) {
      Thirty_Min_Functions.multiplier = 100
    } else if (String(num1).indexOf('.') == 4) {
      Thirty_Min_Functions.multiplier = 10
    } else if (String(num1).indexOf('.') == 5) {
      Thirty_Min_Functions.multiplier = 1
    } else if (String(num1).indexOf('.') == 5) {
      Thirty_Min_Functions.multiplier = 0.1
    } else if (String(num1).indexOf('.') == 6) {
      Thirty_Min_Functions.multiplier = 0.01
    } else if (String(num1).indexOf('.') == 7) {
      Thirty_Min_Functions.multiplier = 0.001
    } else if (String(num1).indexOf('.') == 8) {
      Thirty_Min_Functions.multiplier = 0.0001
    } else if (String(num1).indexOf('.') == 9) {
      Thirty_Min_Functions.multiplier = 0.00001
    } else if (String(num1).indexOf('.') == 10) {
      Thirty_Min_Functions.multiplier = 0.000001
    } else { Thirty_Min_Functions.multiplier = 10000 }
    num1 *= Thirty_Min_Functions.multiplier
    num2 *= Thirty_Min_Functions.multiplier
    return [num1, num2]
  }

  /** pip converter */
  static pipreverse (num, num2) {
    if (String(num).indexOf('.') == 2) {
      Thirty_Min_Functions.multiplier = 0.001
    } else if (String(num).indexOf('.') == 3) {
      Thirty_Min_Functions.multiplier = 0.01
    } else if (String(num).indexOf('.') == 4) {
      Thirty_Min_Functions.multiplier = 0.1
    } else if (String(num).indexOf('.') == 5) {
      Thirty_Min_Functions.multiplier = 1
    } else if (String(num).indexOf('.') == 5) {
      Thirty_Min_Functions.multiplier = 10
    } else if (String(num).indexOf('.') == 6) {
      Thirty_Min_Functions.multiplier = 100
    } else if (String(num).indexOf('.') == 7) {
      Thirty_Min_Functions.multiplier = 1000
    } else if (String(num).indexOf('.') == 8) {
      Thirty_Min_Functions.multiplier = 10000
    } else if (String(num).indexOf('.') == 9) {
      Thirty_Min_Functions.multiplier = 100000
    } else if (String(num).indexOf('.') == 10) {
      Thirty_Min_Functions.multiplier = 1000000
    } else { Thirty_Min_Functions.multiplier = 0.0001 }
    num2 *= Thirty_Min_Functions.multiplier
    return (num2)
  }

  static instrument_switcher (instrument) {
  }

  /* sets value difference as a decimal-percentage of floor to ceiling */
  /** gets value difference for normalization of data points */
  static valdiff (num1, num2) {
    const history = Thirty_Min_Functions.priceHist
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
      Thirty_Min_Functions.multiplier = 1000
    } else if (String(price).indexOf('.') == 3) {
      Thirty_Min_Functions.multiplier = 100
    } else if (String(price).indexOf('.') == 4) {
      Thirty_Min_Functions.multiplier = 10
    } else if (String(price).indexOf('.') == 5) {
      Thirty_Min_Functions.multiplier = 1
    } else if (String(price).indexOf('.') == 5) {
      Thirty_Min_Functions.multiplier = 0.1
    } else if (String(price).indexOf('.') == 6) {
      Thirty_Min_Functions.multiplier = 0.01
    } else if (String(price).indexOf('.') == 7) {
      Thirty_Min_Functions.multiplier = 0.001
    } else if (String(price).indexOf('.') == 8) {
      Thirty_Min_Functions.multiplier = 0.0001
    } else if (String(price).indexOf('.') == 9) {
      Thirty_Min_Functions.multiplier = 0.00001
    } else if (String(price).indexOf('.') == 10) {
      Thirty_Min_Functions.multiplier = 0.000001
    } else {
      Thirty_Min_Functions.multiplier = 10000
    }
    return num1 * Thirty_Min_Functions.multiplier
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closest (num1) {
    const values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
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
    const closestbelow = Thirty_Min_Functions.price - Math.min(...valdiffless)
    const closestabove = Thirty_Min_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return Math.min(...closests)
  }

  /** Counts pips between two values for buying */
  static pipCountBuy (num1, num2) {
    let nums
    nums = Thirty_Min_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }

  /** Counts pips between two values for selling */
  static pipCountSell (num1, num2) {
    let nums
    nums = Thirty_Min_Functions.pip(num1, num2)
    return (nums[0] - nums[1])
  }

  static calculateStdDev(data) {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length
    return Math.sqrt(variance)
  }

  // Helper method for price action scoring
  static calculatePriceActionScore(candles) {
    if (!candles || candles.length < 5) return 0
    
    // Calculate the average movement
    let movements = []
    for (let i = 1; i < candles.length; i++) {
      movements.push(Math.abs(candles[i] - candles[i-1]) / candles[i-1])
    }
    
    const avgMovement = movements.reduce((sum, mv) => sum + mv, 0) / movements.length
    
    // Calculate movement consistency (how uniform are the movements)
    const movementStdDev = Thirty_Min_Functions.calculateStdDev(movements)
    const consistencyScore = 1 - (movementStdDev / avgMovement) // Higher is more consistent
    
    // Calculate direction
    const firstPrice = candles[0]
    const lastPrice = candles[candles.length - 1]
    const directionScore = (lastPrice - firstPrice) / firstPrice
    
    // Combined price action score
    return (consistencyScore * 0.6) + (directionScore * 0.4)
  }
}

class Four_Hour_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  rejectionzones = new Array()
  extendHigh = []
  extendLow = []
  vals = []
  timeperiods = {}
  resistance = 0
  support = 0
  finlevs = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  highs = []
  lows = []

  /** load instrument name from json file */
  static instrument_name () {
    Thirty_Min_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Four_Hour_Functions.priceHist = dataset.Four_Hour.c
    Four_Hour_Functions.highs = dataset.Four_Hour.h
    Four_Hour_Functions.lows = dataset.Four_Hour.l
    Four_Hour_Functions.extendHist = dataset.Four_Hour_Extend.c
    Four_Hour_Functions.extendHigh = dataset.Four_Hour_Extend.h
    Four_Hour_Functions.extendLow = dataset.Four_Hour_Extend.l
  }

  /** load price from json file */
  static ValueAssigner () {
    Four_Hour_Functions.price = liveprice
  }

  /** second consolidation method, meant to strengthen consolidation identification */
  static consolidationtwo () {
    const history = Four_Hour_Functions.priceHist;
    const highs = Four_Hour_Functions.highs;
    const lows = Four_Hour_Functions.lows;
    const histmax = Math.max(...highs);
    const histmin = Math.min(...lows);
    
    // Require more data for 4H timeframe
    const minDataPoints = 15;
    if (history.length < minDataPoints) {
        return true;
    }
    
    // Use fewer periods for 4H timeframe
    const lookbackPeriod = Math.min(30, history.length);
    const recentHistory = history.slice(-lookbackPeriod);
    const recentHighs = highs.slice(-lookbackPeriod);
    const recentLows = lows.slice(-lookbackPeriod);
    const recentClose = history.slice(-lookbackPeriod);
    
    // Bollinger Bands - wider for 4H
    const bollingerBands = bolls.calculate({
        period: 20,
        values: recentHistory,
        stdDev: 2.2 // Slightly wider for 4H
    });
    
    const bandWidths = bollingerBands.map(band => (band.upper - band.lower) / band.middle);
    const recentBandWidths = bandWidths.slice(-4); // Fewer periods for 4H
    const avgBandWidth = recentBandWidths.reduce((sum, width) => sum + width, 0) / recentBandWidths.length;
    
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0];
    const isTightBands = avgBandWidth < 0.025; // Wider threshold for 4H
    
    // True Range analysis
    const trValues = tr.calculate({
        high: recentHighs,
        low: recentLows,
        close: recentClose,
        period: 14
    });
    
    const recentTR = trValues.slice(-4);
    const avgTR = recentTR.reduce((sum, val) => sum + val, 0) / recentTR.length;
    const normalizedATR = avgTR / recentHistory[recentHistory.length - 1];
    
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0];
    const isLowVolatility = normalizedATR < 0.012; // Higher threshold for 4H
    
    // Range analysis
    const priceRange = histmax - histmin;
    const priceRangePercent = priceRange / histmin;
    
    const sum = recentHistory.reduce((a, b) => a + b, 0);
    const mean = sum / recentHistory.length;
    const stdDev = Math.sqrt(
        recentHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentHistory.length
    );
    const relativeStdDev = stdDev / mean;
    
    const isNarrowRange = priceRangePercent < 0.03; // Higher for 4H
    const isLowDeviation = relativeStdDev < 0.015; // Higher for 4H
    
    // Directional analysis
    let hasDirectionalMovement = false;
    let consecutiveHigherHighs = 0;
    let consecutiveLowerLows = 0;
    const pattern_window = 4; // Shorter window for 4H
    
    for (let i = 1; i < pattern_window; i++) {
        if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1]) {
            consecutiveHigherHighs++;
        }
        if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1]) {
            consecutiveLowerLows++;
        }
    }
    
    if (consecutiveHigherHighs >= 2 || consecutiveLowerLows >= 2) { // Fewer consecutive moves needed
        hasDirectionalMovement = true;
    }
    
    // Scoring system
    let consolidationScore = 0;
    let totalFactors = 0;
    
    if (bandWidthShrinking) consolidationScore++;
    if (isTightBands) consolidationScore++;
    totalFactors += 2;
    
    if (trTrend) consolidationScore++;
    if (isLowVolatility) consolidationScore++;
    totalFactors += 2;
    
    if (isNarrowRange) consolidationScore++;
    if (isLowDeviation) consolidationScore++;
    totalFactors += 2;
    
    if (!hasDirectionalMovement) consolidationScore++;
    totalFactors += 1;
    
    const consolidationProbability = consolidationScore / totalFactors;
    return consolidationProbability >= 0.55; // More lenient threshold
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

  /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition */
  static overall () {
    // Get extended price history data and current price
    const extendedhistory = Four_Hour_Functions.extendHist
    const extendedHighs = Four_Hour_Functions.extendHigh 
    const extendedLows = Four_Hour_Functions.extendLow 
    const price = Four_Hour_Functions.price
    
    // Define support/resistance levels from multiple timeframes for more robust rejection zones
    const thirtyminLevels = Thirty_Min_Nexus.finlevs 
    const onehourLevels = One_Hour_Functions.finlevs 
    const keyLevels = [...thirtyminLevels, ...onehourLevels]
    
    // Calculate volatility to adjust buffer size dynamically
    const recentPrices = extendedhistory.slice(-50)
    const volatility = Four_Hour_Functions.volatility ? Four_Hour_Functions.volatility() : 0.05
    
    // Adjust buffer based on volatility - more volatile markets need wider buffers
    const max = Math.max(...extendedhistory)
    const min = Math.min(...extendedhistory)
    const priceRange = max - min
    const buffer = priceRange * Math.max(0.03, Math.min(0.08, volatility))
    
    // Define range around current price to look for similar price levels
    const lower = price - buffer
    const upper = price + buffer
    const pricerange = [lower, upper]
    
    // Find historical instances where price was in similar range
    const studylist = []
    for (let val = 0; val < extendedhistory.length; val++) {
      if (extendedhistory[val] <= upper && extendedhistory[val] >= lower) {
        // Store index and price
        studylist.push([val, extendedhistory[val]])
      }
    }
    
    // Detect if price is near a key level from any timeframe
    const keyLevelProximity = keyLevels.some(level => {
      const distance = Math.abs(price - level) / price
      return distance < 0.0015 // 0.15% distance threshold - reduced to be less strict
    })
    
    // If no similar price points found or too few for analysis
    if (studylist.length < 5) {
      return !keyLevelProximity // If near key level, avoid trading (false)
    }
    
    // Perform detailed analysis of historical behavior at similar price levels
    const result = Four_Hour_Functions.analysis(
      studylist, 
      extendedhistory, 
      pricerange, 
      extendedHighs, 
      extendedLows, 
      keyLevels
    )
    
    // Modified to allow more trades: either analysis is positive OR price isn't near key levels with enough data
    return result || (!keyLevelProximity && studylist.length >= 8)
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis (cases, extendedhistory, pricerange, highs, lows, keyLevels) {
    // Initialize rejection zones array
    Four_Hour_Functions.rejectionzones = []
    
    // Get current price and normal history
    const price = Four_Hour_Functions.price
    const histnorm = Four_Hour_Functions.priceHist
    
    // Calculate price statistics
    const priceStdDev = Four_Hour_Functions.calculateStdDev(extendedhistory.slice(-50))
    const histRange = Math.max(...histnorm) - Math.min(...histnorm)
    
    // Significant price movement threshold (scaled by market volatility)
    const significantMove = histRange * 0.02
    
    // Calculate technical indicators
    const bollingerBands = bolls.calculate({ 
      period: 20, 
      values: extendedhistory, 
      stdDev: 2 
    })
    
    // Extract upper and lower bands
    const lowerBands = bollingerBands.map(band => band.lower)
    const upperBands = bollingerBands.map(band => band.upper)
    const middleBands = bollingerBands.map(band => band.middle)
    
    // Calculate smoothed versions for trend detection
    const smoothedLower = smas.calculate({ period: 10, values: lowerBands })
    const smoothedUpper = smas.calculate({ period: 10, values: upperBands })
    const smoothedMiddle = smas.calculate({ period: 10, values: middleBands })
    
    // Define rejection threshold based on market volatility - increased to make rejection zones harder to identify
    const rejectionThreshold = 5.5
    
    // Define volatility based threshold adjustment
    const volAdjustment = Four_Hour_Functions.volatility ? 
      Math.max(0.8, Math.min(1.2, Four_Hour_Functions.volatility() * 10)) : 
      1.0
      
    // Track identified rejection zones
    const rejectionZones = []
    let rejection = 0
    
    // Extract indices from cases for analysis
    const potentialRejectionPoints = cases.map(c => c[0])
    
    // Analyze each potential rejection point
    for (let i = 0; i < potentialRejectionPoints.length; i++) {
      const idx = potentialRejectionPoints[i]
      
      // Skip if too close to start or end of data
      if (idx < 5 || idx >= extendedhistory.length - 5) continue
      
      // Count patterns that suggest rejection
      let rejectionEvidence = 0
      
      // Pattern 1: Local high/low formations
      let isLocalHigh = true
      let isLocalLow = true
      
      for (let j = 1; j <= 3; j++) {
        // Check if local high
        if (extendedhistory[idx] <= extendedhistory[idx - j] || 
            extendedhistory[idx] <= extendedhistory[idx + j]) {
          isLocalHigh = false
        }
        
        // Check if local low
        if (extendedhistory[idx] >= extendedhistory[idx - j] || 
            extendedhistory[idx] >= extendedhistory[idx + j]) {
          isLocalLow = false
        }
      }
      
      if (isLocalHigh || isLocalLow) rejectionEvidence += 2
      
      // Pattern 2: Price reversal after reaching this level
      const preBehavior = extendedhistory[idx] - extendedhistory[idx - 3]
      const postBehavior = extendedhistory[idx + 3] - extendedhistory[idx]
      
      // If direction changed after this point (sign change between pre and post)
      if (preBehavior * postBehavior < 0 && 
          Math.abs(postBehavior) > significantMove) {
        rejectionEvidence += 1.5
      }
      
      // Pattern 3: Proximity to Bollinger Band
      const bandProximity = Math.min(
        Math.abs(extendedhistory[idx] - upperBands[idx]), 
        Math.abs(extendedhistory[idx] - lowerBands[idx])
      )
      
      if (bandProximity < priceStdDev * 0.5) {
        rejectionEvidence += 1
      }
      
      // Pattern 4: Volume spike analysis if available (stub for future implementation)
      // if (volume data available) { check for volume spike }
      
      // Pattern 5: Candlestick patterns if available
      if (highs && lows) {
        const highLowRange = highs[idx] - lows[idx]
        const bodySize = Math.abs(extendedhistory[idx] - extendedhistory[idx-1])
        
        // Detect potential doji, hammer, or shooting star
        if (highLowRange > bodySize * 2) {
          rejectionEvidence += 1
        }
      }
      
      // Pattern 6: Check for confluence with key levels from multiple timeframes
      const currentPrice = extendedhistory[idx]
      for (const level of keyLevels) {
        const distancePercent = Math.abs(currentPrice - level) / currentPrice
        if (distancePercent < 0.005) { // Within 0.5%
          rejectionEvidence += 1.5
          break
        }
      }
      
      // Adjust evidence by volatility
      rejectionEvidence *= volAdjustment
      
      // If enough evidence found, mark as rejection zone
      if (rejectionEvidence >= rejectionThreshold) {
        rejection++
        rejectionZones.push(extendedhistory[idx])
        Four_Hour_Functions.rejectionzones.push(extendedhistory[idx])
      }
    }
    
    // Check if current price is near an identified rejection zone
    let nearRejectionZone = false
    const rejectionProximityThreshold = priceStdDev * 2
    
    for (const zone of rejectionZones) {
      if (Math.abs(price - zone) < rejectionProximityThreshold) {
        nearRejectionZone = true
        break
      }
    }
    
    // Also check distance to newly identified zones that aren't yet in the system
    for (const zone of Four_Hour_Functions.rejectionzones) {
      if (Math.abs(price - zone) < rejectionProximityThreshold) {
        nearRejectionZone = true
        break
      }
    }
    
    // Allow more rejection zones before prohibiting trades
    return !(rejection > 3 || nearRejectionZone)
  }
  
  /**
   * Calculate standard deviation of a numeric array
   * @param {number[]} values - Array of price values
   * @return {number} Standard deviation
   */
  static calculateStdDev(values) {
    const n = values.length
    if (n < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    return Math.sqrt(variance)
  }

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Four_Hour_Functions.overall()
    const rejects = Four_Hour_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Thirty_Min_Nexus.pot_buy) {
        if (Four_Hour_Functions.price < val) {
          diffs.push(val - Four_Hour_Functions.price)
        }
      }
      if (Thirty_Min_Nexus.pot_sell) {
        if (Four_Hour_Functions.price > val) {
          diffs.push(Four_Hour_Functions.price - val)
        }
      }
    }
    if (Math.abs(Math.min(...diffs)) < Math.abs(Thirty_Min_Functions.price - Thirty_Min_Nexus.tp)) {
      Thirty_Min_Nexus.pot_buy = false
      Thirty_Min_Nexus.pot_sell = false
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
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
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
    finaldiff = totaldiff / 30
    return finaldiff
  }

  /** price zones, meant to determine whether a price zone has been found or not */
  static priceZones () {
    const biggersupres = Four_Hour_Functions.supreslevs()
    return biggersupres
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
    const posdiff = Math.abs(Thirty_Min_Nexus.posprice - Four_Hour_Functions.price)
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
    // Get price history data
    const history = One_Hour_Functions.priceHist
    const highs = One_Hour_Functions.highs 
    const lows = One_Hour_Functions.lows 
    const price = One_Hour_Functions.getPrice()
    
    // Identify potential levels using various methods
    const levels = []
    
    // Method 1: Find historical price clusters using histogram approach
    const histogramBins = 100
    const ceiling = Math.max(...highs)
    const floor = Math.min(...lows)
    const binSize = (ceiling - floor) / histogramBins
    const histogram = new Array(histogramBins).fill(0)
    
    // Fill histogram with price occurrences
    for (let i = 0; i < history.length; i++) {
      const binIndex = Math.min(Math.floor((history[i] - floor) / binSize), histogramBins - 1)
      histogram[binIndex]++
    }
    
    // Find histogram peaks (high-frequency price zones)
    const threshold = Math.max(3, Math.floor(history.length / 50)) // Adjust threshold based on data size
    for (let i = 0; i < histogramBins; i++) {
      if (histogram[i] >= threshold) {
        levels.push(floor + (i + 0.5) * binSize)
      }
    }
    
    // Method 2: Identify swing highs and lows (price pivots)
    const windowSize = Math.min(10, Math.floor(history.length / 10))
    for (let i = windowSize; i < history.length - windowSize; i++) {
      // Check for swing high (local peak)
      let isSwingHigh = true
      for (let j = i - windowSize; j < i; j++) {
        if (highs[j] >= highs[i]) {
          isSwingHigh = false
          break
        }
      }
      for (let j = i + 1; j <= i + windowSize; j++) {
        if (j < highs.length && highs[j] >= highs[i]) {
          isSwingHigh = false
          break
        }
      }
      if (isSwingHigh) {
        levels.push(highs[i])
      }
      
      // Check for swing low (local valley)
      let isSwingLow = true
      for (let j = i - windowSize; j < i; j++) {
        if (lows[j] <= lows[i]) {
          isSwingLow = false
          break
        }
      }
      for (let j = i + 1; j <= i + windowSize; j++) {
        if (j < lows.length && lows[j] <= lows[i]) {
          isSwingLow = false
          break
        }
      }
      if (isSwingLow) {
        levels.push(lows[i])
      }
    }
    
    // Cluster similar levels to avoid redundancy
    const clusterThreshold = binSize * 1.5 // Adjust based on instrument volatility
    const clusteredLevels = []
    
    // Sort levels for clustering
    levels.sort((a, b) => a - b)
    
    if (levels.length > 0) {
      let currentCluster = [levels[0]]
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] < clusterThreshold) {
          // Add to current cluster
          currentCluster.push(levels[i])
        } else {
          // Calculate cluster average and add to result
          const sum = currentCluster.reduce((acc, val) => acc + val, 0)
          clusteredLevels.push(sum / currentCluster.length)
          // Start new cluster
          currentCluster = [levels[i]]
        }
      }
      // Add final cluster
      if (currentCluster.length > 0) {
        const sum = currentCluster.reduce((acc, val) => acc + val, 0)
        clusteredLevels.push(sum / currentCluster.length)
      }
    }
    
    // Filter levels by distance from current price
    const finalLevs = clusteredLevels
    const larger = []  // Levels above current price
    const smaller = [] // Levels below current price
    
    for (let level of finalLevs) {
      if (level < price) {
        smaller.push(level)
      } else if (level > price) {
        larger.push(level)
      }
    }
    
    // Ensure we have at least one support and resistance level
    if (smaller.length < 1) {
      smaller.push(price - Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    Four_Hour_Functions.support = support
    Four_Hour_Functions.resistance = resistance
    Four_Hour_Functions.finlevs = finalLevs
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
    const values = Thirty_Min_Nexus.finlevs.concat(Thirty_Min_Nexus.biggersupres)
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

  // Add this static method to the Four_Hour_Functions class
  static calculateStdDev(values) {
    const n = values.length;
    if (n < 2) return 0;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate sum of squared differences from mean
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((sum, val) => sum + val, 0);
    
    // Calculate standard deviation
    return Math.sqrt(sumSquaredDiffs / (n - 1));
  }
}

class One_Hour_Functions {
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
  highs = []
  lows = []

  static HistoryAssigner () {
    const instrument = Thirty_Min_Functions.instrument_name()
    One_Hour_Functions.priceHist = dataset.One_Hour.c
    One_Hour_Functions.highs = dataset.One_Hour.h
    One_Hour_Functions.lows = dataset.One_Hour.l
  }

  static ValueAssigner () {
    One_Hour_Functions.price = liveprice
  }

  /* make  function */
  /* let data = request() */
  static getPrice () {
    return One_Hour_Functions.price
  }

  static priceHistory () {
    return One_Hour_Functions.priceHist
  }

  static recentHist () {
    const history = One_Hour_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 30; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    One_Hour_Functions.recentHisto = historytwo.reverse()
  }

  static priceZones () {
    const biggersupres = One_Hour_Functions.supreslevs()
    return biggersupres
  }

  /* Add Key Part That the Levels Must Repeat 3x */
  static supreslevs () {
    // Get price history data
    const history = One_Hour_Functions.priceHist
    const highs = One_Hour_Functions.highs 
    const lows = One_Hour_Functions.lows 
    const price = One_Hour_Functions.getPrice()
    
    // Identify potential levels using various methods
    const levels = []
    
    // Method 1: Find historical price clusters using histogram approach
    const histogramBins = 100
    const ceiling = Math.max(...highs)
    const floor = Math.min(...lows)
    const binSize = (ceiling - floor) / histogramBins
    const histogram = new Array(histogramBins).fill(0)
    
    // Fill histogram with price occurrences
    for (let i = 0; i < history.length; i++) {
      const binIndex = Math.min(Math.floor((history[i] - floor) / binSize), histogramBins - 1)
      histogram[binIndex]++
    }
    
    // Find histogram peaks (high-frequency price zones)
    const threshold = Math.max(3, Math.floor(history.length / 50)) // Adjust threshold based on data size
    for (let i = 0; i < histogramBins; i++) {
      if (histogram[i] >= threshold) {
        levels.push(floor + (i + 0.5) * binSize)
      }
    }
    
    // Method 2: Identify swing highs and lows (price pivots)
    const windowSize = Math.min(10, Math.floor(history.length / 10))
    for (let i = windowSize; i < history.length - windowSize; i++) {
      // Check for swing high (local peak)
      let isSwingHigh = true
      for (let j = i - windowSize; j < i; j++) {
        if (highs[j] >= highs[i]) {
          isSwingHigh = false
          break
        }
      }
      for (let j = i + 1; j <= i + windowSize; j++) {
        if (j < highs.length && highs[j] >= highs[i]) {
          isSwingHigh = false
          break
        }
      }
      if (isSwingHigh) {
        levels.push(highs[i])
      }
      
      // Check for swing low (local valley)
      let isSwingLow = true
      for (let j = i - windowSize; j < i; j++) {
        if (lows[j] <= lows[i]) {
          isSwingLow = false
          break
        }
      }
      for (let j = i + 1; j <= i + windowSize; j++) {
        if (j < lows.length && lows[j] <= lows[i]) {
          isSwingLow = false
          break
        }
      }
      if (isSwingLow) {
        levels.push(lows[i])
      }
    }
    
    // Cluster similar levels to avoid redundancy
    const clusterThreshold = binSize * 1.5 // Adjust based on instrument volatility
    const clusteredLevels = []
    
    // Sort levels for clustering
    levels.sort((a, b) => a - b)
    
    if (levels.length > 0) {
      let currentCluster = [levels[0]]
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] < clusterThreshold) {
          // Add to current cluster
          currentCluster.push(levels[i])
        } else {
          // Calculate cluster average and add to result
          const sum = currentCluster.reduce((acc, val) => acc + val, 0)
          clusteredLevels.push(sum / currentCluster.length)
          // Start new cluster
          currentCluster = [levels[i]]
        }
      }
      // Add final cluster
      if (currentCluster.length > 0) {
        const sum = currentCluster.reduce((acc, val) => acc + val, 0)
        clusteredLevels.push(sum / currentCluster.length)
      }
    }
    
    // Filter levels by distance from current price
    const finalLevs = clusteredLevels
    const larger = []  // Levels above current price
    const smaller = [] // Levels below current price
    
    for (let level of finalLevs) {
      if (level < price) {
        smaller.push(level)
      } else if (level > price) {
        larger.push(level)
      }
    }
    
    // Ensure we have at least one support and resistance level
    if (smaller.length < 1) {
      smaller.push(price - Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Thirty_Min_Functions.pipreverse(price, Thirty_Min_Functions.pipdiffy(price, Thirty_Min_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    One_Hour_Functions.support = support
    One_Hour_Functions.resistance = resistance
    One_Hour_Functions.finlevs = finalLevs
  }

  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      One_Hour_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 3) {
      One_Hour_Functions.multiplier = 100
    } else if (String(num1).indexOf('.') == 4) {
      One_Hour_Functions.multiplier = 10
    } else if (String(num1).indexOf('.') == 5) {
      One_Hour_Functions.multiplier = 1
    } else if (String(num1).indexOf('.') == 5) {
      One_Hour_Functions.multiplier = 0.1
    } else if (String(num1).indexOf('.') == 6) {
      One_Hour_Functions.multiplier = 0.01
    } else if (String(num1).indexOf('.') == 7) {
      One_Hour_Functions.multiplier = 0.001
    } else if (String(num1).indexOf('.') == 8) {
      One_Hour_Functions.multiplier = 0.0001
    } else if (String(num1).indexOf('.') == 9) {
      One_Hour_Functions.multiplier = 0.00001
    } else if (String(num1).indexOf('.') == 10) {
      One_Hour_Functions.multiplier = 0.000001
    } else { One_Hour_Functions.multiplier = 10000 }
    num1 *= One_Hour_Functions.multiplier
    num2 *= One_Hour_Functions.multiplier
    return [num1, num2]
  }

  static instrument_catalog (instrument) {
  }

  static pipCountBuy (num1, num2) {
    let nums
    nums = One_Hour_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }
}

class Fifteen_Min_Functions {
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

  static HistoryAssigner () {
    const instrument = Thirty_Min_Functions.instrument_name()
    Fifteen_Min_Functions.priceHist = dataset.Fifteen_Min.c
    Fifteen_Min_Functions.highs = dataset.Fifteen_Min.h
    Fifteen_Min_Functions.lows = dataset.Fifteen_Min.l
  }

  static trend () {
    const history = Fifteen_Min_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
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

class Five_Min_Functions {
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

  static HistoryAssigner () {
    const instrument = Thirty_Min_Functions.instrument_name()
    Five_Min_Functions.priceHist = dataset.Five_Min.c
    Five_Min_Functions.highs = dataset.Five_Min.h
    Five_Min_Functions.lows = dataset.Five_Min.l
  }

  static consolidationtwo () {
    const history = Five_Min_Functions.priceHist
    const highs = Five_Min_Functions.highs
    const lows = Five_Min_Functions.lows
    const histmax = Math.max(...highs)
    const histmin = Math.min(...lows)
    const histdiff = histmax - histmin
    
    // Ensure we have enough data
    const minDataPoints = 20
    if (history.length < minDataPoints) {
      return false; // Don't default to consolidation
    }
    
    // Normalize all arrays to same length (use most recent data)
    const lookbackPeriod = Math.min(50, history.length)
    const recentHistory = history.slice(-lookbackPeriod)
    const recentHighs = highs.slice(-lookbackPeriod)
    const recentLows = lows.slice(-lookbackPeriod)
    const recentClose = history.slice(-lookbackPeriod)
    
    // APPROACH 1: Bollinger Bands width analysis
    const bollingerBands = bolls.calculate({ 
      period: 20, 
      values: recentHistory, 
      stdDev: 2
    })
    
    // Calculate normalized Bollinger Band width
    const bandWidths = bollingerBands.map(band => (band.upper - band.lower) / band.middle)
    const recentBandWidths = bandWidths.slice(-5)
    const avgBandWidth = recentBandWidths.reduce((sum, width) => sum + width, 0) / recentBandWidths.length
    
    // Set more balanced parameters for band width
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0] * 0.95
    const isTightBands = avgBandWidth < 0.018 // Balanced threshold
    
    // APPROACH 2: True Range (volatility) analysis
    const trValues = tr.calculate({ 
      high: recentHighs, 
      low: recentLows, 
      close: recentClose, 
      period: 14 
    })
    
    // Calculate average true range relative to price
    const recentTR = trValues.slice(-5)
    const avgTR = recentTR.reduce((sum, val) => sum + val, 0) / recentTR.length
    const normalizedATR = avgTR / recentHistory[recentHistory.length - 1]
    
    // Balanced criteria for TR
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0] * 0.92
    const isLowVolatility = normalizedATR < 0.012 // For 5-min timeframe, allow more volatility
    
    // APPROACH 3: Price channel/range analysis
    const priceRange = histmax - histmin
    const priceRangePercent = priceRange / histmin
    
    // Calculate standard deviation of closing prices
    const sum = recentHistory.reduce((a, b) => a + b, 0)
    const mean = sum / recentHistory.length
    const stdDev = Math.sqrt(
      recentHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentHistory.length
    )
    const relativeStdDev = stdDev / mean
    
    // Balanced range criteria for 5-min
    const isNarrowRange = priceRangePercent < 0.025 // Allow more range in 5-min
    const isLowDeviation = relativeStdDev < 0.014 // Allow more deviation
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    // Prepare x and y for regression
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Balanced criteria for slope analysis
    const isFlatSlope = slope < 0.00012 * mean 
    const isPoorFit = r2 < 0.45
    
    // APPROACH 5: Check for higher highs/lower lows pattern
    let hasDirectionalMovement = false
    
    // Check for consecutive higher highs or lower lows (trend indicators)
    let consecutiveHigherHighs = 0
    let consecutiveLowerLows = 0
    const pattern_window = 4 // Use 4 candles for 5-min
    
    for (let i = 1; i < pattern_window; i++) {
      if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1] * 1.0003) {
        consecutiveHigherHighs++;
      }
      if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1] * 0.9997) {
        consecutiveLowerLows++;
      }
    }
    
    // Add a small threshold to reduce noise (0.03% movement)
    if (consecutiveHigherHighs >= 3 || consecutiveLowerLows >= 3) {
      hasDirectionalMovement = true;
    }
    
    // APPROACH 6: Recent price action - check if price is moving significantly
    // Get most recent candles
    const last10Closes = recentHistory.slice(-10);
    const last10Range = Math.max(...last10Closes) - Math.min(...last10Closes);
    const recentVolatility = last10Range / last10Closes[last10Closes.length - 1];
    const isRecentlyQuiet = recentVolatility < 0.01; // 1% range in last 10 candles
    
    // Combine all factors to decide if the market is consolidating
    // Use balanced scoring system that can produce varying results
    
    let consolidationScore = 0;
    let totalFactors = 0;
    
    // Bollinger factors
    if (bandWidthShrinking) consolidationScore += 1.2;
    if (isTightBands) consolidationScore += 1.5;
    totalFactors += 2.7;
    
    // TR factors
    if (trTrend) consolidationScore += 1.0;
    if (isLowVolatility) consolidationScore += 1.3;
    totalFactors += 2.3;
    
    // Range factors
    if (isNarrowRange) consolidationScore += 1.2;
    if (isLowDeviation) consolidationScore += 1.2;
    totalFactors += 2.4;
    
    // Regression factors
    if (isFlatSlope) consolidationScore += 0.8;
    if (isPoorFit) consolidationScore += 0.7;
    totalFactors += 1.5;
    
    // Direction factor (negative score if directional)
    if (!hasDirectionalMovement) consolidationScore += 1.0;
    else consolidationScore -= 0.3; // Small penalty
    totalFactors += 1.0;
    
    // Recent price action
    if (isRecentlyQuiet) consolidationScore += 1.5;
    totalFactors += 1.5;
    
    // Calculate overall probability of consolidation
    const consolidationProbability = consolidationScore / totalFactors;
    
    // Balanced threshold that can produce mix of true/false results
    return consolidationProbability >= 0.62;
  }

  static trend () {
    const history = Five_Min_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

  static rsi () {
    const history = Five_Min_Functions.priceHist
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
    const history = Five_Min_Functions.priceHist
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
    const history = Five_Min_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  static obv () {
    const history = Five_Min_Functions.priceHist
    const qs = rsis.calculate({ period: 14, values: history })
    const q = emas.calculate({ period: 8, values: qs })
    const qlast = q[q.length - 1]
    const r = emas.calculate({ period: 14, values: qs })
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }
}

function testthirtymin (data, price, instrument) {
  instrum = instrument;
  liveprice = price;
  // Assign to the global dataset variable
  dataset = data;
  Thirty_Min_Nexus.controlMain();
  
  // If we have a potential buy signal
  if (Thirty_Min_Nexus.pot_buy && !Thirty_Min_Nexus.buy_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Thirty_Min_Functions.supreslevs();
    Thirty_Min_Functions.getPrice();
    Thirty_Min_Functions.stoploss();
    Thirty_Min_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Thirty_Min_Nexus.sl.toFixed(5);
    const formattedTP = Thirty_Min_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[ThirtyMin] BUY SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('BUY', instrument, formattedSL, formattedTP, 0.02, 'ThirtyMin algorithm signal', 'ThirtyMin');
  }
  
  // If we have a potential sell signal
  if (Thirty_Min_Nexus.pot_sell && !Thirty_Min_Nexus.sell_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Thirty_Min_Functions.supreslevs();
    Thirty_Min_Functions.getPrice();
    Thirty_Min_Functions.stoploss();
    Thirty_Min_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Thirty_Min_Nexus.sl.toFixed(5);
    const formattedTP = Thirty_Min_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[ThirtyMin] SELL SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('SELL', instrument, formattedSL, formattedTP, 0.02, 'ThirtyMin algorithm signal', 'ThirtyMin');
  }
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

module.exports = {
  testthirtymin
};