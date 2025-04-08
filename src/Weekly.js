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

class Weekly_Nexus {
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
  backtest = false

  /** announce price zones and price channels */
  static announcer () {
    if (Weekly_Nexus.pzone == false && Weekly_Functions.priceZones() == true) {
      Weekly_Nexus.pzone = true
      console.log('Price Zone Identified')
    } if (Weekly_Nexus.pzone == true && Weekly_Functions.priceZones() == false) {
      Weekly_Nexus.pzone = false
    } if (Weekly_Nexus.pchan == false && Weekly_Functions.priceChannels() == true) {
      Weekly_Nexus.pchan = true
      console.log('Price Channel Identified')
    } if (Weekly_Nexus.pchan == true && Weekly_Functions.priceChannels() == false) {
      Weekly_Nexus.pchan = false
    }
  }

  /** stop loss for buys */
  static stopLossBuy () {
    if (Weekly_Functions.price <= Weekly_Nexus.sl) {
      Weekly_Nexus.closePosSL()
    }
  }

  /** stop loss for selling */
  static stopLossSell () {
    if (Weekly_Functions.price >= Weekly_Nexus.sl) {
      Weekly_Nexus.closePosSL()
    }
  }

  /** initiates the piplog for pipcounting */
  static piploginit () {
    Weekly_Nexus.piplog = [0, 0, 0]
  }

  /** pip logging method */
  static piplogger () {
    const piplogging = Weekly_Nexus.piplog
    if (Weekly_Nexus.buy_pos) {
      piplogging.push(Weekly_Functions.pipCountBuy(Weekly_Nexus.posprice, Weekly_Functions.price))
      Weekly_Nexus.bigpipprice = Math.max(...piplogging)
      Weekly_Nexus.piplog = piplogging
    }
    if (Weekly_Nexus.sell_pos) {
      piplogging.push(Weekly_Functions.pipCountSell(Weekly_Nexus.posprice, Weekly_Functions.price))
      Weekly_Nexus.bigpipprice = Math.max(...piplogging)
      Weekly_Nexus.piplog = piplogging
    }
  }

