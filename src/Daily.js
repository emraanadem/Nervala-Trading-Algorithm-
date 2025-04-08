import * as fs from 'fs'
import * as regression from 'ml-regression-simple-linear'
import { EMA as emas, RSI as rsis, MACD as macds, ROC as rocs, BollingerBands as bolls, SMA as smas, ATR as tr } from 'technicalindicators'
import { createModel } from 'polynomial-regression'
import * as nerdamer from 'nerdamer/all.min.js'
import * as roots from 'kld-polynomial'
import { sendSignal } from './metatrader-connector.js'

// Define global variables with proper initialization
let instrum = '';
var dataset = {};
var liveprice = 0;

class Daily_Nexus {
  pos = false
  buy_pos = false
  sell_pos = false
  pot_buy = false
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
  backtest = false

  /** announce price zones and price channels */
  static announcer () {
    if (Daily_Nexus.pzone == false && Daily_Functions.priceZones() == true) {
      Daily_Nexus.pzone = true
      console.log('Price Zone Identified')
    } if (Daily_Nexus.pzone == true && Daily_Functions.priceZones() == false) {
      Daily_Nexus.pzone = false
    } if (Daily_Nexus.pchan == false && Daily_Functions.priceChannels() == true) {
      Daily_Nexus.pchan = true
      console.log('Price Channel Identified')
    } if (Daily_Nexus.pchan == true && Daily_Functions.priceChannels() == false) {
      Daily_Nexus.pchan = false
    }
  }

  /** stop loss for buys */
  static stopLossBuy () {
    if (Daily_Functions.price <= Daily_Nexus.sl) {
      Daily_Nexus.closePosSL()
    }
  }

  /** stop loss for selling */
  static stopLossSell () {
    if (Daily_Functions.price >= Daily_Nexus.sl) {
      Daily_Nexus.closePosSL()
    }
  }

  /** initiates the piplog for pipcounting */
  static piploginit () {
    Daily_Nexus.piplog = [0, 0, 0]
  }

  /** pip logging method */
  static piplogger () {
    const piplogging = Daily_Nexus.piplog
    if (Daily_Nexus.buy_pos) {
      piplogging.push(Daily_Functions.pipCountBuy(Daily_Nexus.posprice, Daily_Functions.price))
      Daily_Nexus.bigpipprice = Math.max(...piplogging)
      Daily_Nexus.piplog = piplogging
    }
    if (Daily_Nexus.sell_pos) {
      piplogging.push(Daily_Functions.pipCountSell(Daily_Nexus.posprice, Daily_Functions.price))
      Daily_Nexus.bigpipprice = Math.max(...piplogging)
      Daily_Nexus.piplog = piplogging
    }
  }