  /** take profit for buying */
  static takeProfitBuy () {
    if (Weekly_Functions.price >= Weekly_Nexus.tp) {
      if (Weekly_Functions.volatility() > 0.618) {
        if ((Weekly_Functions.price - Weekly_Nexus.tp) > (Weekly_Nexus.tp - Weekly_Nexus.tstoploss)) {
          if (Weekly_Nexus.tp < Weekly_Nexus.tptwo) {
            Weekly_Nexus.piploginit()
            Weekly_Nexus.posprice = Weekly_Nexus.tp
            Weekly_Nexus.tp = Weekly_Nexus.tptwo
            Weekly_Functions.tpvariation()
            console.log('pair: ' + Weekly_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Weekly_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Weekly_Nexus.tptwo))
          }
        }
      } else {
        Weekly_Nexus.closePosTP()
      }
    } else if (Weekly_Functions.price <= Weekly_Nexus.tstoploss) {
      Weekly_Nexus.closePosTP()
    } else if (Weekly_Functions.price == Weekly_Nexus.tptwo) {
      Weekly_Nexus.closePosTP()
    }
  }

  /** take profit for selling */
  static takeProfitSell () {
    if (Weekly_Functions.price <= Weekly_Nexus.tp) {
      if (Weekly_Functions.volatility() > 0.618) {
        if ((Weekly_Nexus.tp - Weekly_Functions.price) > (Weekly_Nexus.tstoploss - Weekly_Nexus.tp)) {
          if (Weekly_Nexus.tp < Weekly_Nexus.tptwo) {
            Weekly_Nexus.piploginit()
            Weekly_Nexus.posprice = Weekly_Nexus.tp
            Weekly_Nexus.tp = Weekly_Nexus.tptwo
            Weekly_Functions.tpvariation()
            console.log('pair: ' + Weekly_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Weekly_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Weekly_Nexus.tptwo))
          }
        }
      } else {
        Weekly_Nexus.closePosTP()
      }
    } else if (Weekly_Functions.price >= Weekly_Nexus.tstoploss) {
      Weekly_Nexus.closePosTP()
    } else if (Weekly_Functions.price == Weekly_Nexus.tptwo) {
      Weekly_Nexus.closePosTP()
    }
  }

  /** stop loss defining method */
  static stoplossdef () {
    const stoploss = Weekly_Functions.stoploss()
    if (Weekly_Nexus.buy_pos) {
      Weekly_Nexus.sl = Weekly_Functions.price - stoploss
    }
    if (Weekly_Nexus.sell_pos) {
      Weekly_Nexus.sl = Weekly_Functions.price + stoploss
    }
  }

  /** define volatility for the system, tells me whether or not to alter trailing stop loss */
  static volatilitydef () {
    if (Weekly_Functions.volatility() > 0.618 && Weekly_Nexus.tstoplossinits && !Weekly_Nexus.tstoplossvoid) {
      Weekly_Nexus.tstoplossdefvol()
    }
  }

  /** initiate trailing stop loss */
  static tstoplossinit () {
    const stoploss = Weekly_Nexus.sldiff
    if (!Weekly_Nexus.tstop && !Weekly_Nexus.tstoplossinits && !Weekly_Nexus.tstoplossvoid) {
      if (Weekly_Nexus.buy_pos) {
        if (Weekly_Functions.price > Weekly_Nexus.posprice + 0.3 * stoploss) {
          Weekly_Nexus.tstoplossinits = true
          Weekly_Nexus.tstoplossdef()
        }
      }
      if (Weekly_Nexus.sell_pos) {
        if (Weekly_Functions.price < Weekly_Nexus.posprice - 0.3 * stoploss) {
          Weekly_Nexus.tstoplossinits = true
          Weekly_Nexus.tstoplossdef()
        }
      }
    }
  }

  /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
  static tstoplossdefvol () {
    Weekly_Nexus.sldiff = Weekly_Functions.stoploss()
    const stoploss = Weekly_Nexus.sldiff
    if (Weekly_Nexus.buy_pos) {
      if (Weekly_Functions.price > Weekly_Nexus.posprice + 0.3 * stoploss) {
        Weekly_Nexus.tstop = true
        Weekly_Nexus.tstoploss = Weekly_Nexus.posprice + (((Math.abs(Weekly_Functions.price - Weekly_Nexus.posprice)) * (Weekly_Functions.trailingsl())))
      }
    }
    if (Weekly_Nexus.sell_pos) {
      if (Weekly_Functions.price < Weekly_Nexus.posprice - 0.3 * stoploss) {
        Weekly_Nexus.tstop = true
        Weekly_Nexus.tstoploss = Weekly_Nexus.posprice - (((Math.abs(Weekly_Functions.price - Weekly_Nexus.posprice)) * (Weekly_Functions.trailingsl())))
      }
    }
  }

  /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility */
  static tstoplosscheck () {
    const tstoploss = Weekly_Nexus.sldiff
    if (Weekly_Nexus.buy_pos) {
      if (Weekly_Functions.price < Weekly_Nexus.posprice + 0.3 * tstoploss) {
        Weekly_Nexus.tstoplossvoid = true
      } else {
        Weekly_Nexus.tstoplossvoid = false
        Weekly_Nexus.volatilitydef()
        Weekly_Nexus.tstoplossinit()
      }
    }
    if (Weekly_Nexus.sell_pos) {
      if (Weekly_Functions.price > Weekly_Nexus.posprice - 0.3 * tstoploss) {
        Weekly_Nexus.tstoplossvoid = true
      } else {
        Weekly_Nexus.tstoplossvoid = false
        Weekly_Nexus.volatilitydef()
        Weekly_Nexus.tstoplossinit()
      }
    }
  }

  /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
  static tstoplosscont () {
    if (Weekly_Functions.volatility() < 0.618 && Weekly_Nexus.tstoplossinits && !Weekly_Nexus.tstoplossvoid) {
      Weekly_Nexus.sldiff = Weekly_Functions.stoploss()
      const stoploss = Weekly_Nexus.sldiff
      if (Weekly_Nexus.buy_pos) {
        if (Weekly_Functions.price > Weekly_Nexus.posprice + 0.3 * stoploss) {
          Weekly_Nexus.tstoploss = Weekly_Nexus.posprice + Weekly_Functions.pipreverse(Weekly_Nexus.posprice, 0.618 * Weekly_Nexus.bigpipprice)
        }
      }
      if (Weekly_Nexus.sell_pos) {
        if (Weekly_Functions.price < Weekly_Nexus.posprice - 0.3 * stoploss) {
          Weekly_Nexus.tstoploss = Weekly_Nexus.posprice - Weekly_Functions.pipreverse(Weekly_Nexus.posprice, 0.618 * Weekly_Nexus.bigpipprice)
        }
      }
    }
  }

  /** method that defines trailing stop loss for the system to begin with trailing stop loss */
  static tstoplossdef () {
    Weekly_Nexus.sldiff = Weekly_Functions.stoploss()
    const stoploss = Weekly_Nexus.sldiff
    if (Weekly_Nexus.buy_pos) {
      if (Weekly_Functions.price > Weekly_Nexus.posprice + 0.3 * stoploss) {
        Weekly_Nexus.tstop = true
        Weekly_Nexus.tstoploss = Weekly_Nexus.posprice + Weekly_Functions.pipreverse(Weekly_Nexus.posprice, 0.618 * Weekly_Nexus.bigpipprice)
      }
    }
    if (Weekly_Nexus.sell_pos) {
      if (Weekly_Functions.price < Weekly_Nexus.posprice - 0.3 * stoploss) {
        Weekly_Nexus.tstop = true
        Weekly_Nexus.tstoploss = Weekly_Nexus.posprice - Weekly_Functions.pipreverse(Weekly_Nexus.posprice, 0.618 * Weekly_Nexus.bigpipprice)
      }
    }
  }

  /* FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS! */

  /** initiates a buy signal */
  static buy () {
    Weekly_Functions.supreslevs()
    Weekly_Functions.getPrice()
    Weekly_Functions.stoploss()
    Weekly_Functions.tpvariation()
    if (!Weekly_Functions.rejectionzoning()) {
      if (Math.abs(Weekly_Functions.valdiff(Weekly_Functions.price, Weekly_Functions.closest(Weekly_Functions.price))) > 0.025) {
        Weekly_Nexus.tp = Weekly_Nexus.resistance
        Weekly_Nexus.pos = true
        Weekly_Nexus.buy_pos = true
        Weekly_Nexus.posprice = Weekly_Functions.price
        Weekly_Functions.stoploss()
        Weekly_Functions.tpvariation()
        console.log('pair: ' + Weekly_Nexus.pair)
        console.log('Open Buy Order on Weekly')
        console.log('Entry Price: ' + String(Weekly_Nexus.posprice))
        console.log('Stop Loss: ' + String(Weekly_Nexus.sl))
        console.log('Target Take Profit: ' + String(Weekly_Nexus.tp))
        console.log('Take Profit 2: ' + String(Weekly_Nexus.tptwo))
      }}
    sendSignal(
      'BUY',
      Weekly_Nexus.pair,
      Weekly_Nexus.sl,
      Weekly_Nexus.tp,
      0.1, // Higher volume for longest timeframe
      'Weekly'
    );
  }

  /* static buy(){
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
  static sell () {
    Weekly_Functions.supreslevs()
    Weekly_Functions.getPrice()
    Weekly_Functions.stoploss()
    Weekly_Functions.tpvariation()
    if (!Weekly_Functions.rejectionzoning()) {
      if (Math.abs(Weekly_Functions.valdiff(Weekly_Functions.price, Weekly_Functions.closest(Weekly_Functions.price))) > 0.025) {
        Weekly_Nexus.tp = Weekly_Nexus.support
        Weekly_Nexus.pos = true
        Weekly_Nexus.sell_pos = true
        Weekly_Nexus.posprice = Weekly_Functions.price
        Weekly_Functions.stoploss()
        Weekly_Functions.tpvariation()
          console.log('pair: ' + Weekly_Nexus.pair)
        console.log('Open Sell Order on Weekly')
        console.log('Entry Price: ' + String(Weekly_Nexus.posprice))
        console.log('Stop Loss: ' + String(Weekly_Nexus.sl))
        console.log('Target Take Profit: ' + String(Weekly_Nexus.tp))
        console.log('Take Profit 2: ' + String(Weekly_Nexus.tptwo))
    }
    sendSignal(
      'SELL',
      Weekly_Nexus.pair,
      Weekly_Nexus.sl,
      Weekly_Nexus.tp,
      0.1, // Higher volume for longest timeframe
      'Weekly'
    );
  }
}

  /* static sell(){
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
        } */

  /** checks for price movement in lower periods to get better idea of the trend */
  static controlSmallerPeriod () {
    try {
      /* Confirm Trend w/ indicators and price movement */
      Daily_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.HistoryAssigner()
      let buy = false
      let sell = false
      if (!One_Hour_Functions.consolidationtwo() && !Thirty_Min_Functions.consolidationtwo()) {
        if (Daily_Functions.ema()) {
          if (Daily_Functions.trend() && Daily_Functions.macd() && Daily_Functions.obv()) {
            if (One_Hour_Functions.ema()) {
              if (One_Hour_Functions.rsi() && One_Hour_Functions.obv()) {
                buy = true
              }
            }
          }
        }
        if (!Daily_Functions.ema()) {
          if (!Daily_Functions.trend() && !Daily_Functions.macd() && !Daily_Functions.obv()) {
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

  /** main control method, takes control of the entire program and serves as the brain */
  static controlMain () {
    try {
      Weekly_Functions.HistoryAssigner()
      Weekly_Functions.ValueAssigner()
      Daily_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Daily_Functions.supreslevs()
      Thirty_Min_Functions.HistoryAssigner()
      Weekly_Functions.supreslevs()
      Weekly_Nexus.controlSmallerPeriod()
      Weekly_Functions.stoploss()
      Weekly_Functions.getPrice()
      if (!Weekly_Functions.consolidationtwo() && Weekly_Functions.overall() && !Weekly_Functions.consolidation() &&
            !Weekly_Functions.keylev()) {
        if (Weekly_Functions.ema()) {
          if (Weekly_Nexus.controlSmallerPeriod()[0] == true) {
            if (Weekly_Functions.trend() && Weekly_Functions.rsi() &&
                            Weekly_Functions.macd() && Weekly_Functions.roc() && Weekly_Functions.obv()) {
              if (!Weekly_Nexus.pos) {
                if (!Weekly_Nexus.buy_pos) { Weekly_Nexus.pot_buy = true }
                Weekly_Functions.stoploss()
                Weekly_Nexus.piploginit()
                Weekly_Nexus.buy()
              }
            }
          }
        }
        if (!Weekly_Functions.ema()) {
          if (Weekly_Nexus.controlSmallerPeriod()[1] == true) {
            if (!Weekly_Functions.trend() && !Weekly_Functions.rsi() &&
                            !Weekly_Functions.macd() && !Weekly_Functions.roc() && !Weekly_Functions.obv()) {
              if (!Weekly_Nexus.pos) {
                if (!Weekly_Nexus.sell_pos) { Weekly_Nexus.pot_sell = true }
                Weekly_Functions.stoploss()
                Weekly_Nexus.piploginit()
                Weekly_Nexus.sell()
              }
            }
          }
        }
      }
      if (Weekly_Nexus.pos && Weekly_Nexus.buy_pos) {
        Weekly_Nexus.piplogger()
        Weekly_Nexus.stopLossBuy()
        Weekly_Nexus.tstoplosscheck()
        Weekly_Nexus.tstoplosscont()
        Weekly_Nexus.takeProfitBuy()
      }
      if (Weekly_Nexus.pos && Weekly_Nexus.sell_pos) {
        Weekly_Nexus.piplogger()
        Weekly_Nexus.stopLossSell()
        Weekly_Nexus.tstoplosscheck()
        Weekly_Nexus.tstoplosscont()
        Weekly_Nexus.takeProfitSell()
      }
    } catch (error) {
      console.log(error)
    }
    /* figure out how to clear memory, and do so here after every iteration */
    /* memory issue solved: 4/20/22 */ }

  /** close position method for taking profit, and gives pip count and win/loss ratio */
  static closePosTP () {
    if (Weekly_Nexus.pos) {
      if (Weekly_Nexus.buy_pos) {
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
        const pipchange = Weekly_Functions.pipCountBuy(Weekly_Nexus.posprice, Weekly_Functions.price)
        Weekly_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Weekly_Nexus.pair)
        console.log('Take Profit Hit on Weekly')
        console.log(Weekly_Nexus.wins + ' Wins and     ' + Weekly_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Weekly_Nexus.wins / Weekly_Nexus.trades)
        console.log('Pip Count: ' + Weekly_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Weekly_Nexus.pair,
          0,
          0,
          0.1,
          'Weekly'
        );
      }
      if (Weekly_Nexus.sell_pos) {
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
        const pipchange = Weekly_Functions.pipCountSell(Weekly_Nexus.posprice, Weekly_Functions.price)
        Weekly_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Weekly_Nexus.pair)
        console.log('Take Profit Hit on Weekly')
        console.log(Weekly_Nexus.wins + ' Wins and     ' + Weekly_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Weekly_Nexus.wins / Weekly_Nexus.trades)
        console.log('Pip Count: ' + Weekly_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Weekly_Nexus.pair,
          0,
          0,
          0.1,
          'Weekly'
        );
      }
    }
    sendSignal('Weekly', {
      action: 'CLOSE',
      symbol: Weekly_Nexus.pair,
      reason: 'Take profit signal from Weekly strategy'
    });
  }

  /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
  static closePosSL () {
    if (Weekly_Nexus.pos) {
      if (Weekly_Nexus.sell_pos) {
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
        const pipchange = Weekly_Functions.pipCountSell(Weekly_Nexus.posprice, Weekly_Functions.price)
        Weekly_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Weekly_Nexus.pair)
        console.log('Stop Loss Hit on Weekly')
        console.log(Weekly_Nexus.wins + ' Wins and     ' + Weekly_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Weekly_Nexus.wins / Weekly_Nexus.trades)
        console.log('Pip Count: ' + Weekly_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Weekly_Nexus.pair,
          0,
          0,
          0.1,
          'Weekly'
        );
      }
      if (Weekly_Nexus.buy_pos) {
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
        const pipchange = Weekly_Functions.pipCountBuy(Weekly_Nexus.posprice, Weekly_Functions.price)
        Weekly_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Weekly_Nexus.pair)
        console.log('Stop Loss Hit on Weekly')
        console.log(Weekly_Nexus.wins + ' Wins and     ' + Weekly_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Weekly_Nexus.wins / Weekly_Nexus.trades)
        console.log('Pip Count: ' + Weekly_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Weekly_Nexus.pair,
          0,
          0,
          0.1,
          'Weekly'
        );
      }
    }
    sendSignal('Weekly', {
      action: 'CLOSE',
      symbol: Weekly_Nexus.pair,
      reason: 'Stop loss signal from Weekly strategy'
    });
  }

  static updateTrailingStop() {
    if (Weekly_Nexus.tstop && Weekly_Nexus.pos) {
      sendSignal('Weekly', {
        action: 'MODIFY',
        symbol: Weekly_Nexus.pair,
        stopLoss: Weekly_Nexus.tstoploss,
        takeProfit: Weekly_Nexus.tp,
        reason: 'Trailing stop update from Weekly strategy'
      });
    }
  }
}