  /** take profit for buying */
  static takeProfitBuy () {
    if (Daily_Functions.price >= Daily_Nexus.tp) {
      if (Daily_Functions.volatility() > 0.618) {
        if ((Daily_Functions.price - Daily_Nexus.tp) > (Daily_Nexus.tp - Daily_Nexus.tstoploss)) {
          if (Daily_Nexus.tp < Daily_Nexus.tptwo) {
            Daily_Nexus.piploginit()
            Daily_Nexus.posprice = Daily_Nexus.tp
            Daily_Nexus.tp = Daily_Nexus.tptwo
            Daily_Functions.tpvariation()
            console.log('pair: ' + Daily_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Daily_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Daily_Nexus.tptwo))
          }
        }
      } else {
        Daily_Nexus.closePosTP()
      }
    } else if (Daily_Functions.price <= Daily_Nexus.tstoploss) {
      Daily_Nexus.closePosTP()
    } else if (Daily_Functions.price == Daily_Nexus.tptwo) {
      Daily_Nexus.closePosTP()
    }
  }

  /** take profit for selling */
  static takeProfitSell () {
    if (Daily_Functions.price <= Daily_Nexus.tp) {
      if (Daily_Functions.volatility() > 0.618) {
        if ((Daily_Nexus.tp - Daily_Functions.price) > (Daily_Nexus.tstoploss - Daily_Nexus.tp)) {
          if (Daily_Nexus.tp < Daily_Nexus.tptwo) {
            Daily_Nexus.piploginit()
            Daily_Nexus.posprice = Daily_Nexus.tp
            Daily_Nexus.tp = Daily_Nexus.tptwo
            Daily_Functions.tpvariation()
            console.log('pair: ' + Daily_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Daily_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Daily_Nexus.tptwo))
          }
        }
      } else {
        Daily_Nexus.closePosTP()
      }
    } else if (Daily_Functions.price >= Daily_Nexus.tstoploss) {
      Daily_Nexus.closePosTP()
    } else if (Daily_Functions.price == Daily_Nexus.tptwo) {
      Daily_Nexus.closePosTP()
    }
  }

  /** stop loss defining method */
  static stoplossdef () {
    const stoploss = Daily_Functions.stoploss()
    if (Daily_Nexus.buy_pos) {
      Daily_Nexus.sl = Daily_Functions.price - stoploss
    }
    if (Daily_Nexus.sell_pos) {
      Daily_Nexus.sl = Daily_Functions.price + stoploss
    }
  }

  /** define volatility for the system, tells me whether or not to alter trailing stop loss */
  static volatilitydef () {
    if (Daily_Functions.volatility() > 0.618 && Daily_Nexus.tstoplossinits && !Daily_Nexus.tstoplossvoid) {
      Daily_Nexus.tstoplossdefvol()
    }
  }

  /** initiate trailing stop loss */
  static tstoplossinit () {
    const stoploss = Daily_Nexus.sldiff
    if (!Daily_Nexus.tstop && !Daily_Nexus.tstoplossinits && !Daily_Nexus.tstoplossvoid) {
      if (Daily_Nexus.buy_pos) {
        if (Daily_Functions.price > Daily_Nexus.posprice + 0.3 * stoploss) {
          Daily_Nexus.tstoplossinits = true
          Daily_Nexus.tstoplossdef()
        }
      }
      if (Daily_Nexus.sell_pos) {
        if (Daily_Functions.price < Daily_Nexus.posprice - 0.3 * stoploss) {
          Daily_Nexus.tstoplossinits = true
          Daily_Nexus.tstoplossdef()
        }
      }
    }
  }

  /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
  static tstoplossdefvol () {
    Daily_Nexus.sldiff = Daily_Functions.stoploss()
    const stoploss = Daily_Nexus.sldiff
    if (Daily_Nexus.buy_pos) {
      if (Daily_Functions.price > Daily_Nexus.posprice + 0.3 * stoploss) {
        Daily_Nexus.tstop = true
        Daily_Nexus.tstoploss = Daily_Nexus.posprice + (((Math.abs(Daily_Functions.price - Daily_Nexus.posprice)) * (Daily_Functions.trailingsl())))
      }
    }
    if (Daily_Nexus.sell_pos) {
      if (Daily_Functions.price < Daily_Nexus.posprice - 0.3 * stoploss) {
        Daily_Nexus.tstop = true
        Daily_Nexus.tstoploss = Daily_Nexus.posprice - (((Math.abs(Daily_Functions.price - Daily_Nexus.posprice)) * (Daily_Functions.trailingsl())))
      }
    }
  }

  /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility */
  static tstoplosscheck () {
    const tstoploss = Daily_Nexus.sldiff
    if (Daily_Nexus.buy_pos) {
      if (Daily_Functions.price < Daily_Nexus.posprice + 0.3 * tstoploss) {
        Daily_Nexus.tstoplossvoid = true
      } else {
        Daily_Nexus.tstoplossvoid = false
        Daily_Nexus.volatilitydef()
        Daily_Nexus.tstoplossinit()
      }
    }
    if (Daily_Nexus.sell_pos) {
      if (Daily_Functions.price > Daily_Nexus.posprice - 0.3 * tstoploss) {
        Daily_Nexus.tstoplossvoid = true
      } else {
        Daily_Nexus.tstoplossvoid = false
        Daily_Nexus.volatilitydef()
        Daily_Nexus.tstoplossinit()
      }
    }
  }

  /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
  static tstoplosscont () {
    if (Daily_Functions.volatility() < 0.618 && Daily_Nexus.tstoplossinits && !Daily_Nexus.tstoplossvoid) {
      Daily_Nexus.sldiff = Daily_Functions.stoploss()
      const stoploss = Daily_Nexus.sldiff
      if (Daily_Nexus.buy_pos) {
        if (Daily_Functions.price > Daily_Nexus.posprice + 0.3 * stoploss) {
          Daily_Nexus.tstoploss = Daily_Nexus.posprice + Daily_Functions.pipreverse(Daily_Nexus.posprice, 0.618 * Daily_Nexus.bigpipprice)
        }
      }
      if (Daily_Nexus.sell_pos) {
        if (Daily_Functions.price < Daily_Nexus.posprice - 0.3 * stoploss) {
          Daily_Nexus.tstoploss = Daily_Nexus.posprice - Daily_Functions.pipreverse(Daily_Nexus.posprice, 0.618 * Daily_Nexus.bigpipprice)
        }
      }
    }
  }

  /** method that defines trailing stop loss for the system to begin with trailing stop loss */
  static tstoplossdef () {
    Daily_Nexus.sldiff = Daily_Functions.stoploss()
    const stoploss = Daily_Nexus.sldiff
    if (Daily_Nexus.buy_pos) {
      if (Daily_Functions.price > Daily_Nexus.posprice + 0.3 * stoploss) {
        Daily_Nexus.tstop = true
        Daily_Nexus.tstoploss = Daily_Nexus.posprice + Daily_Functions.pipreverse(Daily_Nexus.posprice, 0.618 * Daily_Nexus.bigpipprice)
      }
    }
    if (Daily_Nexus.sell_pos) {
      if (Daily_Functions.price < Daily_Nexus.posprice - 0.3 * stoploss) {
        Daily_Nexus.tstop = true
        Daily_Nexus.tstoploss = Daily_Nexus.posprice - Daily_Functions.pipreverse(Daily_Nexus.posprice, 0.618 * Daily_Nexus.bigpipprice)
      }
    }
  }

  /* FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS! */

  /** initiates a buy signal */
  static buy () {
    Daily_Functions.supreslevs()
    Daily_Functions.getPrice()
    Daily_Functions.stoploss()
    Daily_Functions.tpvariation()
    if (!Daily_Functions.rejectionzoning()) {
      if (Math.abs(Daily_Functions.valdiff(Daily_Functions.price, Daily_Functions.closest(Daily_Functions.price))) > 0.025) {
        Daily_Nexus.tp = Daily_Nexus.resistance
        Daily_Nexus.pos = true
        Daily_Nexus.buy_pos = true
        Daily_Nexus.posprice = Daily_Functions.price
        Daily_Functions.stoploss()
        Daily_Functions.tpvariation()
        console.log('pair: ' + Daily_Nexus.pair)
        console.log('Open Buy Order on Daily')
        console.log('Entry Price: ' + String(Daily_Nexus.posprice))
        console.log('Stop Loss: ' + String(Daily_Nexus.sl))
        console.log('Target Take Profit: ' + String(Daily_Nexus.tp))
        console.log('Take Profit 2: ' + String(Daily_Nexus.tptwo))
      }}
    
    // Add at the end of the buy method before the closing bracket
    sendSignal(
      'BUY',
      Daily_Nexus.pair,
      Daily_Nexus.sl,
      Daily_Nexus.tp,
      0.05, // Higher volume for longer timeframe
      'Daily'
    );
  }

  /* static buy(){
        Daily_Functions.supreslevs()
        Daily_Functions.getPrice()
        Daily_Nexus.tp = Daily_Nexus.resistance
        Daily_Nexus.pos = true
        Daily_Nexus.buy_pos = true
        Daily_Nexus.posprice = Daily_Functions.price
        console.log("Open Buy Order")
        console.log(Daily_Nexus.sl + " : Stop Loss")
        console.log(Daily_Nexus.tp + " : Target Take Profit")
        } */

  /** initiates a sell order */
  static sell () {
    Daily_Functions.supreslevs()
    Daily_Functions.getPrice()
    Daily_Functions.stoploss()
    Daily_Functions.tpvariation()
    if (!Daily_Functions.rejectionzoning()) {
      if (Math.abs(Daily_Functions.valdiff(Daily_Functions.price, Daily_Functions.closest(Daily_Functions.price))) > 0.025) {
        Daily_Nexus.tp = Daily_Nexus.support
        Daily_Nexus.pos = true
        Daily_Nexus.sell_pos = true
        Daily_Nexus.posprice = Daily_Functions.price
        Daily_Functions.stoploss()
        Daily_Functions.tpvariation()
        console.log('pair: ' + Daily_Nexus.pair)
        console.log('Open Sell Order on Daily')
        console.log('Entry Price: ' + String(Daily_Nexus.posprice))
        console.log('Stop Loss: ' + String(Daily_Nexus.sl))
        console.log('Target Take Profit: ' + String(Daily_Nexus.tp))
        console.log('Take Profit 2: ' + String(Daily_Nexus.tptwo))
      }}
    
    // Add at the end of the sell method before the closing bracket
    sendSignal(
      'SELL',
      Daily_Nexus.pair,
      Daily_Nexus.sl,
      Daily_Nexus.tp,
      0.05, // Higher volume for longer timeframe
      'Daily'
    );
  }

  /* static sell(){
        Daily_Functions.supreslevs()
        Daily_Functions.getPrice()
        Daily_Nexus.tp = Daily_Nexus.support
        Daily_Nexus.pos = true
        Daily_Nexus.sell_pos = true
        Daily_Nexus.posprice = Daily_Functions.price
        console.log("Open Sell Order")
        console.log(Daily_Nexus.sl + " : Stop Loss")
        console.log(Daily_Nexus.tp + " : Target Take Profit")
        } */

  /** checks for price movement in lower periods to get better idea of the trend */
  static controlSmallerPeriod () {
    try {
      /* Confirm Trend w/ indicators and price movement */
      Four_Hour_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Weekly_Functions.HistoryAssigner()
      Fifteen_Min_Functions.HistoryAssigner()
      Daily_Functions.stoploss()
      Daily_Functions.tpvariation()
      let buy = false
      let sell = false
      if (!One_Hour_Functions.consolidationtwo() && !Fifteen_Min_Functions.consolidationtwo()) {
        if (Weekly_Functions.trend() && Four_Hour_Functions.ema()) {
          if (One_Hour_Functions.trend() && Four_Hour_Functions.macd() && Four_Hour_Functions.obv()) {
            if (One_Hour_Functions.ema()) {
              if (One_Hour_Functions.rsi() && One_Hour_Functions.obv()) {
                buy = true
              }
            }
          }
        }
        if (!Weekly_Functions.trend() && !Four_Hour_Functions.ema()) {
          if (!One_Hour_Functions.trend() && !Four_Hour_Functions.macd() && !Four_Hour_Functions.obv()) {
            if (!One_Hour_Functions.ema()) {
              if (!One_Hour_Functions.rsi() && !One_Hour_Functions.obv()) {
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
      Weekly_Functions.ValueAssigner()
      Weekly_Functions.HistoryAssigner()
      Weekly_Functions.priceZones()
      let h = [0]
      h = Weekly_Functions.finlevs
      const totallevs = h
      Daily_Nexus.biggersupres = totallevs
      Daily_Nexus.finlevs.concat(totallevs)
    } catch (error) {
      console.log(error)
    }
  }

  /** main control method, takes control of the entire program and serves as the brain */
  static controlMain () {
    try {
      Daily_Functions.HistoryAssigner()
      Daily_Functions.ValueAssigner()
      Four_Hour_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Weekly_Functions.HistoryAssigner()
      Fifteen_Min_Functions.HistoryAssigner()
      Daily_Functions.supreslevs()
      Weekly_Functions.supreslevs()
      Daily_Functions.stoploss()
      Daily_Functions.getPrice()
      Daily_Nexus.controlSmallerPeriod()
      Daily_Nexus.controlBiggerPeriod()
      if (!Daily_Functions.consolidationtwo() && Daily_Functions.overall() && !Daily_Functions.consolidation() &&
            !Daily_Functions.keylev()) {
        if (Daily_Functions.ema()) {
          if (Daily_Nexus.controlSmallerPeriod()[0] == true) {
            if (Daily_Functions.trend() && Daily_Functions.rsi() &&
                            Daily_Functions.macd() && Daily_Functions.roc() && Daily_Functions.obv()) {
              if (!Daily_Nexus.pos) {
                if (!Daily_Nexus.buy_pos) { Daily_Nexus.pot_buy = true }
                Daily_Functions.stoploss()
                Daily_Nexus.piploginit()
                Daily_Nexus.buy()
              }
            }
          }
        }
        if (!Daily_Functions.ema()) {
          if (Daily_Nexus.controlSmallerPeriod()[1] == true) {
            if (!Daily_Functions.trend() && !Daily_Functions.rsi() &&
                            !Daily_Functions.macd() && !Daily_Functions.roc() && !Daily_Functions.obv()) {
              if (!Daily_Nexus.pos) {
                if (!Daily_Nexus.sell_pos) { Daily_Nexus.pot_sell = true }
                Daily_Functions.stoploss()
                Daily_Nexus.piploginit()
                Daily_Nexus.sell()
              }
            }
          }
        }
      }
      if (Daily_Nexus.pos && Daily_Nexus.buy_pos) {
        Daily_Nexus.piplogger()
        Daily_Nexus.stopLossBuy()
        Daily_Nexus.tstoplosscheck()
        Daily_Nexus.tstoplosscont()
        Daily_Nexus.takeProfitBuy()
      }
      if (Daily_Nexus.pos && Daily_Nexus.sell_pos) {
        Daily_Nexus.piplogger()
        Daily_Nexus.stopLossSell()
        Daily_Nexus.tstoplosscheck()
        Daily_Nexus.tstoplosscont()
        Daily_Nexus.takeProfitSell()
      }
    } catch (error) {
      console.log(error)
    }
    /* figure out how to clear memory, and do so here after every iteration */
    /* memory issue solved: 4/20/22 */ }

  /** close position method for taking profit, and gives pip count and win/loss ratio */
  static closePosTP () {
    if (Daily_Nexus.pos) {
      if (Daily_Nexus.buy_pos) {
        Daily_Nexus.buy_pos = false
        Daily_Nexus.pos = false
        Daily_Nexus.pot_buy = false
        Daily_Nexus.tstop = false
        Daily_Nexus.tstoplossinits = false
        Daily_Nexus.tstoplossvoid = false
        Daily_Nexus.pchan = false
        Daily_Nexus.pzone = false
        Daily_Nexus.wins += 1
        Daily_Nexus.trades += 1
        Daily_Nexus.piplog = [0, 0, 0]
        const pipchange = Daily_Functions.pipCountBuy(Daily_Nexus.posprice, Daily_Functions.price)
        Daily_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Daily_Nexus.pair)
        console.log('Take Profit Hit on Daily')
        console.log(Daily_Nexus.wins + ' Wins and     ' + Daily_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Daily_Nexus.wins / Daily_Nexus.trades)
        console.log('Pip Count: ' + Daily_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Daily_Nexus.pair,
          0,
          0,
          0.05,
          'Daily'
        );
      }
      if (Daily_Nexus.sell_pos) {
        Daily_Nexus.sell_pos = false
        Daily_Nexus.pos = false
        Daily_Nexus.tstop = false
        Daily_Nexus.pot_sell = false
        Daily_Nexus.tstoplossinits = false
        Daily_Nexus.tstoplossvoid = false
        Daily_Nexus.pchan = false
        Daily_Nexus.pzone = false
        Daily_Nexus.wins += 1
        Daily_Nexus.trades += 1
        Daily_Nexus.piplog = [0, 0, 0]
        const pipchange = Daily_Functions.pipCountSell(Daily_Nexus.posprice, Daily_Functions.price)
        Daily_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Daily_Nexus.pair)
        console.log('Take Profit Hit on Daily')
        console.log(Daily_Nexus.wins + ' Wins and     ' + Daily_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Daily_Nexus.wins / Daily_Nexus.trades)
        console.log('Pip Count: ' + Daily_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Daily_Nexus.pair,
          0,
          0,
          0.05,
          'Daily'
        );
      }
    }
  }

  /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
  static closePosSL () {
    if (Daily_Nexus.pos) {
      if (Daily_Nexus.sell_pos) {
        Daily_Nexus.sell_pos = false
        Daily_Nexus.pos = false
        Daily_Nexus.tstop = false
        Daily_Nexus.pot_sell = false
        Daily_Nexus.tstoplossinits = false
        Daily_Nexus.tstoplossvoid = false
        Daily_Nexus.pchan = false
        Daily_Nexus.pzone = false
        Daily_Nexus.losses += 1
        Daily_Nexus.trades += 1
        Daily_Nexus.piplog = [0, 0, 0]
        const pipchange = Daily_Functions.pipCountSell(Daily_Nexus.posprice, Daily_Functions.price)
        Daily_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Daily_Nexus.pair)
        console.log('Stop Loss Hit on Daily')
        console.log(Daily_Nexus.wins + ' Wins and     ' + Daily_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Daily_Nexus.wins / Daily_Nexus.trades)
        console.log('Pip Count: ' + Daily_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Daily_Nexus.pair,
          0,
          0,
          0.05,
          'Daily'
        );
      }
      if (Daily_Nexus.buy_pos) {
        Daily_Nexus.buy_pos = false
        Daily_Nexus.pos = false
        Daily_Nexus.tstop = false
        Daily_Nexus.tstoplossinits = false
        Daily_Nexus.tstoplossvoid = false
        Daily_Nexus.pchan = false
        Daily_Nexus.pzone = false
        Daily_Nexus.pot_buy = false
        Daily_Nexus.losses += 1
        Daily_Nexus.trades += 1
        Daily_Nexus.piplog = [0, 0, 0]
        const pipchange = Daily_Functions.pipCountBuy(Daily_Nexus.posprice, Daily_Functions.price)
        Daily_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Daily_Nexus.pair)
        console.log('Stop Loss Hit on Daily')
        console.log(Daily_Nexus.wins + ' Wins and     ' + Daily_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Daily_Nexus.wins / Daily_Nexus.trades)
        console.log('Pip Count: ' + Daily_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Daily_Nexus.pair,
          0,
          0,
          0.05,
          'Daily'
        );
      }
    }
  }
}