class Weekly_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  extendHigh = []
  extendLow = []
  vals = []
  rejectionzones = new Array()
  price = 0
  maxes = []
  timeperiods = {}
  mins = []
  recentHisto = []
  highs = []
  lows = []

  /** load instrument name from json file */
  static instrument_name () {
    Weekly_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Weekly_Functions.instrument_name()
    Weekly_Functions.priceHist = dataset.Weekly.c
    Weekly_Functions.highs = dataset.Weekly.h
    Weekly_Functions.lows = dataset.Weekly.l
    Weekly_Functions.extendHist = dataset.Weekly_Extend.c
    Weekly_Functions.extendHigh = dataset.Weekly_Extend.h
    Weekly_Functions.extendLow = dataset.Weekly_Extend.l
  }

  /** load price from json file */
  static ValueAssigner () {
    Weekly_Functions.price = liveprice
  }

  /** Advanced consolidation detection using cycle analysis and adaptive thresholds */
  static consolidation() {
    const history = Weekly_Functions.priceHist
    const highs = Weekly_Functions.highs
    const lows = Weekly_Functions.lows
    
    // Need at least 4 weeks of data
    if (history.length < 4) return false
    
    // Get recent data
    const recentCandles = {
      closes: history.slice(-4),
      highs: highs.slice(-4),
      lows: lows.slice(-4)
    }
    
    // 1. Calculate total range as percentage
    const highest = Math.max(...recentCandles.highs)
    const lowest = Math.min(...recentCandles.lows)
    const avgPrice = recentCandles.closes.reduce((sum, price) => sum + price, 0) / 4
    const totalRangePercent = ((highest - lowest) / avgPrice) * 100
    
    // 2. Calculate weekly movements
    const weeklyMoves = []
    for (let i = 1; i < recentCandles.closes.length; i++) {
      const move = Math.abs(recentCandles.closes[i] - recentCandles.closes[i-1])
      weeklyMoves.push((move / recentCandles.closes[i]) * 100)
    }
    const avgWeeklyMove = weeklyMoves.reduce((sum, move) => sum + move, 0) / weeklyMoves.length
    
    // 3. Simple checks for consolidation
    
    // Check 1: Range should be between 3-12% for weekly timeframe
    const hasReasonableRange = totalRangePercent >= 3 && totalRangePercent <= 12
    
    // Check 2: Average weekly movement should be under 4%
    const hasModerateMovement = avgWeeklyMove <= 4
    
    // Check 3: Price should not be making consecutive higher highs or lower lows
    let hasDirectionalBias = true
    let consecutiveUp = 0
    let consecutiveDown = 0
    
    for (let i = 1; i < recentCandles.closes.length; i++) {
      if (recentCandles.closes[i] > recentCandles.closes[i-1]) {
        consecutiveUp++
        consecutiveDown = 0
      } else {
        consecutiveDown++
        consecutiveUp = 0
      }
    }
    
    if (consecutiveUp < 3 && consecutiveDown < 3) {
      hasDirectionalBias = false
    }
    
    // Only need 2 out of 3 conditions for weekly consolidation
    const conditionsMet = [
      hasReasonableRange,
      hasModerateMovement,
      !hasDirectionalBias
    ].filter(Boolean).length
    
    return conditionsMet >= 2
  }

  /** TP variation, helps change TP depending on volatility and price movement depending on whether or not the code has surpassed TP1 and
 * is about to hit TP2
 */
  static tpvariation () {
    const tp = Weekly_Nexus.tp
    const values = Weekly_Nexus.finlevs.concat(Weekly_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    const num1 = Weekly_Nexus.price
    const volval = Weekly_Functions.volatility()
    if (Weekly_Nexus.buy_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 < values[item]) {
          valdiffgreater.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Weekly_Nexus.tp
      filteredvaldiff = [...new Set(valdiffgreater)]
      for (const valuers in filteredvaldiff) {
        referenceval = closesttp - num1
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Weekly_Nexus.tp = Weekly_Functions.price + (Math.abs(Weekly_Functions.price - Weekly_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                !(Math.min(...filteredvaldiff) == Weekly_Functions.price)) {
          nexttp = Weekly_Functions.price + (Math.abs(Weekly_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Weekly_Functions.price + ((Weekly_Nexus.tp - Weekly_Functions.price) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                !(Math.min(...filteredvaldiff) == Weekly_Functions.price)) {
          nexttp = Weekly_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Weekly_Functions.price + ((Weekly_Functions.tp - Weekly_Functions.price) * 1.382)
        }
      }
    }
    if (Weekly_Nexus.sell_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 > values[item]) {
          valdiffless.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Weekly_Nexus.tp
      filteredvaldiff = [...new Set(valdiffless)]
      for (const valuers in filteredvaldiff) {
        referenceval = num1 - closesttp
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Weekly_Nexus.tp = Weekly_Functions.price - (Math.abs(Weekly_Functions.price - Weekly_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                !(Math.min(...filteredvaldiff) == Weekly_Functions.price)) {
          nexttp = Weekly_Functions.price - (Math.abs(Weekly_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Weekly_Functions.price - ((Weekly_Functions.price - Weekly_Nexus.tp) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                !(Math.min(...filteredvaldiff) == Weekly_Functions.price)) {
          nexttp = Weekly_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Weekly_Functions.price - ((Weekly_Functions.price - Weekly_Nexus.tp) * 1.382)
        }
      }
    }
    Weekly_Nexus.tptwo = nexttp
  }

  /** fibonacci levels to be added to the program...
 * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
*/
  static fib () {
    const recents = Weekly_Functions.recentHisto
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
    const currentprice = Weekly_Functions.price
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
    const extendedhistory = Weekly_Functions.extendHist
    Weekly_Functions.rejectionzones = [0, 0, 0]
    const price = Weekly_Functions.price
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
    const result = Weekly_Functions.analysis(studylist, extendedhistory, pricerange)
    return result
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis (cases, extendedhistory, pricerange) {
    Weekly_Functions.rejectionzones = [0, 0, 0]
    const histnorm = Weekly_Functions.priceHist
    const normdiff = (Math.max(...histnorm) - Math.min(...histnorm)) * 0.025
    const q = bolls.calculate({ period: 10, values: extendedhistory, stdDev: 1 })
    const h = []
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
      if (mincount > 4 || maxcount > 4) {
        rejection++
        if (fractals.length < 1) {
          fractals.push(0)
          Weekly_Functions.rejectionzones.push(fractals[0])
        } else {
          const frac = fractals[val]
          Weekly_Functions.rejectionzones.push(extendedhistory[frac])
        }
      }
    }
    if (Weekly_Functions.rejectionzones.length < 1) {
      Weekly_Functions.rejectionzones.push(Weekly_Functions.price)
    }
    if (rejection > 2) {
      return false
    } else {
      return true
    }
  }

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Weekly_Functions.overall()
    const rejects = Weekly_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Weekly_Nexus.pot_buy) {
        if (Weekly_Functions.price < val) {
          diffs.push(val - Weekly_Functions.price)
        }
      }
      if (Weekly_Nexus.pot_sell) {
        if (Weekly_Functions.price > val) {
          diffs.push(Weekly_Functions.price - val)
        }
      }
    }

    if (Math.abs(Math.min(...diffs)) < Math.abs(Weekly_Functions.price - Weekly_Nexus.tp)) {
      Weekly_Nexus.pot_buy = false
      Weekly_Nexus.pot_sell = false
      return true
    } else {
      return false
    }
  }

  /** return price */
  static getPrice () {
    return Weekly_Functions.price
  }

  /** return historical price */
  static priceHistory () {
    return Weekly_Functions.priceHist
  }

  /** find whether trend is going up or down */
  static trend () {
    const history = Weekly_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

  /** recent history, shortens history array into last 50 digits for different analyses */
  static recentHist () {
    const history = Weekly_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 50; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Weekly_Functions.recentHisto = historytwo.reverse()
  }

  /** determination of stop loss size */
  static stoploss () {
    const highs = Weekly_Functions.highs
    const lows = Weekly_Functions.lows
    const diff = []
    let totaldiff = 0
    let finaldiff = 0
    for (let variables = 0; variables < 30; variables++) {
      diff.push(Math.abs(highs[highs.length - 1 - variables] - lows[lows.length - 1 - variables]))
    }
    for (let variables = 0; variables < diff.length; variables++) {
      totaldiff += diff[variables]
    }
    if (Weekly_Functions.volatility() > 0.618) {
      finaldiff = (totaldiff / 30) * 1.382
    } else {
      finaldiff = (totaldiff / 30)
    }
    let slceil = 0
    let slfloor = 0
    let numbuy = 0
    let newsl = 0
    if (Weekly_Nexus.pot_buy) {
      const diffprice = Weekly_Functions.price - finaldiff
      if (!Number.isFinite(Weekly_Functions.closesttwo(diffprice)[0])) {
        slfloor = Weekly_Functions.price - (finaldiff * 3.618)
        newsl = slfloor
      } else {
        numbuy = Weekly_Functions.closesttwo(diffprice)[0]
        if (!Number.isFinite(Weekly_Functions.closesttwo(numbuy)[0])) {
          newsl = diffprice - (0.786 * (diffprice - numbuy))
        } else {
          slfloor = (Weekly_Functions.price - ((Weekly_Functions.price - Weekly_Functions.closesttwo(numbuy)[0]) * 1.618 * 0.786))
          newsl = slfloor
        }
      }
      Weekly_Nexus.sl = newsl
    } if (Weekly_Nexus.pot_sell) {
      const diffprice = finaldiff + Weekly_Functions.price
      if (!Number.isFinite(Weekly_Functions.closesttwo(diffprice)[1])) {
        slceil = Weekly_Functions.price + (finaldiff * 3.618)
        newsl = slceil
      } else {
        numbuy = Weekly_Functions.closesttwo(diffprice)[1]
        if (!Number.isFinite(Weekly_Functions.closesttwo(numbuy)[1])) {
          newsl = diffprice + (0.786 * (numbuy - diffprice))
        } else {
          slceil = (Weekly_Functions.price + ((Math.abs(Weekly_Functions.price - Weekly_Functions.closesttwo(numbuy)[1])) * 1.618 * 0.786))
          newsl = slceil
        }
      }
      Weekly_Nexus.sl = newsl
    }
    return finaldiff
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closesttwo (num1) {
    const values = Weekly_Nexus.finlevs.concat(Weekly_Nexus.biggersupres)
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
    const closestbelow = Weekly_Functions.price - Math.min(...valdiffless)
    const closestabove = Weekly_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return closests
  }

  /** price zones, meant to determine whether a price zone has been found or not */
  static priceZones () {
    Weekly_Functions.supreslevs()
    if (Math.abs((Weekly_Functions.pipCountBuy(Weekly_Functions.price, Weekly_Nexus.resistance))
    ) / (Math.abs(Weekly_Functions.pipCountBuy(Math.max(...Weekly_Functions.priceHist), Math.min(...Weekly_Functions.priceHist)))) < 0.1) {
      return true
    } else if (Math.abs((Weekly_Functions.pipCountBuy(Weekly_Functions.price, Weekly_Nexus.support))
    ) / (Math.abs(Weekly_Functions.pipCountBuy(Math.max(...Weekly_Functions.priceHist), Math.min(...Weekly_Functions.priceHist)))) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** keylev, meant to determine the closest keylevel to the current price */
  static keylev () {
    Weekly_Functions.getPrice()
    if (Weekly_Functions.valdiff(Weekly_Functions.price, Weekly_Functions.closest(Weekly_Functions.price)) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** volatility, meant to determine whether or not price movement is too volatile for current parameters */
  static volatility () {
    const history = Weekly_Functions.priceHist
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
    const factor = Weekly_Functions.volatility()
    const history = Weekly_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const diffy = ceiling - floor
    const posdiff = Math.abs(Weekly_Nexus.posprice - Weekly_Functions.price)
    const deci = posdiff / diffy
    const input = deci * 6.18
    const equation = (1 - factor) * (((input * input) + input) / ((input * input) + input + 1))
    return equation
  }

  /**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
  static priceChannels () {
    const rvalues = Weekly_Functions.regression()
    if ((rvalues[0] * rvalues[0]) > 0.8 && (rvalues[1] * rvalues[1]) > 0.8) {
      return true
    } else {
      return false
    }
  }

  /** used to determine relative maxes and mins for identification of price channels */
  static maxes_mins () {
    Weekly_Functions.recentHist()
    const recentHistory = Weekly_Functions.recentHisto
    const slope = Weekly_Functions.slopes()
    const maxes = []
    const mins = []
    for (let value = 3; value < slope.length - 2; value++) {
      if (slope[value - 1] > 0 && slope[value] < 0) {
        if (slope[value - 2] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) } else if (slope[value - 3] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) }
      } else if (slope[value - 1] < 0 && slope[value] > 0) {
        if (slope[value - 2] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) } else if (slope[value - 3] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) }
      }
    }
    Weekly_Functions.maxes = maxes
    Weekly_Functions.mins = mins
  }

  /** used to determine regression lines (moving averages, for example) */
  static regression () {
    Weekly_Functions.maxes_mins()
    const x = []
    const length = Weekly_Functions.maxes.length
    for (let value = 0; value < length; value++) { x.push(value) }
    const y = Weekly_Functions.maxes
    const regressions = new regression.SimpleLinearRegression(x, y)
    const xtwo = []
    const lengthtwo = Weekly_Functions.mins.length
    for (let value = 0; value < lengthtwo; value++) { xtwo.push(value) }
    const ytwo = Weekly_Functions.mins
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
    const history = Weekly_Functions.priceHist
    const price = Weekly_Functions.getPrice()
    
    // Calculate price range and normalize
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const difference = ceiling - floor
    const avgPrice = history.reduce((sum, p) => sum + p, 0) / history.length
    
    // Normalize price levels for easier clustering
    const normalizedLevels = history.map(price => ((price - floor) / difference).toFixed(3))
    
    // Find repeated price levels that indicate support/resistance
    const levelFrequency = {}
    normalizedLevels.forEach(level => {
      levelFrequency[level] = (levelFrequency[level] || 0) + 1
    })
    
    // Filter levels with sufficient frequency (higher threshold for weekly)
    const significantLevels = Object.keys(levelFrequency)
      .filter(level => levelFrequency[level] >= 3)
      .map(level => parseFloat(level))
    
    // Convert normalized levels back to actual prices
    const finalLevels = significantLevels.map(level => (level * difference) + floor)
    
    // Separate levels above and below current price
    const levelsBelow = finalLevels.filter(level => level < price)
    const levelsAbove = finalLevels.filter(level => level > price)
    
    // Filter levels that are too close to price (within 0.5% for weekly)
    const minimumDistance = avgPrice * 0.005
    const significantLevelsBelow = levelsBelow.filter(level => 
      price - level > minimumDistance)
    const significantLevelsAbove = levelsAbove.filter(level => 
      level - price > minimumDistance)
    
    // Additional filter for levels that are too close to each other
    const filteredLevelsBelow = Weekly_Functions.filterCloseValues(significantLevelsBelow, minimumDistance * 2)
    const filteredLevelsAbove = Weekly_Functions.filterCloseValues(significantLevelsAbove, minimumDistance * 2)
    
    // Calculate distances to find closest levels
    const belowDistances = filteredLevelsBelow.map(level => price - level)
    const aboveDistances = filteredLevelsAbove.map(level => level - price)
    
    // Determine support and resistance
    let support, resistance
    
    // Find support - closest significant level below
    if (belowDistances.length > 0) {
      const minBelowDistance = Math.min(...belowDistances)
      const minBelowIndex = belowDistances.indexOf(minBelowDistance)
      support = filteredLevelsBelow[minBelowIndex]
    } else {
      // Fallback: use dynamic calculation based on ATR
      const atrValue = Weekly_Functions.calculateATR(history.slice(-15), 14) || difference * 0.03
      support = price - (atrValue * 1.5)
    }
    
    // Find resistance - closest significant level above
    if (aboveDistances.length > 0) {
      const minAboveDistance = Math.min(...aboveDistances)
      const minAboveIndex = aboveDistances.indexOf(minAboveDistance)
      resistance = filteredLevelsAbove[minAboveIndex]
    } else {
      // Fallback: use dynamic calculation based on ATR
      const atrValue = Weekly_Functions.calculateATR(history.slice(-15), 14) || difference * 0.03
      resistance = price + (atrValue * 1.5)
    }
    
    // Set values for use in trading system
    Weekly_Nexus.support = support
    Weekly_Nexus.resistance = resistance
    Weekly_Nexus.finlevs = finalLevels
  }
  
  /**
   * Helper function to filter out values that are too close to each other
   * @param {number[]} values - Array of price values to filter
   * @param {number} minDistance - Minimum distance between values
   * @return {number[]} Filtered array with sufficiently spaced values
   */
  static filterCloseValues(values, minDistance) {
    if (values.length <= 1) return values
    
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b)
    const result = [sortedValues[0]]
    
    for (let i = 1; i < sortedValues.length; i++) {
      if (sortedValues[i] - result[result.length - 1] >= minDistance) {
        result.push(sortedValues[i])
      }
    }
    
    return result
  }
  
  /**
   * Helper function to calculate Average True Range
   * @param {number[]} prices - Array of prices
   * @param {number} period - Period for ATR calculation
   * @return {number} ATR value
   */
  static calculateATR(prices, period = 14) {
    if (prices.length < period + 1) return null
    
    // Calculate True Ranges
    const trueRanges = []
    for (let i = 1; i < prices.length; i++) {
      trueRanges.push(Math.abs(prices[i] - prices[i-1]))
    }
    
    // Calculate simple moving average of true ranges
    const atr = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period
    return atr
  }

  /** self explanatory, finds RSI and compares the last two */
  static rsi () {
    const history = Weekly_Functions.priceHist
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
    const history = Weekly_Functions.priceHist
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
    const history = Weekly_Functions.priceHist
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
    const history = Weekly_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** new indicator mix that finds EMAS of RSI and compares the last two values */
  static obv () {
    const history = Weekly_Functions.priceHist
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

  /** pip converter */
  static pipreverse (num, num2) {
    if (String(num).indexOf('.') == 2) {
      Weekly_Functions.multiplier = 0.001
    } else if (String(num).indexOf('.') == 3) {
      Weekly_Functions.multiplier = 0.01
    } else if (String(num).indexOf('.') == 4) {
      Weekly_Functions.multiplier = 0.1
    } else if (String(num).indexOf('.') == 5) {
      Weekly_Functions.multiplier = 1
    } else if (String(num).indexOf('.') == 5) {
      Weekly_Functions.multiplier = 10
    } else if (String(num).indexOf('.') == 6) {
      Weekly_Functions.multiplier = 100
    } else if (String(num).indexOf('.') == 7) {
      Weekly_Functions.multiplier = 1000
    } else if (String(num).indexOf('.') == 8) {
      Weekly_Functions.multiplier = 10000
    } else if (String(num).indexOf('.') == 9) {
      Weekly_Functions.multiplier = 100000
    } else if (String(num).indexOf('.') == 10) {
      Weekly_Functions.multiplier = 1000000
    } else { Weekly_Functions.multiplier = 0.0001 }
    num2 *= Weekly_Functions.multiplier
    return (num2)
  }

  static instrument_switcher (instrument) {
  }

  /* sets value difference as a decimal-percentage of floor to ceiling */
  /** gets value difference for normalization of data points */
  static valdiff (num1, num2) {
    const history = Weekly_Functions.priceHist
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
      Weekly_Functions.multiplier = 1000
    } else if (String(price).indexOf('.') == 3) {
      Weekly_Functions.multiplier = 100
    } else if (String(price).indexOf('.') == 4) {
      Weekly_Functions.multiplier = 10
    } else if (String(price).indexOf('.') == 5) {
      Weekly_Functions.multiplier = 1
    } else if (String(price).indexOf('.') == 5) {
      Weekly_Functions.multiplier = 0.1
    } else if (String(price).indexOf('.') == 6) {
      Weekly_Functions.multiplier = 0.01
    } else if (String(price).indexOf('.') == 7) {
      Weekly_Functions.multiplier = 0.001
    } else if (String(price).indexOf('.') == 8) {
      Weekly_Functions.multiplier = 0.0001
    } else if (String(price).indexOf('.') == 9) {
      Weekly_Functions.multiplier = 0.00001
    } else if (String(price).indexOf('.') == 10) {
      Weekly_Functions.multiplier = 0.000001
    } else {
      Weekly_Functions.multiplier = 10000
    }
    return num1 * Weekly_Functions.multiplier
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closest (num1) {
    const values = Weekly_Nexus.finlevs.concat(Weekly_Nexus.biggersupres)
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
    const closestbelow = Weekly_Functions.price - Math.min(...valdiffless)
    const closestabove = Weekly_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return Math.min(...closests)
  }

  /** Counts pips between two values for buying */
  static pipCountBuy (num1, num2) {
    let nums
    nums = Weekly_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }

  /** Counts pips between two values for selling */
  static pipCountSell (num1, num2) {
    let nums
    nums = Weekly_Functions.pip(num1, num2)
    return (nums[0] - nums[1])
  }


  

  static calculateStdDev(prices, period = 20) {
    if (prices.length < period) return null
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / period 
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period
    return Math.sqrt(variance)
  }

  /** Machine learning method for weekly timeframe used to determine past movement patterns to support supreslevs */
  static overall() {
    // Get price history data
    const extendedhistory = Weekly_Functions.extendHist
    const price = Weekly_Functions.price
    
    // Get levels from multiple timeframes for more robust analysis
    const dailyLevels = Daily_Functions.finlevs
    const weeklyLevels = Weekly_Nexus.finlevs
    const keyLevels = [...dailyLevels, ...weeklyLevels]
    
    // Calculate volatility for dynamic buffer adjustment
    const volatility = Weekly_Functions.volatility ? Weekly_Functions.volatility() : 0.05
    
    // Calculate price range and buffer
    const priceRange = Math.max(...extendedhistory) - Math.min(...extendedhistory)
    const buffer = priceRange * Math.max(0.03, Math.min(0.08, volatility))
    
    // Define price range for historical analysis
    const lower = price - buffer
    const upper = price + buffer
    const pricerange = [lower, upper]
    
    // Find historical instances at similar price levels
    const studylist = []
    for (let val = 0; val < extendedhistory.length; val++) {
      if (extendedhistory[val] <= upper && extendedhistory[val] >= lower) {
        studylist.push([val, extendedhistory[val]])
      }
    }
    
    // Check if price is near a key support/resistance level
    let keyLevelProximity = false
    for (const level of keyLevels) {
      const distance = Math.abs(price - level) / price
      if (distance < 0.003) { // Within 0.3%
        keyLevelProximity = true
        break
      }
    }
    
    // Too little data for reliable analysis
    if (studylist.length < 5) {
      return !keyLevelProximity // Allow trades near but not at key levels
    }
    
    // Perform detailed historical analysis
    const result = Weekly_Functions.analysis(
      studylist, 
      extendedhistory, 
      pricerange
    )
    
    // Return false if near key level AND analysis indicates a rejection zone
    return result && !keyLevelProximity
  }

  /** Enhanced analysis method for weekly timeframe */
  static analysis(cases, extendedhistory, pricerange) {
    // Initialize rejection zones array
    Weekly_Functions.rejectionzones = []
    
    // Get current price and price history
    const price = Weekly_Functions.price
    const histnorm = Weekly_Functions.priceHist
    
    // Calculate standard deviation for dynamic thresholds
    const priceStdDev = Weekly_Functions.calculateStdDev ? 
      Weekly_Functions.calculateStdDev(extendedhistory.slice(-50)) : 
      (Math.max(...histnorm) - Math.min(...histnorm)) * 0.025
    
    // Calculate Bollinger Bands for volatility reference
    const bollingerBands = bolls.calculate({ 
      period: 20, 
      values: extendedhistory, 
      stdDev: 2 
    })
    
    // Extract band values
    const lowerBands = bollingerBands.map(band => band.lower)
    const upperBands = bollingerBands.map(band => band.upper)
    const middleBands = bollingerBands.map(band => band.middle)
    
    // Calculate smoothed versions for trend detection
    const smoothedLower = smas.calculate({ period: 10, values: lowerBands })
    const smoothedUpper = smas.calculate({ period: 10, values: upperBands })
    const smoothedMiddle = smas.calculate({ period: 10, values: middleBands })
    
    // Define rejection threshold
    const rejectionThreshold = 4
    
    // Define volatility based threshold adjustment
    const volAdjustment = Weekly_Functions.volatility ? 
      Math.max(0.8, Math.min(1.2, Weekly_Functions.volatility() * 10)) : 
      1.0
    
    // Track rejection zones
    const rejectionZones = []
    let rejection = 0
    
    // Extract indices from cases for analysis
    const potentialRejectionPoints = cases.map(c => c[0])
    
    // Analyze potential rejection points
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
          Math.abs(postBehavior) > priceStdDev * 0.5) {
        rejectionEvidence += 1.5
      }
      
      // Pattern 3: Proximity to Bollinger Band
      if (idx < upperBands.length && idx < lowerBands.length) {
        const bandProximity = Math.min(
          Math.abs(extendedhistory[idx] - upperBands[idx]), 
          Math.abs(extendedhistory[idx] - lowerBands[idx])
        )
        
        if (bandProximity < priceStdDev * 0.5) {
          rejectionEvidence += 1
        }
      }
      
      // Pattern 4: Candlestick patterns if available
      const highsAvailable = typeof highs !== 'undefined' && highs && highs.length > idx
      const lowsAvailable = typeof lows !== 'undefined' && lows && lows.length > idx
      
      if (highsAvailable && lowsAvailable) {
        const highLowRange = highs[idx] - lows[idx]
        const bodySize = Math.abs(extendedhistory[idx] - extendedhistory[idx-1])
        
        // Detect potential doji, hammer, or shooting star
        if (highLowRange > bodySize * 2) {
          rejectionEvidence += 1
        }
      }
      
      // Pattern 5: Check for confluence with key levels from multiple timeframes
      const currentPrice = extendedhistory[idx]
      if (typeof keyLevels !== 'undefined' && keyLevels) {
        for (const level of keyLevels) {
          const distancePercent = Math.abs(currentPrice - level) / currentPrice
          if (distancePercent < 0.005) { // Within 0.5%
            rejectionEvidence += 1.5
            break
          }
        }
      }
      
      // Adjust evidence by volatility
      rejectionEvidence *= volAdjustment
      
      // If enough evidence found, mark as rejection zone
      if (rejectionEvidence >= rejectionThreshold) {
        rejection++
        rejectionZones.push(extendedhistory[idx])
        Weekly_Functions.rejectionzones.push(extendedhistory[idx])
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
    for (const zone of Weekly_Functions.rejectionzones) {
      if (Math.abs(price - zone) < rejectionProximityThreshold) {
        nearRejectionZone = true
        break
      }
    }
    
    // Too many rejection zones or too close to one - not good for trading
    return !(rejection > 2 || nearRejectionZone)
  }

  static consolidationtwo () {
    const history = Weekly_Functions.priceHist
    const highs = Weekly_Functions.highs
    const lows = Weekly_Functions.lows
    
    // Ensure we have enough data for weekly timeframe
    const minDataPoints = 12 // Minimum 12 weeks of data
    if (history.length < minDataPoints || !highs.length || !lows.length) {
      return false; // Changed to false - don't assume consolidation without enough data
    }
    
    // Normalize all arrays to same length (use recent data)
    const lookbackPeriod = Math.min(52, history.length) // Look back up to 1 year
    const recentHistory = history.slice(-lookbackPeriod)
    const recentHighs = highs.slice(-lookbackPeriod)
    const recentLows = lows.slice(-lookbackPeriod)
    
    // APPROACH 1: Weekly Range Analysis
    const weeklyRanges = recentHighs.map((high, i) => high - recentLows[i])
    const avgWeeklyRange = weeklyRanges.reduce((sum, range) => sum + range, 0) / weeklyRanges.length
    const recentRanges = weeklyRanges.slice(-4) // Last month of weekly ranges
    const avgRecentRange = recentRanges.reduce((sum, range) => sum + range, 0) / recentRanges.length
    
    // Compare recent ranges to historical
    const rangeRatio = avgRecentRange / avgWeeklyRange
    const isRangeContracting = rangeRatio < 0.85 // Recent ranges are significantly smaller
    
    // APPROACH 2: Price Movement Analysis
    const priceChanges = []
    for (let i = 1; i < recentHistory.length; i++) {
      const weeklyChange = Math.abs(recentHistory[i] - recentHistory[i-1])
      priceChanges.push(weeklyChange)
    }
    
    const avgHistoricalChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length
    const recentChanges = priceChanges.slice(-4)
    const avgRecentChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length
    
    const isLowVolatility = avgRecentChange < (avgHistoricalChange * 0.7)
    
    // APPROACH 3: Higher Highs / Lower Lows Analysis
    let consecutiveCount = 0
    const lastFourHighs = recentHighs.slice(-4)
    const lastFourLows = recentLows.slice(-4)
    
    for (let i = 1; i < 4; i++) {
      if (lastFourHighs[i] > lastFourHighs[i-1] && lastFourLows[i] > lastFourLows[i-1]) {
        consecutiveCount++
      } else if (lastFourHighs[i] < lastFourHighs[i-1] && lastFourLows[i] < lastFourLows[i-1]) {
        consecutiveCount++
      }
    }
    
    const hasStrongTrend = consecutiveCount >= 2
    
    // APPROACH 4: Price Channel Width
    const highestHigh = Math.max(...lastFourHighs)
    const lowestLow = Math.min(...lastFourLows)
    const channelWidth = highestHigh - lowestLow
    const avgPrice = recentHistory.reduce((sum, price) => sum + price, 0) / recentHistory.length
    const normalizedChannelWidth = channelWidth / avgPrice
    
    const isNarrowChannel = normalizedChannelWidth < 0.04 // 4% channel width for weekly
    
    // Scoring System
    let consolidationScore = 0
    let totalFactors = 4 // Total number of main factors we're checking
    
    if (isRangeContracting) consolidationScore++
    if (isLowVolatility) consolidationScore++
    if (!hasStrongTrend) consolidationScore++
    if (isNarrowChannel) consolidationScore++
    
    // Calculate probability - require at least 75% of factors to indicate consolidation
    return (consolidationScore / totalFactors) >= 0.75
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
  highs = []
  lows = []
  support = 0
  resistance = 0
  finlevs = []

  static HistoryAssigner () {
    const instrument = Weekly_Functions.instrument_name()
    Daily_Functions.priceHist = dataset.Daily.c
    Daily_Functions.highs = dataset.Daily.h
    Daily_Functions.lows = dataset.Daily.l
  }

  static trend () {
    const history = Daily_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

    /** finds support and resistance levels, very important for code function, would love to improve this */
    static supreslevs () {
      const history = Weekly_Functions.priceHist
      const price = Weekly_Functions.getPrice()
      
      // Calculate price range and normalize
      const ceiling = Math.max(...history)
      const floor = Math.min(...history)
      const difference = ceiling - floor
      const avgPrice = history.reduce((sum, p) => sum + p, 0) / history.length
      
      // Normalize price levels for easier clustering
      const normalizedLevels = history.map(price => ((price - floor) / difference).toFixed(3))
      
      // Find repeated price levels that indicate support/resistance
      const levelFrequency = {}
      normalizedLevels.forEach(level => {
        levelFrequency[level] = (levelFrequency[level] || 0) + 1
      })
      
      // Filter levels with sufficient frequency (higher threshold for weekly)
      const significantLevels = Object.keys(levelFrequency)
        .filter(level => levelFrequency[level] >= 3)
        .map(level => parseFloat(level))
      
      // Convert normalized levels back to actual prices
      const finalLevels = significantLevels.map(level => (level * difference) + floor)
      
      // Separate levels above and below current price
      const levelsBelow = finalLevels.filter(level => level < price)
      const levelsAbove = finalLevels.filter(level => level > price)
      
      // Filter levels that are too close to price (within 0.5% for weekly)
      const minimumDistance = avgPrice * 0.005
      const significantLevelsBelow = levelsBelow.filter(level => 
        price - level > minimumDistance)
      const significantLevelsAbove = levelsAbove.filter(level => 
        level - price > minimumDistance)
      
      // Additional filter for levels that are too close to each other
      const filteredLevelsBelow = Weekly_Functions.filterCloseValues(significantLevelsBelow, minimumDistance * 2)
      const filteredLevelsAbove = Weekly_Functions.filterCloseValues(significantLevelsAbove, minimumDistance * 2)
      
      // Calculate distances to find closest levels
      const belowDistances = filteredLevelsBelow.map(level => price - level)
      const aboveDistances = filteredLevelsAbove.map(level => level - price)
      
      // Determine support and resistance
      let support, resistance
      
      // Find support - closest significant level below
      if (belowDistances.length > 0) {
        const minBelowDistance = Math.min(...belowDistances)
        const minBelowIndex = belowDistances.indexOf(minBelowDistance)
        support = filteredLevelsBelow[minBelowIndex]
      } else {
        // Fallback: use dynamic calculation based on ATR
        const atrValue = Weekly_Functions.calculateATR(history.slice(-15), 14) || difference * 0.03
        support = price - (atrValue * 1.5)
      }
      
      // Find resistance - closest significant level above
      if (aboveDistances.length > 0) {
        const minAboveDistance = Math.min(...aboveDistances)
        const minAboveIndex = aboveDistances.indexOf(minAboveDistance)
        resistance = filteredLevelsAbove[minAboveIndex]
      } else {
        // Fallback: use dynamic calculation based on ATR
        const atrValue = Weekly_Functions.calculateATR(history.slice(-15), 14) || difference * 0.03
        resistance = price + (atrValue * 1.5)
      }
      
      // Set values for use in trading system
      Daily_Functions.support = support
      Daily_Functions.resistance = resistance
      Daily_Functions.finlevs = finalLevels
    }

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

  static ema () {
    const history = Daily_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

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
}

class One_Hour_Functions {
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
    const instrument = Weekly_Functions.instrument_name()
    One_Hour_Functions.priceHist = dataset.One_Hour.c
    One_Hour_Functions.highs = dataset.One_Hour.h
    One_Hour_Functions.lows = dataset.One_Hour.l
  }

  static consolidationtwo () {
    const history = One_Hour_Functions.priceHist
    const highs = One_Hour_Functions.highs 
    const lows = One_Hour_Functions.lows 
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
    const instrument = Weekly_Functions.instrument_name()
    Thirty_Min_Functions.priceHist = dataset.Thirty_Min.c
    Thirty_Min_Functions.highs = dataset.Thirty_Min.h
    Thirty_Min_Functions.lows = dataset.Thirty_Min.l
  }

  static consolidationtwo () {
    const history = Thirty_Min_Functions.priceHist
    const highs = Thirty_Min_Functions.highs 
    const lows = Thirty_Min_Functions.lows 
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

  static trend () {
    const history = Thirty_Min_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
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

function testweekly (data, price, instrument) {
  instrum = instrument;
  liveprice = price;
  // Assign to the global dataset variable
  dataset = data;
  Weekly_Nexus.controlMain();
  
  // If we have a potential buy signal
  if (Weekly_Nexus.pot_buy && !Weekly_Nexus.buy_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Weekly_Functions.supreslevs();
    Weekly_Functions.getPrice();
    Weekly_Functions.stoploss();
    Weekly_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Weekly_Nexus.sl.toFixed(5);
    const formattedTP = Weekly_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[Weekly] BUY SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('BUY', instrument, formattedSL, formattedTP, 0.06, 'Weekly algorithm signal', 'Weekly');
  }
  
  // If we have a potential sell signal
  if (Weekly_Nexus.pot_sell && !Weekly_Nexus.sell_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Weekly_Functions.supreslevs();
    Weekly_Functions.getPrice();
    Weekly_Functions.stoploss();
    Weekly_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Weekly_Nexus.sl.toFixed(5);
    const formattedTP = Weekly_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[Weekly] SELL SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('SELL', instrument, formattedSL, formattedTP, 0.06, 'Weekly algorithm signal', 'Weekly');
  }
}

module.exports = {
  testweekly
};