class Daily_Functions {
  multiplier = 0
  priceHist = []
  rejectionzones = []
  extendHist = []
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
  finlevs = []

  /** load instrument name from json file */
  static instrument_name () {
    Daily_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from database */
  static HistoryAssigner () {
    const instrument = Daily_Functions.instrument_name()
    Daily_Functions.priceHist = dataset.Daily.c
    Daily_Functions.highs = dataset.Daily.h
    Daily_Functions.lows = dataset.Daily.l
    Daily_Functions.extendHist = dataset.Daily_Extend.c
    Daily_Functions.extendHigh = dataset.Daily_Extend.h
    Daily_Functions.extendLow = dataset.Daily_Extend.l
  }

  /** load price from json file */
  static ValueAssigner () {
    Daily_Functions.price = liveprice
  }

  /** second consolidation method, meant to strengthen consolidation identification */
  static consolidationtwo () {
    const history = Daily_Functions.priceHist
    const highs = Daily_Functions.highs 
    const lows = Daily_Functions.lows 
    const histmax = Math.max(...highs)
    const histmin = Math.min(...lows)
    const histdiff = histmax - histmin
    
    // Ensure we have enough data
    const minDataPoints = 20
    if (history.length < minDataPoints) {
      return true; // Default to consolidation if not enough data to determine
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
    
    // Narrowing bands indicate consolidation
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.02 // Tight bands threshold
    
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
    
    // Decreasing TR indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedATR < 0.008 // Low volatility threshold
    
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
    
    // Narrow range indicates consolidation
    const isNarrowRange = priceRangePercent < 0.02 // 2% range threshold
    const isLowDeviation = relativeStdDev < 0.01 // 1% std dev threshold
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    // Prepare x and y for regression
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Flat slope and good fit indicate consolidation
    const isFlatSlope = slope < 0.0001 * mean // Extremely small slope relative to price
    const isPoorFit = r2 < 0.5 // Indicates non-directional (sideways) movement
    
    // APPROACH 5: Check for higher highs/lower lows pattern
    let hasDirectionalMovement = false
    
    // Check for consecutive higher highs or lower lows (trend indicators)
    let consecutiveHigherHighs = 0
    let consecutiveLowerLows = 0
    const pattern_window = 5
    
    for (let i = 1; i < pattern_window; i++) {
      if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1]) {
        consecutiveHigherHighs++;
      }
      if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1]) {
        consecutiveLowerLows++;
      }
    }
    
    // Strong directional pattern indicates trending, not consolidation
    if (consecutiveHigherHighs >= 3 || consecutiveLowerLows >= 3) {
      hasDirectionalMovement = true;
    }
    
    // Combine all factors to decide if the market is consolidating
    // Use a scoring system where more indicators agreeing increases confidence
    
    let consolidationScore = 0;
    let totalFactors = 0;
    
    // Bollinger factors
    if (bandWidthShrinking) consolidationScore++;
    if (isTightBands) consolidationScore++;
    totalFactors += 2;
    
    // TR factors
    if (trTrend) consolidationScore++;
    if (isLowVolatility) consolidationScore++;
    totalFactors += 2;
    
    // Range factors
    if (isNarrowRange) consolidationScore++;
    if (isLowDeviation) consolidationScore++;
    totalFactors += 2;
    
    // Regression factors
    if (isFlatSlope) consolidationScore++;
    if (isPoorFit) consolidationScore++;
    totalFactors += 2;
    
    // Direction factor (negative score if directional)
    if (!hasDirectionalMovement) consolidationScore++;
    totalFactors += 1;
    
    // Calculate overall probability of consolidation
    const consolidationProbability = consolidationScore / totalFactors;
    
    // Return true if consolidation probability is above 60%
    return consolidationProbability >= 0.6;
  }

  static consolidation() {
    // Get price data
    const history = Daily_Functions.priceHist
    const histLen = history.length
    
    // Need enough data for analysis
    if (histLen < 30) return false
    
    // SECTION 1: PRICE STRUCTURE ANALYSIS
    // Sample recent prices (more weight on recent activity)
    const recentPrices = history.slice(-25)  // Increased from lower timeframes
    const olderPrices = history.slice(-50, -25)  // Deeper history for daily
    
    // Calculate price statistics
    const maxRecent = Math.max(...recentPrices)
    const minRecent = Math.min(...recentPrices)
    const maxOlder = Math.max(...olderPrices)
    const minOlder = Math.min(...olderPrices)
    const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length
    
    // Calculate normalized price ranges as percentages
    const recentRange = (maxRecent - minRecent) / avgPrice
    const olderRange = (maxOlder - minOlder) / avgPrice
    
    // Calculate percentage changes between consecutive prices
    const changes = []
    for (let i = 1; i < recentPrices.length; i++) {
      changes.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1])
    }
    
    // SECTION 2: CYCLE DETECTION - novel approach
    // Find dominant cycle length using auto-correlation
    let maxCorrelation = 0
    let dominantCycle = 0
    
    // Search for cycle lengths between 3 and 15 periods for daily
    for (let lag = 3; lag <= 15; lag++) {
      let correlation = 0
      let validPairs = 0
      
      for (let i = 0; i < recentPrices.length - lag; i++) {
        correlation += (recentPrices[i] - avgPrice) * (recentPrices[i + lag] - avgPrice)
        validPairs++
      }
      
      if (validPairs > 0) {
        correlation /= validPairs
        
        // Normalize correlation
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation
          dominantCycle = lag
        }
      }
    }
    
    // Convert correlation to a 0-1 scale where 1 is perfect cyclic behavior
    const normCorrelation = maxCorrelation > 0 ? 
      Math.min(1, maxCorrelation / (0.5 * Math.pow(maxRecent - minRecent, 2))) : 0
    
    // SECTION 3: DIRECTIONAL ANALYSIS
    // Detect if price is showing directional tendencies or random walk
    let consecutiveUp = 0
    let consecutiveDown = 0
    let maxConsecutive = 0
    let prevDirection = null
    
    for (const change of changes) {
      const currentDirection = change >= 0
      
      if (prevDirection === true && currentDirection === true) {
        consecutiveUp++
        maxConsecutive = Math.max(maxConsecutive, consecutiveUp)
      } else if (prevDirection === false && currentDirection === false) {
        consecutiveDown++
        maxConsecutive = Math.max(maxConsecutive, consecutiveDown)
      } else {
        consecutiveUp = currentDirection ? 1 : 0
        consecutiveDown = currentDirection ? 0 : 1
      }
      
      prevDirection = currentDirection
    }
    
    // SECTION 4: ADAPTIVE THRESHOLD BASED ON VOLATILITY
    // Calculate ATR (Average True Range)-like volatility measure
    let sumTrueRange = 0
    for (let i = 1; i < recentPrices.length; i++) {
      const trueRange = Math.abs(recentPrices[i] - recentPrices[i-1])
      sumTrueRange += trueRange
    }
    const atr = sumTrueRange / (recentPrices.length - 1)
    const normalizedAtr = atr / avgPrice
    
    // CRITICAL CONDITION: Disqualify if market shows clear trending behavior
    // Increased to be more lenient for daily timeframe
    if (maxConsecutive >= 9) {  // Increased from 7 to 9
      return false // Trending market with 9+ consecutive moves in same direction
    }
    
    // CRITICAL CONDITION: Disqualify if recent volatility is significantly higher than historical
    // Increased to be more lenient
    const volatilityExpanding = normalizedAtr > 0.006 && recentRange > olderRange * 1.5  // More lenient thresholds
    if (volatilityExpanding) {
      return false // Expanding volatility suggests breakout or trend formation
    }
    
    // SECTION 5: PRICE SPIKES ANALYSIS
    // Detect outliers in price changes (spikes) that would disqualify consolidation
    const stdDevChanges = Math.sqrt(
      changes.reduce((sum, change) => sum + change * change, 0) / changes.length
    )
    
    let spikeCount = 0
    for (const change of changes) {
      if (Math.abs(change) > stdDevChanges * 3.0) {  // Increased threshold from 2.5 to 3.0
        spikeCount++
      }
    }
    
    // Too many spikes suggest volatility, not consolidation
    if (spikeCount > 4) {  // Increased from 3 to 4
      return false
    }
    
    // SECTION 6: DECISION FRAMEWORK
    // Combined criteria with more lenient thresholds for daily timeframe
    
    // Core consolidation conditions - further adjusted for daily timeframe
    const narrowRange = recentRange < 0.035  // Increased from 0.025 to 0.035 (3.5%)
    const stableRange = Math.abs(recentRange - olderRange) / olderRange < 0.5  // Increased from 0.4 to 0.5
    const lowVolatility = normalizedAtr < 0.0045  // Increased from 0.0035 to 0.0045
    const goodCycleStrength = normCorrelation > 0.3  // Decreased from 0.35 to 0.3 (less strict)
    
    // Count how many conditions are met
    let conditionsMet = 0
    if (narrowRange) conditionsMet++
    if (stableRange) conditionsMet++
    if (lowVolatility) conditionsMet++ 
    if (goodCycleStrength) conditionsMet++
    
    // Additional context-specific conditions
    const consistentStructure = maxConsecutive <= 5  // Increased from 4 to 5
    const limitedSpikes = spikeCount <= 3  // Increased from 2 to 3
    
    if (consistentStructure) conditionsMet++
    if (limitedSpikes) conditionsMet++
    
    // Lower the required conditions to make consolidation more likely to be true
    const requiredConditions = normalizedAtr < 0.004 ? 3 : 4  // Decreased from 4/5 to 3/4
    
    // Final decision
    return conditionsMet >= requiredConditions;
  }

  /** finds support and resistance levels, very important for code function, would love to improve this */
  static supreslevs() {
    // Get price history data
    const history = Daily_Functions.priceHist
    const highs = Daily_Functions.highs || history
    const lows = Daily_Functions.lows || history
    const price = Daily_Functions.getPrice()
    
    // Ensure we have enough data
    if (history.length < 15) {
      // Initialize with default values if insufficient data
      Daily_Nexus.support = price * 0.99
      Daily_Nexus.resistance = price * 1.01
      Daily_Nexus.finlevs = [price * 0.99, price * 1.01]
      return
    }
    
    // Calculate price range and statistics
    const ceiling = Math.max(...highs)
    const floor = Math.min(...lows)
    const difference = ceiling - floor
    const avgPrice = history.reduce((sum, p) => sum + p, 0) / history.length
    
    // Identify potential levels using various methods
    const levels = []
    
    // Method 1: Find historical price clusters using histogram approach
    const histogramBins = 100
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
    
    // Method 3: Round numbers often act as psychological support/resistance
    const precision = price < 10 ? 3 : price < 100 ? 2 : price < 1000 ? 1 : 0
    const multiplier = Math.pow(10, precision)
    
    for (let i = Math.floor(floor / multiplier) * multiplier; i <= ceiling; i += multiplier) {
      if (i >= floor && i <= ceiling) {
        levels.push(i)
      }
    }
    
    // Filter levels that are too close to each other
    const minimumDistance = avgPrice * 0.005 // 0.5% minimum separation for daily timeframe
    const filteredLevels = Daily_Functions.filterCloseValues ? 
      Daily_Functions.filterCloseValues(levels, minimumDistance) : 
      levels.filter((value, index, self) => 
        self.findIndex(v => Math.abs(value - v) < minimumDistance) === index
      )
    
    // Separate levels above and below current price
    const levelsBelow = filteredLevels.filter(level => level < price)
    const levelsAbove = filteredLevels.filter(level => level > price)
    
    // Calculate support level - closest significant level below
    let support
    if (levelsBelow.length > 0) {
      const supportCandidates = levelsBelow.map(level => ({
        level,
        distance: price - level
      }))
      supportCandidates.sort((a, b) => a.distance - b.distance)
      support = supportCandidates[0].level
    } else {
      // Fallback support
      const volatility = Daily_Functions.volatility ? Daily_Functions.volatility() : 0.01
      support = price * (1 - volatility * 2)
    }
    
    // Calculate resistance level - closest significant level above
    let resistance
    if (levelsAbove.length > 0) {
      const resistanceCandidates = levelsAbove.map(level => ({
        level,
        distance: level - price
      }))
      resistanceCandidates.sort((a, b) => a.distance - b.distance)
      resistance = resistanceCandidates[0].level
    } else {
      // Fallback resistance
      const volatility = Daily_Functions.volatility ? Daily_Functions.volatility() : 0.01
      resistance = price * (1 + volatility * 2)
    }
    
    // Store results
    Daily_Nexus.support = support
    Daily_Nexus.resistance = resistance
    Daily_Nexus.finlevs = filteredLevels
  }

  /**
   * Helper method to calculate the standard deviation of a set of values
   * @param {Array} values - Array of numeric values
   * @returns {number} Standard deviation of the values
   */
  static calculateStdDev(values) {
    if (!values || values.length === 0) return 0;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate sum of squared differences from mean
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((sum, val) => sum + val, 0);
    
    // Return standard deviation (square root of average squared difference)
    return Math.sqrt(sumSquaredDiffs / values.length);
  }

  /**
   * Helper method to filter values that are too close to each other
   * @param {Array} values - Array of price levels
   * @param {number} minDistance - Minimum distance between levels
   * @returns {Array} Filtered array with spaced levels
   */
  static filterCloseValues(values, minDistance) {
    if (!values.length) return []
    
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b)
    const result = [sortedValues[0]]
    
    // Add only values that are sufficiently distant from previously added values
    for (let i = 1; i < sortedValues.length; i++) {
      if (sortedValues[i] - result[result.length - 1] >= minDistance) {
        result.push(sortedValues[i])
      }
    }
    
    return result
  }

  static tpvariation () {
    const tp = Daily_Nexus.tp
    const values = Daily_Nexus.finlevs.concat(Daily_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    const num1 = Daily_Functions.price
    const volval = Daily_Functions.volatility()
    if (Daily_Nexus.buy_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 < values[item]) {
          valdiffgreater.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Daily_Nexus.tp
      filteredvaldiff = [...new Set(valdiffgreater)]
      for (const valuers in filteredvaldiff) {
        referenceval = closesttp - num1
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Daily_Nexus.tp = Daily_Functions.price + (Math.abs(Daily_Functions.price - Daily_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Daily_Functions.price)) {
          nexttp = Daily_Functions.price + (Math.abs(Daily_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Daily_Functions.price + ((Daily_Nexus.tp - Daily_Functions.price) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Daily_Functions.price)) {
          nexttp = Daily_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Daily_Functions.price + ((Daily_Functions.tp - Daily_Functions.price) * 1.382)
        }
      }
    }
    if (Daily_Nexus.sell_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 > values[item]) {
          valdiffless.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Daily_Nexus.tp
      filteredvaldiff = [...new Set(valdiffless)]
      for (const valuers in filteredvaldiff) {
        referenceval = num1 - closesttp
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Daily_Nexus.tp = Daily_Functions.price - (Math.abs(Daily_Functions.price - Daily_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Daily_Functions.price)) {
          nexttp = Daily_Functions.price - (Math.abs(Daily_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Daily_Functions.price - ((Daily_Functions.price - Daily_Nexus.tp) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Daily_Functions.price)) {
          nexttp = Daily_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Daily_Functions.price - ((Daily_Functions.price - Daily_Nexus.tp) * 1.382)
        }
      }
    }
    Daily_Nexus.tptwo = nexttp
  }

  /** fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
  static fib () {
    const recents = Daily_Functions.recentHisto
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
    const currentprice = Daily_Functions.price
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

  /**  Machine learning method for daily timeframe used to determine past movement patterns to support supreslevs */
  static overall () {
    // Get extended price history data and current price
    const extendedhistory = Daily_Functions.extendHist
    const extendedHighs = Daily_Functions.extendHigh 
    const extendedLows = Daily_Functions.extendLow 
    const price = Daily_Functions.price
    
    // Define support/resistance levels from multiple timeframes for more robust rejection zones
    // Ensure these are always arrays even if undefined
    const weeklyLevels = Array.isArray(Weekly_Functions.finlevs) ? Weekly_Functions.finlevs : []
    const dailyLevels = Array.isArray(Daily_Functions.finlevs) ? Daily_Functions.finlevs : []
    const keyLevels = [...weeklyLevels, ...dailyLevels]
    
    // Calculate volatility to adjust buffer size dynamically
    const recentPrices = extendedhistory.slice(-50)
    const volatility = Daily_Functions.volatility ? Daily_Functions.volatility() : 0.05
    
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
    const result = Daily_Functions.analysis(
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
    Daily_Functions.rejectionzones = []
    
    // Get current price and normal history
    const price = Daily_Functions.price
    const histnorm = Daily_Functions.priceHist
    
    // Calculate price statistics
    const priceStdDev = Daily_Functions.calculateStdDev(extendedhistory.slice(-50))
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
    const volAdjustment = Daily_Functions.volatility ? 
      Math.max(0.8, Math.min(1.2, Daily_Functions.volatility() * 10)) : 
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
        Daily_Functions.rejectionzones.push(extendedhistory[idx])
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
    for (const zone of Daily_Functions.rejectionzones) {
      if (Math.abs(price - zone) < rejectionProximityThreshold) {
        nearRejectionZone = true
        break
      }
    }
    
    // Allow more rejection zones before prohibiting trades
    return !(rejection > 3 || nearRejectionZone)
  }

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Daily_Functions.overall()
    const rejects = Daily_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Daily_Nexus.pot_buy) {
        if (Daily_Functions.price < val) {
          diffs.push(val - Daily_Functions.price)
        }
      }
      if (Daily_Nexus.pot_sell) {
        if (Daily_Functions.price > val) {
          diffs.push(Daily_Functions.price - val)
        }
      }
    }
    if (Math.abs(Math.min(...diffs)) < Math.abs(Daily_Functions.price - Daily_Nexus.tp)) {
      Daily_Nexus.pot_buy = false
      Daily_Nexus.pot_sell = false
      return true
    } else {
      return false
    }
  }

  /** return price */
  static getPrice () {
    return Daily_Functions.price
  }

  /** return historical price */
  static priceHistory () {
    return Daily_Functions.priceHist
  }

  /** find whether trend is going up or down */
  static trend () {
    const history = Daily_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

  /** recent history, shortens history array into last 50 digits for different analyses */
  static recentHist () {
    const history = Daily_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 50; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Daily_Functions.recentHisto = historytwo.reverse()
  }

  /** determination of stop loss size */
  static stoploss () {
    const highs = Daily_Functions.highs
    const lows = Daily_Functions.lows
    const diff = []
    let totaldiff = 0
    let finaldiff = 0
    for (let variables = 0; variables < 30; variables++) {
      diff.push(Math.abs(highs[highs.length - 1 - variables] - lows[lows.length - 1 - variables]))
    }
    for (let variables = 0; variables < diff.length; variables++) {
      totaldiff += diff[variables]
    }
    if (Daily_Functions.volatility() > 0.618) {
      finaldiff = (totaldiff / 30) * 1.382
    } else {
      finaldiff = (totaldiff / 30)
    }
    let slceil = 0
    let slfloor = 0
    let numbuy = 0
    let newsl = 0
    if (Daily_Nexus.pot_buy) {
      const diffprice = Daily_Functions.price - finaldiff
      if (!Number.isFinite(Daily_Functions.closesttwo(diffprice)[0])) {
        slfloor = Daily_Functions.price - (finaldiff * 3.618)
        newsl = slfloor
      } else {
        numbuy = Daily_Functions.closesttwo(diffprice)[0]
        if (!Number.isFinite(Daily_Functions.closesttwo(numbuy)[0])) {
          newsl = diffprice - (0.786 * (diffprice - numbuy))
        } else {
          slfloor = (Daily_Functions.price - ((Daily_Functions.price - Daily_Functions.closesttwo(numbuy)[0]) * 1.618 * 0.786))
          newsl = slfloor
        }
      }
      Daily_Nexus.sl = newsl
    } if (Daily_Nexus.pot_sell) {
      const diffprice = finaldiff + Daily_Functions.price
      if (!Number.isFinite(Daily_Functions.closesttwo(diffprice)[1])) {
        slceil = Daily_Functions.price + (finaldiff * 3.618)
        newsl = slceil
      } else {
        numbuy = Daily_Functions.closesttwo(diffprice)[1]
        if (!Number.isFinite(Daily_Functions.closesttwo(numbuy)[1])) {
          newsl = diffprice + (0.786 * (numbuy - diffprice))
        } else {
          slceil = (Daily_Functions.price + ((Math.abs(Daily_Functions.price - Daily_Functions.closesttwo(numbuy)[1])) * 1.618 * 0.786))
          newsl = slceil
        }
      }
      Daily_Nexus.sl = newsl
    }
    return finaldiff
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closesttwo (num1) {
    const values = Daily_Nexus.finlevs.concat(Daily_Nexus.biggersupres)
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
    const closestbelow = Daily_Functions.price - Math.min(...valdiffless)
    const closestabove = Daily_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return closests
  }

  /** price zones, meant to determine whether a price zone has been found or not */
  static priceZones () {
    Daily_Functions.supreslevs()
    if (Math.abs((Daily_Functions.pipCountBuy(Daily_Functions.price, Daily_Nexus.resistance))
    ) / (Math.abs(Daily_Functions.pipCountBuy(Math.max(...Daily_Functions.priceHist), Math.min(...Daily_Functions.priceHist)))) < 0.1) {
      return true
    } else if (Math.abs((Daily_Functions.pipCountBuy(Daily_Functions.price, Daily_Nexus.support))
    ) / (Math.abs(Daily_Functions.pipCountBuy(Math.max(...Daily_Functions.priceHist), Math.min(...Daily_Functions.priceHist)))) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** keylev, meant to determine the closest keylevel to the current price */
  static keylev () {
    Daily_Functions.getPrice()
    if (Daily_Functions.valdiff(Daily_Functions.price, Daily_Functions.closest(Daily_Functions.price)) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** volatility, meant to determine whether or not price movement is too volatile for current parameters */
  static volatility () {
    const history = Daily_Functions.priceHist
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
    const factor = Daily_Functions.volatility()
    const history = Daily_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const diffy = ceiling - floor
    const posdiff = Math.abs(Daily_Nexus.posprice - Daily_Functions.price)
    const deci = posdiff / diffy
    const input = deci * 6.18
    const equation = (1 - factor) * (((input * input) + input) / ((input * input) + input + 1))
    return equation
  }

  /**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
  static priceChannels () {
    const rvalues = Daily_Functions.regression()
    if ((rvalues[0] * rvalues[0]) > 0.8 && (rvalues[1] * rvalues[1]) > 0.8) {
      return true
    } else {
      return false
    }
  }

  /** used to determine slope between two points */
  static slopes () {
    Daily_Functions.recentHist()
    const recentHistory = Daily_Functions.recentHisto
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
    Daily_Functions.recentHist()
    const recentHistory = Daily_Functions.recentHisto
    const slope = Daily_Functions.slopes()
    const maxes = []
    const mins = []
    for (let value = 3; value < slope.length - 2; value++) {
      if (slope[value - 1] > 0 && slope[value] < 0) {
        if (slope[value - 2] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) } else if (slope[value - 3] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) }
      } else if (slope[value - 1] < 0 && slope[value] > 0) {
        if (slope[value - 2] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) } else if (slope[value - 3] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) }
      }
    }
    Daily_Functions.maxes = maxes
    Daily_Functions.mins = mins
  }

  /** used to determine regression lines (moving averages, for example) */
  static regression () {
    Daily_Functions.maxes_mins()
    const x = []
    const length = Daily_Functions.maxes.length
    for (let value = 0; value < length; value++) { x.push(value) }
    const y = Daily_Functions.maxes
    const regressions = new regression.SimpleLinearRegression(x, y)
    const xtwo = []
    const lengthtwo = Daily_Functions.mins.length
    for (let value = 0; value < lengthtwo; value++) { xtwo.push(value) }
    const ytwo = Daily_Functions.mins
    const regressionstwo = new regression.SimpleLinearRegression(xtwo, ytwo)
    const roneone = Object.values(regressions.score(x, y))[0]
    const ronetwo = Object.values(regressions.score(x, y))[1]
    const rtwoone = Object.values(regressionstwo.score(xtwo, ytwo))[0]
    const rtwotwo = Object.values(regressionstwo.score(xtwo, ytwo))[1]
    return [ronetwo, rtwotwo]
  }

  /** self explanatory, finds RSI and compares the last two */
  static rsi () {
    const history = Daily_Functions.priceHist
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
    const history = Daily_Functions.priceHist
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
    const history = Daily_Functions.priceHist
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
    const history = Daily_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** new indicator mix that finds EMAS of RSI and compares the last two values */
  static obv () {
    const history = Daily_Functions.priceHist
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

  /** pip converter */
  static pipreverse (num, num2) {
    if (String(num).indexOf('.') == 2) {
      Daily_Functions.multiplier = 0.001
    } else if (String(num).indexOf('.') == 3) {
      Daily_Functions.multiplier = 0.01
    } else if (String(num).indexOf('.') == 4) {
      Daily_Functions.multiplier = 0.1
    } else if (String(num).indexOf('.') == 5) {
      Daily_Functions.multiplier = 1
    } else if (String(num).indexOf('.') == 5) {
      Daily_Functions.multiplier = 10
    } else if (String(num).indexOf('.') == 6) {
      Daily_Functions.multiplier = 100
    } else if (String(num).indexOf('.') == 7) {
      Daily_Functions.multiplier = 1000
    } else if (String(num).indexOf('.') == 8) {
      Daily_Functions.multiplier = 10000
    } else if (String(num).indexOf('.') == 9) {
      Daily_Functions.multiplier = 100000
    } else if (String(num).indexOf('.') == 10) {
      Daily_Functions.multiplier = 1000000
    } else { Daily_Functions.multiplier = 0.0001 }
    num2 *= Daily_Functions.multiplier
    return (num2)
  }

  static instrument_switcher (instrument) {
  }

  /* sets value difference as a decimal-percentage of floor to ceiling */
  /** gets value difference for normalization of data points */
  static valdiff (num1, num2) {
    const history = Daily_Functions.priceHist
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
      Daily_Functions.multiplier = 1000
    } else if (String(price).indexOf('.') == 3) {
      Daily_Functions.multiplier = 100
    } else if (String(price).indexOf('.') == 4) {
      Daily_Functions.multiplier = 10
    } else if (String(price).indexOf('.') == 5) {
      Daily_Functions.multiplier = 1
    } else if (String(price).indexOf('.') == 5) {
      Daily_Functions.multiplier = 0.1
    } else if (String(price).indexOf('.') == 6) {
      Daily_Functions.multiplier = 0.01
    } else if (String(price).indexOf('.') == 7) {
      Daily_Functions.multiplier = 0.001
    } else if (String(price).indexOf('.') == 8) {
      Daily_Functions.multiplier = 0.0001
    } else if (String(price).indexOf('.') == 9) {
      Daily_Functions.multiplier = 0.00001
    } else if (String(price).indexOf('.') == 10) {
      Daily_Functions.multiplier = 0.000001
    } else {
      Daily_Functions.multiplier = 10000
    }
    return num1 * Daily_Functions.multiplier
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closest (num1) {
    const values = Daily_Nexus.finlevs.concat(Daily_Nexus.biggersupres)
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
    const closestbelow = Daily_Functions.price - Math.min(...valdiffless)
    const closestabove = Daily_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return Math.min(...closests)
  }

  /** Counts pips between two values for buying */
  static pipCountBuy (num1, num2) {
    let nums
    nums = Daily_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }

  /** Counts pips between two values for selling */
  static pipCountSell (num1, num2) {
    let nums
    nums = Daily_Functions.pip(num1, num2)
    return (nums[0] - nums[1])
  }

  /**
   * Helper method to calculate the standard deviation of a set of values
   * @param {Array} values - Array of numeric values
   * @returns {number} Standard deviation of the values
   */
  static calculateStdDev(values) {
    if (!values || values.length === 0) return 0;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate sum of squared differences from mean
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((sum, val) => sum + val, 0);
    
    // Return standard deviation (square root of average squared difference)
    return Math.sqrt(sumSquaredDiffs / values.length);
  }
}

class Weekly_Functions {
  multiplier = 0
  priceHist = []
  highs = []
  lows = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  resistance = 0
  support = 0
  finlevs = []

  static HistoryAssigner () {
    const instrument = Daily_Functions.instrument_name()
    Weekly_Functions.priceHist = dataset.Weekly.c
    Weekly_Functions.highs = dataset.Weekly.h
    Weekly_Functions.lows = dataset.Weekly.l
  }

  static ValueAssigner () {
    Daily_Functions.price = liveprice
  }

  /* make  function */
  /* let data = request() */
  static getPrice () {
    return Weekly_Functions.price
  }

  static trend () {
    Weekly_Functions.recentHist()
    const hist = Weekly_Functions.recentHisto
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
    Weekly_Functions.supreslevs()
    const biggersupres = Weekly_Functions.supreslevs()
    return biggersupres
  }

  /* Add Key Part That the Levels Must Repeat 3x */
  static supreslevs () {
    // Get price history data
    const history = Weekly_Functions.priceHist
    const highs = Weekly_Functions.highs || history
    const lows = Weekly_Functions.lows || history
    const price = Weekly_Functions.getPrice()
    
    // Ensure we have enough data
    if (history.length < 15) {
      // Initialize with default values if insufficient data
      Weekly_Functions.support = price * 0.985
      Weekly_Functions.resistance = price * 1.015
      Weekly_Functions.finlevs = [price * 0.985, price * 1.015]
      return
    }
    
    // Calculate price range and statistics
    const ceiling = Math.max(...highs)
    const floor = Math.min(...lows)
    const difference = ceiling - floor
    const avgPrice = history.reduce((sum, p) => sum + p, 0) / history.length
    
    // Identify potential levels using various methods
    const levels = []
    
    // Method 1: Find historical price clusters using histogram approach
    const histogramBins = 100
    const binSize = (ceiling - floor) / histogramBins
    const histogram = new Array(histogramBins).fill(0)
    
    // Fill histogram with price occurrences
    for (let i = 0; i < history.length; i++) {
      const binIndex = Math.min(Math.floor((history[i] - floor) / binSize), histogramBins - 1)
      histogram[binIndex]++
    }
    
    // Find histogram peaks (high-frequency price zones)
    // Use higher threshold for weekly to identify more significant levels
    const threshold = Math.max(3, Math.floor(history.length / 40))
    for (let i = 0; i < histogramBins; i++) {
      if (histogram[i] >= threshold) {
        levels.push(floor + (i + 0.5) * binSize)
      }
    }
    
    // Method 2: Identify swing highs and lows (price pivots)
    const windowSize = Math.min(8, Math.floor(history.length / 12))
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
    
    // Method 3: Round numbers often act as psychological support/resistance
    // Weekly charts often respect larger round numbers
    const precision = price < 10 ? 2 : price < 100 ? 1 : price < 1000 ? 0 : -1
    const multiplier = Math.pow(10, precision)
    
    for (let i = Math.floor(floor / multiplier) * multiplier; i <= ceiling; i += multiplier) {
      if (i >= floor && i <= ceiling) {
        levels.push(i)
      }
    }
    
    // Filter levels that are too close to each other
    // Weekly timeframe requires larger separation
    const minimumDistance = avgPrice * 0.01 // 1% minimum separation for weekly timeframe
    
    // Helper function to filter close values
    const filterCloseValues = (values, minDistance) => {
      if (!values || values.length === 0) return [];
      
      values.sort((a, b) => a - b);
      const result = [];
      let lastIncluded = -Infinity;
      
      for (const val of values) {
        if (val - lastIncluded >= minDistance) {
          result.push(val);
          lastIncluded = val;
        }
      }
      
      return result;
    };
    
    // Use the helper directly
    const filteredLevels = filterCloseValues(levels, minimumDistance);
    
    // Separate levels above and below current price
    const levelsBelow = filteredLevels.filter(level => level < price);
    const levelsAbove = filteredLevels.filter(level => level > price);
    
    // Calculate support level - closest significant level below
    let support;
    if (levelsBelow.length > 0) {
      const supportCandidates = levelsBelow.map(level => ({
        level,
        distance: price - level
      }));
      supportCandidates.sort((a, b) => a.distance - b.distance);
      support = supportCandidates[0].level;
    } else {
      // Fallback support - wider for weekly
      support = price * 0.97;
    }
    
    // Calculate resistance level - closest significant level above
    let resistance;
    if (levelsAbove.length > 0) {
      const resistanceCandidates = levelsAbove.map(level => ({
        level,
        distance: level - price
      }));
      resistanceCandidates.sort((a, b) => a.distance - b.distance);
      resistance = resistanceCandidates[0].level;
    } else {
      // Fallback resistance - wider for weekly
      resistance = price * 1.03;
    }
    
    // Store results
    Weekly_Functions.support = support;
    Weekly_Functions.resistance = resistance;
    Weekly_Functions.finlevs = filteredLevels;
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

class Four_Hour_Functions {
  multiplier = 0
  priceHist = []
  highs = []
  lows = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  finlevs = []

  static HistoryAssigner () {
    const instrument = Daily_Functions.instrument_name()
    Four_Hour_Functions.priceHist = dataset.Four_Hour.c
    Four_Hour_Functions.highs = dataset.Four_Hour.h
    Four_Hour_Functions.lows = dataset.Four_Hour.l
  }

  static trend () {
    const history = Four_Hour_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

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

  static ema () {
    const history = Four_Hour_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

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
}

class One_Hour_Functions {
  multiplier = 0
  priceHist = []
  highs = []
  lows = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  finlevs = []

  static HistoryAssigner () {
    const instrument = Daily_Functions.instrument_name()
    One_Hour_Functions.priceHist = dataset.One_Hour.c
    One_Hour_Functions.highs = dataset.One_Hour.h
    One_Hour_Functions.lows = dataset.One_Hour.l
  }

  static consolidationtwo () {
    const history = One_Hour_Functions.priceHist
    const highs = One_Hour_Functions.highs
    const lows = One_Hour_Functions.lows
    const histmax = Math.max(...history)
    const histmin = Math.min(...history)
    const histdiff = histmax - histmin
    
    // Ensure we have enough data
    const minDataPoints = 20
    if (history.length < minDataPoints) {
      return true; // Default to consolidation if not enough data to determine
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
    
    // Narrowing bands indicate consolidation
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.02 // Tight bands threshold
    
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
    
    // Decreasing TR indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedATR < 0.008 // Low volatility threshold
    
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
    
    // Narrow range indicates consolidation
    const isNarrowRange = priceRangePercent < 0.02 // 2% range threshold
    const isLowDeviation = relativeStdDev < 0.01 // 1% std dev threshold
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    // Prepare x and y for regression
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Flat slope and good fit indicate consolidation
    const isFlatSlope = slope < 0.0001 * mean // Extremely small slope relative to price
    const isPoorFit = r2 < 0.5 // Indicates non-directional (sideways) movement
    
    // APPROACH 5: Check for higher highs/lower lows pattern
    let hasDirectionalMovement = false
    
    // Check for consecutive higher highs or lower lows (trend indicators)
    let consecutiveHigherHighs = 0
    let consecutiveLowerLows = 0
    const pattern_window = 5
    
    for (let i = 1; i < pattern_window; i++) {
      if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1]) {
        consecutiveHigherHighs++;
      }
      if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1]) {
        consecutiveLowerLows++;
      }
    }
    
    // Strong directional pattern indicates trending, not consolidation
    if (consecutiveHigherHighs >= 3 || consecutiveLowerLows >= 3) {
      hasDirectionalMovement = true;
    }
    
    // Combine all factors to decide if the market is consolidating
    // Use a scoring system where more indicators agreeing increases confidence
    
    let consolidationScore = 0;
    let totalFactors = 0;
    
    // Bollinger factors
    if (bandWidthShrinking) consolidationScore++;
    if (isTightBands) consolidationScore++;
    totalFactors += 2;
    
    // TR factors
    if (trTrend) consolidationScore++;
    if (isLowVolatility) consolidationScore++;
    totalFactors += 2;
    
    // Range factors
    if (isNarrowRange) consolidationScore++;
    if (isLowDeviation) consolidationScore++;
    totalFactors += 2;
    
    // Regression factors
    if (isFlatSlope) consolidationScore++;
    if (isPoorFit) consolidationScore++;
    totalFactors += 2;
    
    // Direction factor (negative score if directional)
    if (!hasDirectionalMovement) consolidationScore++;
    totalFactors += 1;
    
    // Calculate overall probability of consolidation
    const consolidationProbability = consolidationScore / totalFactors;
    
    // Return true if consolidation probability is above 60%
    return consolidationProbability >= 0.6;
  }

  static trend () {
    const history = One_Hour_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
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

class Fifteen_Min_Functions {
  multiplier = 0
  priceHist = []
  highs = []
  lows = []
  vals = []
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  finlevs = []
  

  static HistoryAssigner () {
    const instrument = Daily_Functions.instrument_name()
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
    
    // Ensure we have enough data
    const minDataPoints = 20
    if (history.length < minDataPoints) {
      return true; // Default to consolidation if not enough data to determine
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
    
    // Narrowing bands indicate consolidation
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.02 // Tight bands threshold
    
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
    
    // Decreasing TR indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedATR < 0.008 // Low volatility threshold
    
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
    
    // Narrow range indicates consolidation
    const isNarrowRange = priceRangePercent < 0.02 // 2% range threshold
    const isLowDeviation = relativeStdDev < 0.01 // 1% std dev threshold
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    // Prepare x and y for regression
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Flat slope and good fit indicate consolidation
    const isFlatSlope = slope < 0.0001 * mean // Extremely small slope relative to price
    const isPoorFit = r2 < 0.5 // Indicates non-directional (sideways) movement
    
    // APPROACH 5: Check for higher highs/lower lows pattern
    let hasDirectionalMovement = false
    
    // Check for consecutive higher highs or lower lows (trend indicators)
    let consecutiveHigherHighs = 0
    let consecutiveLowerLows = 0
    const pattern_window = 5
    
    for (let i = 1; i < pattern_window; i++) {
      if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1]) {
        consecutiveHigherHighs++;
      }
      if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1]) {
        consecutiveLowerLows++;
      }
    }
    
    // Strong directional pattern indicates trending, not consolidation
    if (consecutiveHigherHighs >= 3 || consecutiveLowerLows >= 3) {
      hasDirectionalMovement = true;
    }
    
    // Combine all factors to decide if the market is consolidating
    // Use a scoring system where more indicators agreeing increases confidence
    
    let consolidationScore = 0;
    let totalFactors = 0;
    
    // Bollinger factors
    if (bandWidthShrinking) consolidationScore++;
    if (isTightBands) consolidationScore++;
    totalFactors += 2;
    
    // TR factors
    if (trTrend) consolidationScore++;
    if (isLowVolatility) consolidationScore++;
    totalFactors += 2;
    
    // Range factors
    if (isNarrowRange) consolidationScore++;
    if (isLowDeviation) consolidationScore++;
    totalFactors += 2;
    
    // Regression factors
    if (isFlatSlope) consolidationScore++;
    if (isPoorFit) consolidationScore++;
    totalFactors += 2;
    
    // Direction factor (negative score if directional)
    if (!hasDirectionalMovement) consolidationScore++;
    totalFactors += 1;
    
    // Calculate overall probability of consolidation
    const consolidationProbability = consolidationScore / totalFactors;
    
    // Return true if consolidation probability is above 60%
    return consolidationProbability >= 0.6;
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

function testdaily (data, price, instrument) {
  instrum = instrument;
  liveprice = price;
  // Assign to the global dataset variable
  dataset = data;
  Daily_Nexus.controlMain();
  
  // If we have a potential buy signal
  if (Daily_Nexus.pot_buy && !Daily_Nexus.buy_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Daily_Functions.supreslevs();
    Daily_Functions.getPrice();
    Daily_Functions.stoploss();
    Daily_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Daily_Nexus.sl.toFixed(5);
    const formattedTP = Daily_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[Daily] BUY SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('BUY', instrument, formattedSL, formattedTP, 0.05, 'Daily algorithm signal', 'Daily');
  }
  
  // If we have a potential sell signal
  if (Daily_Nexus.pot_sell && !Daily_Nexus.sell_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Daily_Functions.supreslevs();
    Daily_Functions.getPrice();
    Daily_Functions.stoploss();
    Daily_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Daily_Nexus.sl.toFixed(5);
    const formattedTP = Daily_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[Daily] SELL SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('SELL', instrument, formattedSL, formattedTP, 0.05, 'Daily algorithm signal', 'Daily');
  }
}

module.exports = {
  testdaily
};
