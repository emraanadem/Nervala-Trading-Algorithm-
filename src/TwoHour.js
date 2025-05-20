const fs = require('fs');
const regression = require('ml-regression-simple-linear');
const { EMA: emas, RSI: rsis, MACD: macds, ROC: rocs, BollingerBands: bolls, SMA: smas, ATR: tr } = require('technicalindicators');
const { createModel } = require('polynomial-regression');
const nerdamer = require('nerdamer/all.min.js');
const roots = require('kld-polynomial');
const { sendSignal } = require('./metatrader-connector.js');

// At the top of the file after imports
let instrum = '';
var dataset = {};
var liveprice = 0;

class Two_Hour_Nexus {
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
  backtest = false

  /** announce price zones and price channels */
  static announcer () {
    if (Two_Hour_Nexus.pzone == false && Two_Hour_Functions.priceZones() == true) {
      Two_Hour_Nexus.pzone = true
      console.log('Price Zone Identified')
    } if (Two_Hour_Nexus.pzone == true && Two_Hour_Functions.priceZones() == false) {
      Two_Hour_Nexus.pzone = false
    } if (Two_Hour_Nexus.pchan == false && Two_Hour_Functions.priceChannels() == true) {
      Two_Hour_Nexus.pchan = true
      console.log('Price Channel Identified')
    } if (Two_Hour_Nexus.pchan == true && Two_Hour_Functions.priceChannels() == false) {
      Two_Hour_Nexus.pchan = false
    }
  }

  /** stop loss for buys */
  static stopLossBuy () {
    if (Two_Hour_Functions.price <= Two_Hour_Nexus.sl) {
      Two_Hour_Nexus.closePosSL()
    }
  }

  /** stop loss for selling */
  static stopLossSell () {
    if (Two_Hour_Functions.price >= Two_Hour_Nexus.sl) {
      Two_Hour_Nexus.closePosSL()
    }
  }

  /** initiates the piplog for pipcounting */
  static piploginit () {
    Two_Hour_Nexus.piplog = [0, 0, 0]
  }

  /** pip logging method */
  static piplogger () {
    const piplogging = Two_Hour_Nexus.piplog
    if (Two_Hour_Nexus.buy_pos) {
      piplogging.push(Two_Hour_Functions.pipCountBuy(Two_Hour_Nexus.posprice, Two_Hour_Functions.price))
      Two_Hour_Nexus.bigpipprice = Math.max(...piplogging)
      Two_Hour_Nexus.piplog = piplogging
    }
    if (Two_Hour_Nexus.sell_pos) {
      piplogging.push(Two_Hour_Functions.pipCountSell(Two_Hour_Nexus.posprice, Two_Hour_Functions.price))
      Two_Hour_Nexus.bigpipprice = Math.max(...piplogging)
      Two_Hour_Nexus.piplog = piplogging
    }
  }

  /** take profit for buying */
  static takeProfitBuy () {
    if (Two_Hour_Functions.price >= Two_Hour_Nexus.tp) {
      if (Two_Hour_Functions.volatility() > 0.618) {
        if ((Two_Hour_Functions.price - Two_Hour_Nexus.tp) > (Two_Hour_Nexus.tp - Two_Hour_Nexus.tstoploss)) {
          if (Two_Hour_Nexus.tp < Two_Hour_Nexus.tptwo) {
            Two_Hour_Nexus.piploginit()
            Two_Hour_Nexus.posprice = Two_Hour_Nexus.tp
            Two_Hour_Nexus.tp = Two_Hour_Nexus.tptwo
            Two_Hour_Functions.tpvariation()
            console.log('pair: ' + Two_Hour_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Two_Hour_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Two_Hour_Nexus.tptwo))
          }
        }
      } else {
        Two_Hour_Nexus.closePosTP()
      }
    } else if (Two_Hour_Functions.price <= Two_Hour_Nexus.tstoploss) {
      Two_Hour_Nexus.closePosTP()
    } else if (Two_Hour_Functions.price == Two_Hour_Nexus.tptwo) {
      Two_Hour_Nexus.closePosTP()
    }
  }

  /** take profit for selling */
  static takeProfitSell () {
    if (Two_Hour_Functions.price <= Two_Hour_Nexus.tp) {
      if (Two_Hour_Functions.volatility() > 0.618) {
        if ((Two_Hour_Nexus.tp - Two_Hour_Functions.price) > (Two_Hour_Nexus.tstoploss - Two_Hour_Nexus.tp)) {
          if (Two_Hour_Nexus.tp < Two_Hour_Nexus.tptwo) {
            Two_Hour_Nexus.piploginit()
            Two_Hour_Nexus.posprice = Two_Hour_Nexus.tp
            Two_Hour_Nexus.tp = Two_Hour_Nexus.tptwo
            Two_Hour_Functions.tpvariation()
            console.log('pair: ' + Two_Hour_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Two_Hour_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Two_Hour_Nexus.tptwo))
          }
        }
      } else {
        Two_Hour_Nexus.closePosTP()
      }
    } else if (Two_Hour_Functions.price >= Two_Hour_Nexus.tstoploss) {
      Two_Hour_Nexus.closePosTP()
    } else if (Two_Hour_Functions.price == Two_Hour_Nexus.tptwo) {
      Two_Hour_Nexus.closePosTP()
    }
  }

  /** stop loss defining method */
  static stoplossdef () {
    const stoploss = Two_Hour_Functions.stoploss()
    if (Two_Hour_Nexus.buy_pos) {
      Two_Hour_Nexus.sl = Two_Hour_Functions.price - stoploss
    }
    if (Two_Hour_Nexus.sell_pos) {
      Two_Hour_Nexus.sl = Two_Hour_Functions.price + stoploss
    }
  }

  /** define volatility for the system, tells me whether or not to alter trailing stop loss */
  static volatilitydef () {
    if (Two_Hour_Functions.volatility() > 0.618 && Two_Hour_Nexus.tstoplossinits && !Two_Hour_Nexus.tstoplossvoid) {
      Two_Hour_Nexus.tstoplossdefvol()
    }
  }

  /** initiate trailing stop loss */
  static tstoplossinit () {
    const stoploss = Two_Hour_Nexus.sldiff
    if (!Two_Hour_Nexus.tstop && !Two_Hour_Nexus.tstoplossinits && !Two_Hour_Nexus.tstoplossvoid) {
      if (Two_Hour_Nexus.buy_pos) {
        if (Two_Hour_Functions.price > Two_Hour_Nexus.posprice + 0.3 * stoploss) {
          Two_Hour_Nexus.tstoplossinits = true
          Two_Hour_Nexus.tstoplossdef()
        }
      }
      if (Two_Hour_Nexus.sell_pos) {
        if (Two_Hour_Functions.price < Two_Hour_Nexus.posprice - 0.3 * stoploss) {
          Two_Hour_Nexus.tstoplossinits = true
          Two_Hour_Nexus.tstoplossdef()
        }
      }
    }
  }

  /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
  static tstoplossdefvol () {
    Two_Hour_Nexus.sldiff = Two_Hour_Functions.stoploss()
    const stoploss = Two_Hour_Nexus.sldiff
    if (Two_Hour_Nexus.buy_pos) {
      if (Two_Hour_Functions.price > Two_Hour_Nexus.posprice + 0.3 * stoploss) {
        Two_Hour_Nexus.tstop = true
        Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice + (((Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.posprice)) * (Two_Hour_Functions.trailingsl())))
      }
    }
    if (Two_Hour_Nexus.sell_pos) {
      if (Two_Hour_Functions.price < Two_Hour_Nexus.posprice - 0.3 * stoploss) {
        Two_Hour_Nexus.tstop = true
        Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice - (((Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.posprice)) * (Two_Hour_Functions.trailingsl())))
      }
    }
  }

  /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility */
  static tstoplosscheck () {
    const tstoploss = Two_Hour_Nexus.sldiff
    if (Two_Hour_Nexus.buy_pos) {
      if (Two_Hour_Functions.price < Two_Hour_Nexus.posprice + 0.3 * tstoploss) {
        Two_Hour_Nexus.tstoplossvoid = true
      } else {
        Two_Hour_Nexus.tstoplossvoid = false
        Two_Hour_Nexus.volatilitydef()
        Two_Hour_Nexus.tstoplossinit()
      }
    }
    if (Two_Hour_Nexus.sell_pos) {
      if (Two_Hour_Functions.price > Two_Hour_Nexus.posprice - 0.3 * tstoploss) {
        Two_Hour_Nexus.tstoplossvoid = true
      } else {
        Two_Hour_Nexus.tstoplossvoid = false
        Two_Hour_Nexus.volatilitydef()
        Two_Hour_Nexus.tstoplossinit()
      }
    }
  }

  /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
  static tstoplosscont () {
    if (Two_Hour_Functions.volatility() < 0.618 && Two_Hour_Nexus.tstoplossinits && !Two_Hour_Nexus.tstoplossvoid) {
      Two_Hour_Nexus.sldiff = Two_Hour_Functions.stoploss()
      const stoploss = Two_Hour_Nexus.sldiff
      if (Two_Hour_Nexus.buy_pos) {
        if (Two_Hour_Functions.price > Two_Hour_Nexus.posprice + 0.3 * stoploss) {
          Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice + Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, 0.618 * Two_Hour_Nexus.bigpipprice)
        }
      }
      if (Two_Hour_Nexus.sell_pos) {
        if (Two_Hour_Functions.price < Two_Hour_Nexus.posprice - 0.3 * stoploss) {
          Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice - Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, 0.618 * Two_Hour_Nexus.bigpipprice)
        }
      }
    }
  }

  /** method that defines trailing stop loss for the system to begin with trailing stop loss */
  static tstoplossdef () {
    Two_Hour_Nexus.sldiff = Two_Hour_Functions.stoploss()
    const stoploss = Two_Hour_Nexus.sldiff
    if (Two_Hour_Nexus.buy_pos) {
      if (Two_Hour_Functions.price > Two_Hour_Nexus.posprice + 0.3 * stoploss) {
        Two_Hour_Nexus.tstop = true
        Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice + Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, 0.618 * Two_Hour_Nexus.bigpipprice)
      }
    }
    if (Two_Hour_Nexus.sell_pos) {
      if (Two_Hour_Functions.price < Two_Hour_Nexus.posprice - 0.3 * stoploss) {
        Two_Hour_Nexus.tstop = true
        Two_Hour_Nexus.tstoploss = Two_Hour_Nexus.posprice - Two_Hour_Functions.pipreverse(Two_Hour_Nexus.posprice, 0.618 * Two_Hour_Nexus.bigpipprice)
      }
    }
  }

  /* FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS! */

  /** initiates a buy signal */
  static buy () {
    Two_Hour_Functions.supreslevs()
    Two_Hour_Functions.getPrice()
    Two_Hour_Functions.stoploss()
    Two_Hour_Functions.tpvariation()
    if (!Two_Hour_Functions.rejectionzoning()) {
      if (Math.abs(Two_Hour_Functions.valdiff(Two_Hour_Functions.price, Two_Hour_Functions.closest(Two_Hour_Functions.price))) > 0.025) {
        Two_Hour_Nexus.tp = Two_Hour_Nexus.resistance
        Two_Hour_Nexus.pos = true
        Two_Hour_Nexus.buy_pos = true
        Two_Hour_Nexus.posprice = Two_Hour_Functions.price
        Two_Hour_Functions.stoploss()
        Two_Hour_Functions.tpvariation()
        console.log('pair: ' + Two_Hour_Nexus.pair)
        console.log('Open Buy Order on Two Hour')
        console.log('Entry Price: ' + String(Two_Hour_Nexus.posprice))
        console.log('Stop Loss: ' + String(Two_Hour_Nexus.sl))
        console.log('Target Take Profit: ' + String(Two_Hour_Nexus.tp))
        console.log('Take Profit 2: ' + String(Two_Hour_Nexus.tptwo))
      }
    }
    
    // Add at the end of the buy method:
    sendSignal(
      'BUY',
      Two_Hour_Nexus.pair,
      Two_Hour_Nexus.sl,
      Two_Hour_Nexus.tp,
      0.02, // Medium volume for medium timeframe
      'TwoHour'
    );
  }

  /* static buy(){
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
  static sell () {
    Two_Hour_Functions.supreslevs()
    Two_Hour_Functions.getPrice()
    Two_Hour_Functions.stoploss()
    Two_Hour_Functions.tpvariation()
    if (!Two_Hour_Functions.rejectionzoning()) {
      if (Math.abs(Two_Hour_Functions.valdiff(Two_Hour_Functions.price, Two_Hour_Functions.closest(Two_Hour_Functions.price))) > 0.025) {
        Two_Hour_Nexus.tp = Two_Hour_Nexus.support
        Two_Hour_Nexus.pos = true
        Two_Hour_Nexus.sell_pos = true
        Two_Hour_Nexus.posprice = Two_Hour_Functions.price
        Two_Hour_Functions.stoploss()
        Two_Hour_Functions.tpvariation()
        console.log('pair: ' + Two_Hour_Nexus.pair)
        console.log('Open Sell Order on Two Hour')
        console.log('Entry Price: ' + String(Two_Hour_Nexus.posprice))
        console.log('Stop Loss: ' + String(Two_Hour_Nexus.sl))
        console.log('Target Take Profit: ' + String(Two_Hour_Nexus.tp))
        console.log('Take Profit 2: ' + String(Two_Hour_Nexus.tptwo))
      }
    }
    sendSignal(
      'SELL',
      Two_Hour_Nexus.pair,
      Two_Hour_Nexus.sl,
      Two_Hour_Nexus.tp,
      0.02, // Medium volume for medium timeframe
      'TwoHour'
    );
  }

  /* static sell(){
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
        } */

  /** checks for price movement in lower periods to get better idea of the trend */
  static controlSmallerPeriod () {
    try {
      /* Confirm Trend w/ indicators and price movement */
      One_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.HistoryAssigner()
      Daily_Functions.HistoryAssigner()
      Fifteen_Min_Functions.HistoryAssigner()
      Two_Hour_Functions.stoploss()
      Two_Hour_Functions.tpvariation()
      let buy = false
      let sell = false
      if (!Four_Hour_Functions.rejectionzoning() &&
            !Thirty_Min_Functions.consolidationtwo() && !Fifteen_Min_Functions.consolidationtwo()) {
        if (Daily_Functions.trend() && One_Hour_Functions.ema()) {
          if (One_Hour_Functions.trend() && One_Hour_Functions.macd() && One_Hour_Functions.obv()) {
            if (Thirty_Min_Functions.ema()) {
              if (Thirty_Min_Functions.rsi() && Thirty_Min_Functions.obv()) {
                buy = true
              }
            }
          }
        }
        if (!Daily_Functions.trend() && !One_Hour_Functions.ema()) {
          if (!One_Hour_Functions.trend() && !One_Hour_Functions.macd() && !One_Hour_Functions.obv()) {
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
      Four_Hour_Functions.ValueAssigner()
      Daily_Functions.HistoryAssigner()
      Weekly_Functions.HistoryAssigner()
      Four_Hour_Functions.HistoryAssigner()
    } catch (error) {
      console.log(error)
    }
    Daily_Functions.priceZones()
    Four_Hour_Functions.priceZones()
    Weekly_Functions.priceZones()
    let h = new Array()
    h = Daily_Functions.finlevs
    const i = Weekly_Functions.finlevs
    const q = Four_Hour_Functions.finlevs
    q.push(i)
    const totallevs = h.push(q)
    Two_Hour_Nexus.biggersupres = totallevs
    Two_Hour_Nexus.finlevs.concat(totallevs)
  }

  /** main control method, takes control of the entire program and serves as the brain */
  static controlMain () {
    try {
      Two_Hour_Functions.HistoryAssigner()
      Four_Hour_Functions.HistoryAssigner()
      Two_Hour_Functions.ValueAssigner()
      One_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.HistoryAssigner()
      Daily_Functions.HistoryAssigner()
      Fifteen_Min_Functions.HistoryAssigner()
      Two_Hour_Functions.stoploss()
      Two_Hour_Functions.getPrice()
      Two_Hour_Functions.supreslevs()
      Two_Hour_Nexus.controlSmallerPeriod()
      Two_Hour_Nexus.controlBiggerPeriod()
      if (!Two_Hour_Functions.consolidationtwo() && Two_Hour_Functions.overall() && !Two_Hour_Functions.consolidation() &&
            !Two_Hour_Functions.keylev()) {
        if (Two_Hour_Functions.ema()) {
          if (Two_Hour_Nexus.controlSmallerPeriod()[0] == true) {
            if (Two_Hour_Functions.trend() && Two_Hour_Functions.rsi() &&
                            Two_Hour_Functions.macd() && Two_Hour_Functions.roc() && Two_Hour_Functions.obv()) {
              if (!Two_Hour_Nexus.pos) {
                if (!Two_Hour_Nexus.buy_pos) { Two_Hour_Nexus.pot_buy = true }
                Two_Hour_Functions.stoploss()
                Two_Hour_Nexus.piploginit()
                Two_Hour_Nexus.buy()
              }
            }
          }
        }
        if (!Two_Hour_Functions.ema()) {
          if (Two_Hour_Nexus.controlSmallerPeriod()[1] == true) {
            if (!Two_Hour_Functions.trend() && !Two_Hour_Functions.rsi() &&
                            !Two_Hour_Functions.macd() && !Two_Hour_Functions.roc() && !Two_Hour_Functions.obv()) {
              if (!Two_Hour_Nexus.pos) {
                if (!Two_Hour_Nexus.sell_pos) { Two_Hour_Nexus.pot_sell = true }
                Two_Hour_Functions.stoploss()
                Two_Hour_Nexus.piploginit()
                Two_Hour_Nexus.sell()
              }
            }
          }
        }
      }
      if (Two_Hour_Nexus.pos && Two_Hour_Nexus.buy_pos) {
        Two_Hour_Nexus.piplogger()
        Two_Hour_Nexus.stopLossBuy()
        Two_Hour_Nexus.tstoplosscheck()
        Two_Hour_Nexus.tstoplosscont()
        Two_Hour_Nexus.takeProfitBuy()
      }
      if (Two_Hour_Nexus.pos && Two_Hour_Nexus.sell_pos) {
        Two_Hour_Nexus.piplogger()
        Two_Hour_Nexus.stopLossSell()
        Two_Hour_Nexus.tstoplosscheck()
        Two_Hour_Nexus.tstoplosscont()
        Two_Hour_Nexus.takeProfitSell()
      }
    } catch (error) {
      console.log(error)
    }
    /* figure out how to clear memory, and do so here after every iteration */
    /* memory issue solved: 4/20/22 */ }

  /** close position method for taking profit, and gives pip count and win/loss ratio */
  static closePosTP () {
    if (Two_Hour_Nexus.pos) {
      if (Two_Hour_Nexus.buy_pos) {
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
        const pipchange = Two_Hour_Functions.pipCountBuy(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
        Two_Hour_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Two_Hour_Nexus.pair)
        console.log('Take Profit Hit on Two Hour')
        console.log('Win Ratio: ' + Two_Hour_Nexus.wins / Two_Hour_Nexus.trades)
        console.log('Pip Count: ' + Two_Hour_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Two_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'TwoHour'
        );
      }
      if (Two_Hour_Nexus.sell_pos) {
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
        const pipchange = Two_Hour_Functions.pipCountSell(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
        Two_Hour_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Two_Hour_Nexus.pair)
        console.log('Take Profit Hit on Two Hour')
        console.log('Win Ratio: ' + Two_Hour_Nexus.wins / Two_Hour_Nexus.trades)
        console.log('Pip Count: ' + Two_Hour_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Two_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'TwoHour'
        );
      }
    }
  }

  /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
  static closePosSL () {
    if (Two_Hour_Nexus.pos) {
      if (Two_Hour_Nexus.sell_pos) {
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
        const pipchange = Two_Hour_Functions.pipCountSell(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
        Two_Hour_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Two_Hour_Nexus.pair)
        console.log('Stop Loss Hit on Two Hour')
        console.log('Win Ratio: ' + Two_Hour_Nexus.wins / Two_Hour_Nexus.trades)
        console.log('Pip Count: ' + Two_Hour_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Two_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'TwoHour'
        );
      }
      if (Two_Hour_Nexus.buy_pos) {
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
        const pipchange = Two_Hour_Functions.pipCountBuy(Two_Hour_Nexus.posprice, Two_Hour_Functions.price)
        Two_Hour_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Two_Hour_Nexus.pair)
        console.log('Stop Loss Hit on Two Hour')
        console.log('Win Ratio: ' + Two_Hour_Nexus.wins / Two_Hour_Nexus.trades)
        console.log('Pip Count: ' + Two_Hour_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Two_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'TwoHour'
        );
      }
    }
  }
}

class Two_Hour_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  rejectionzones = new Array()
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
  static instrument_name () {
    Two_Hour_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Two_Hour_Functions.instrument_name()
    Two_Hour_Functions.priceHist = dataset.Two_Hour.c
    Two_Hour_Functions.highs = dataset.Two_Hour.h
    Two_Hour_Functions.lows = dataset.Two_Hour.l
    Two_Hour_Functions.extendHist = dataset.Two_Hour_Extend.c
    Two_Hour_Functions.extendHigh = dataset.Two_Hour_Extend.h
    Two_Hour_Functions.extendLow = dataset.Two_Hour_Extend.l
  }

  /** load price from json file */
  static ValueAssigner () {
    Two_Hour_Functions.price = liveprice
  }

  /** second consolidation method, meant to strengthen consolidation identification */
 static consolidationtwo () {
  const history = Two_Hour_Functions.priceHist
  const highs = Two_Hour_Functions.highs 
  const lows = Two_Hour_Functions.lows 
  const histmax = Math.max(...highs)
  const histmin = Math.min(...lows)
  const histdiff = histmax - histmin
  
  // Ensure we have enough data
  const minDataPoints = 20
  if (history.length < minDataPoints) {
    // Return false instead of defaulting to true when insufficient data
    return false;
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
  
  // Narrowing bands indicate consolidation - stricter threshold for 2h timeframe
  const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
  const isTightBands = avgBandWidth < 0.015 // Tighter bands threshold (was 0.02)
  
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
  
  // Decreasing TR indicates consolidation - stricter threshold
  const trTrend = recentTR[recentTR.length - 1] < recentTR[0] * 0.9 // Must be 10% lower
  const isLowVolatility = normalizedATR < 0.006 // Stricter low volatility threshold (was 0.008)
  
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
  
  // Narrow range indicates consolidation - stricter thresholds
  const isNarrowRange = priceRangePercent < 0.015 // Tighter range threshold (was 0.02)
  const isLowDeviation = relativeStdDev < 0.008 // Stricter deviation threshold (was 0.01)
  
  // APPROACH 4: Linear regression slope and R-squared analysis
  const x = Array.from({ length: recentHistory.length }, (_, i) => i)
  const y = recentHistory
  
  // Calculate linear regression
  const regResult = new regression.SimpleLinearRegression(x, y)
  const slope = Math.abs(regResult.slope)
  const r2 = regResult.rSquared
  
  // Flat slope and good fit indicate consolidation
  const isFlatSlope = slope < 0.00008 * mean // Stricter slope threshold (was 0.0001)
  const isPoorFit = r2 < 0.45 // Stricter fit threshold (was 0.5)
  
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
  if (consecutiveHigherHighs >= 2 || consecutiveLowerLows >= 2) { // Stricter pattern detection (was 3)
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
  
  // Return true if consolidation probability is above 70% (was 60%)
  return consolidationProbability >= 0.70;
}

  /** TP variation, helps change TP depending on volatility and price movement depending on whether or not the code has surpassed TP1 and
     * is about to hit TP2
     */
  static tpvariation () {
    const tp = Two_Hour_Nexus.tp
    const values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
    const valdiffgreater = []
    const valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    const num1 = Two_Hour_Nexus.price
    const volval = Two_Hour_Functions.volatility()
    if (Two_Hour_Nexus.buy_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 < values[item]) {
          valdiffgreater.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Two_Hour_Nexus.tp
      filteredvaldiff = [...new Set(valdiffgreater)]
      for (const valuers in filteredvaldiff) {
        referenceval = closesttp - num1
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Two_Hour_Nexus.tp = Two_Hour_Functions.price + (Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)) {
          nexttp = Two_Hour_Functions.price + (Math.abs(Two_Hour_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Two_Hour_Functions.price + ((Two_Hour_Nexus.tp - Two_Hour_Functions.price) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)) {
          nexttp = Two_Hour_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Two_Hour_Functions.price + ((Two_Hour_Functions.tp - Two_Hour_Functions.price) * 1.382)
        }
      }
    }
    if (Two_Hour_Nexus.sell_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 > values[item]) {
          valdiffless.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Two_Hour_Nexus.tp
      filteredvaldiff = [...new Set(valdiffless)]
      for (const valuers in filteredvaldiff) {
        referenceval = num1 - closesttp
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Two_Hour_Nexus.tp = Two_Hour_Functions.price - (Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)) {
          nexttp = Two_Hour_Functions.price - (Math.abs(Two_Hour_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Two_Hour_Functions.price - ((Two_Hour_Functions.price - Two_Hour_Nexus.tp) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Two_Hour_Functions.price)) {
          nexttp = Two_Hour_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Two_Hour_Functions.price - ((Two_Hour_Functions.price - Two_Hour_Nexus.tp) * 1.382)
        }
      }
    }
    Two_Hour_Nexus.tptwo = nexttp
  }

  /** fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
  static fib () {
    const recents = Two_Hour_Functions.recentHisto
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
    const currentprice = Two_Hour_Functions.price
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

  /** Machine learning method for two hour timeframe used to determine past movement patterns to support supreslevs */
  static overall () {
    const extendedhistory = Two_Hour_Functions.extendHist
    const price = Two_Hour_Functions.price
    
    // Reset rejection zones
    Two_Hour_Functions.rejectionzones = []
    
    // Calculate price range and buffer
    const max = Math.max(...extendedhistory)
    const min = Math.min(...extendedhistory)
    const avgPrice = extendedhistory.reduce((sum, p) => sum + p, 0) / extendedhistory.length
    
    // Dynamic buffer based on recent volatility
    const recentVolatility = Two_Hour_Functions.volatility()
    const buffer = (max - min) * Math.max(0.001, Math.min(0.003, recentVolatility))
    
    const lower = price - buffer
    const upper = price + buffer
    
    // Find historical instances at similar price levels
    const studylist = []
    for (let i = 0; i < extendedhistory.length; i++) {
      if (extendedhistory[i] <= upper && extendedhistory[i] >= lower) {
        studylist.push([i, extendedhistory[i]])
      }
    }
    
    // Need minimum data points for analysis
    if (studylist.length < 5) return true
    
    // Check proximity to key levels
    const keyLevels = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
    let nearKeyLevel = false
    
    for (const level of keyLevels) {
      const distance = Math.abs(price - level) / price
      if (distance < 0.001) { // Within 0.1% for 2H timeframe
        nearKeyLevel = true
        break
      }
    }
    
    // Analyze historical behavior at similar levels
    const result = Two_Hour_Functions.analysis(studylist, extendedhistory, [lower, upper])
    
    // Return true if not near key level and no strong rejection patterns
    return result && !nearKeyLevel
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis (cases, extendedhistory, pricerange) {
    // Initialize rejection zones array
    Two_Hour_Functions.rejectionzones = []
    
    // Get current price and normalize data
    const price = Two_Hour_Functions.price
    const histnorm = Two_Hour_Functions.priceHist
    
    // Calculate standard deviation with shorter lookback
    const stdDev = Two_Hour_Functions.calculateStdDev(extendedhistory.slice(-24)) // Last 2 days
    
    // Calculate Bollinger Bands with wider bands
    const bollingerBands = bolls.calculate({ 
      period: 20, 
      values: extendedhistory, 
      stdDev: 2.5 // Wider bands
    })
    
    // Track rejection patterns
    let rejection = 0
    const rejectionZones = []
    
    // Analyze each potential rejection point
    for (const [idx, priceLevel] of cases) {
      // Skip if too close to edges
      if (idx < 3 || idx >= extendedhistory.length - 3) continue
      
      // Initialize score for this price level
      let rejectionScore = 0
      
      // 1. Price reversal pattern (max 1.5 points)
      const beforePrice = extendedhistory[idx - 2]
      const afterPrice = extendedhistory[idx + 2]
      const priceChange = afterPrice - beforePrice
      
      if (Math.abs(priceChange) > stdDev * 1.5) {
        if ((beforePrice < priceLevel && afterPrice > priceLevel) ||
            (beforePrice > priceLevel && afterPrice < priceLevel)) {
          rejectionScore += 1.5
        }
      }
      
      // 2. Bollinger Band touch (max 0.5 points)
      if (idx < bollingerBands.length) {
        const band = bollingerBands[idx]
        const priceDistance = Math.min(
          Math.abs(priceLevel - band.upper),
          Math.abs(priceLevel - band.lower)
        )
        if (priceDistance < stdDev * 0.75) {
          rejectionScore += 0.5
        }
      }
      
      // 3. Multiple tests of level (max 0.5 points)
      let levelTests = 0
      const testRange = stdDev * 0.5
      for (let i = Math.max(0, idx - 12); i < Math.min(extendedhistory.length, idx + 12); i++) {
        if (Math.abs(extendedhistory[i] - priceLevel) < testRange) {
          levelTests++
        }
      }
      if (levelTests >= 4) {
        rejectionScore += 0.5
      }
      
      // 4. Price momentum change (max 0.5 points)
      let beforeTrend = 0
      let afterTrend = 0
      
      for (let i = 1; i <= 3; i++) {
        if (idx - i > 0) {
          beforeTrend += extendedhistory[idx - i + 1] - extendedhistory[idx - i]
        }
        if (idx + i < extendedhistory.length) {
          afterTrend += extendedhistory[idx + i] - extendedhistory[idx + i - 1]
        }
      }
      
      if (Math.sign(beforeTrend) !== Math.sign(afterTrend)) {
        rejectionScore += 0.5
      }
      
      // Higher score requirement (3.0)
      if (rejectionScore >= 3.0) {
        rejection++
        rejectionZones.push(priceLevel)
        Two_Hour_Functions.rejectionzones.push(priceLevel)
      }
    }
    
    // Check if current price is near rejection zones
    let nearRejectionZone = false
    const proximityThreshold = stdDev * 0.75
    
    for (const zone of rejectionZones) {
      if (Math.abs(price - zone) < proximityThreshold) {
        // Only count as near if we have multiple confirmations
        const confirmations = rejectionZones.filter(z => 
          Math.abs(z - zone) < stdDev * 1.5
        ).length
        
        if (confirmations >= 2) {
        nearRejectionZone = true
        break
        }
      }
    }
    
    // More lenient return conditions:
    // 1. Allow more rejection zones (5 instead of 3)
    // 2. Require multiple confirmations for nearRejectionZone
    // 3. Higher threshold for rejection ratio
    return !(rejection > 5 || 
            (nearRejectionZone && rejection > 2) || 
            rejection > cases.length * 0.5)
  }

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Two_Hour_Functions.overall()
    const rejects = Two_Hour_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Two_Hour_Nexus.pot_buy) {
        if (Two_Hour_Functions.price < val) {
          diffs.push(val - Two_Hour_Functions.price)
        }
      }
      if (Two_Hour_Nexus.pot_sell) {
        if (Two_Hour_Functions.price > val) {
          diffs.push(Two_Hour_Functions.price - val)
        }
      }
    }

    if (Math.abs(Math.min(...diffs)) < Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.tp)) {
      Two_Hour_Nexus.pot_buy = false
      Two_Hour_Nexus.pot_sell = false
      return true
    } else {
      return false
    }
  }

  /** return price */
  static getPrice () {
    return Two_Hour_Functions.price
  }

  /** return historical price */
  static priceHistory () {
    return Two_Hour_Functions.priceHist
  }

  /** find whether trend is going up or down */
  static trend () {
    const history = Two_Hour_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

  /** recent history, shortens history array into last 50 digits for different analyses */
  static recentHist () {
    const history = Two_Hour_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 50; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Two_Hour_Functions.recentHisto = historytwo.reverse()
  }

  /** determination of stop loss size */
  static stoploss () {
    const highs = Two_Hour_Functions.highs
    const lows = Two_Hour_Functions.lows
    const diff = []
    let totaldiff = 0
    let finaldiff = 0
    for (let variables = 0; variables < 30; variables++) {
      diff.push(Math.abs(highs[highs.length - 1 - variables] - lows[lows.length - 1 - variables]))
    }
    for (let variables = 0; variables < diff.length; variables++) {
      totaldiff += diff[variables]
    }
    if (Two_Hour_Functions.volatility() > 0.618) {
      finaldiff = (totaldiff / 30) * 1.382
    } else {
      finaldiff = (totaldiff / 30)
    }
    let slceil = 0
    let slfloor = 0
    let numbuy = 0
    let newsl = 0
    if (Two_Hour_Nexus.pot_buy) {
      const diffprice = Two_Hour_Functions.price - finaldiff
      if (!Number.isFinite(Two_Hour_Functions.closesttwo(diffprice)[0])) {
        slfloor = Two_Hour_Functions.price - (finaldiff * 3.618)
        newsl = slfloor
      } else {
        numbuy = Two_Hour_Functions.closesttwo(diffprice)[0]
        if (!Number.isFinite(Two_Hour_Functions.closesttwo(numbuy)[0])) {
          newsl = diffprice - (0.786 * (diffprice - numbuy))
        } else {
          slfloor = (Two_Hour_Functions.price - ((Two_Hour_Functions.price - Two_Hour_Functions.closesttwo(numbuy)[0]) * 1.618 * 0.786))
          newsl = slfloor
        }
      }
      Two_Hour_Nexus.sl = newsl
    } if (Two_Hour_Nexus.pot_sell) {
      const diffprice = finaldiff + Two_Hour_Functions.price
      if (!Number.isFinite(Two_Hour_Functions.closesttwo(diffprice)[1])) {
        slceil = Two_Hour_Functions.price + (finaldiff * 3.618)
        newsl = slceil
      } else {
        numbuy = Two_Hour_Functions.closesttwo(diffprice)[1]
        if (!Number.isFinite(Two_Hour_Functions.closesttwo(numbuy)[1])) {
          newsl = diffprice + (0.786 * (numbuy - diffprice))
        } else {
          slceil = (Two_Hour_Functions.price + ((Math.abs(Two_Hour_Functions.price - Two_Hour_Functions.closesttwo(numbuy)[1])) * 1.618 * 0.786))
          newsl = slceil
        }
      }
      Two_Hour_Nexus.sl = newsl
    }
    return finaldiff
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closesttwo (num1) {
    const values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
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
    const closestbelow = Two_Hour_Functions.price - Math.min(...valdiffless)
    const closestabove = Two_Hour_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return closests
  }

  /** price zones, meant to determine whether a price zone has been found or not */
  static priceZones () {
    Two_Hour_Functions.supreslevs()
    if (Math.abs((Two_Hour_Functions.pipCountBuy(Two_Hour_Functions.price, Two_Hour_Nexus.resistance))
    ) / (Math.abs(Two_Hour_Functions.pipCountBuy(Math.max(...Two_Hour_Functions.priceHist), Math.min(...Two_Hour_Functions.priceHist)))) < 0.1) {
      return true
    } else if (Math.abs((Two_Hour_Functions.pipCountBuy(Two_Hour_Functions.price, Two_Hour_Nexus.support))
    ) / (Math.abs(Two_Hour_Functions.pipCountBuy(Math.max(...Two_Hour_Functions.priceHist), Math.min(...Two_Hour_Functions.priceHist)))) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** keylev, meant to determine the closest keylevel to the current price */
  static keylev () {
    Two_Hour_Functions.getPrice()
    if (Two_Hour_Functions.valdiff(Two_Hour_Functions.price, Two_Hour_Functions.closest(Two_Hour_Functions.price)) < 0.1) {
      return true
    } else {
      return false
    }
  }

  /** volatility, meant to determine whether or not price movement is too volatile for current parameters */
  static volatility () {
    const history = Two_Hour_Functions.priceHist
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
    const factor = Two_Hour_Functions.volatility()
    const history = Two_Hour_Functions.priceHist
    const ceiling = Math.max(...history)
    const floor = Math.min(...history)
    const diffy = ceiling - floor
    const posdiff = Math.abs(Two_Hour_Nexus.posprice - Two_Hour_Functions.price)
    const deci = posdiff / diffy
    const input = deci * 6.18
    const equation = (1 - factor) * (((input * input) + input) / ((input * input) + input + 1))
    return equation
  }

  /**  used to determine price channels and send to announcer so that the announcer can announce whether a price channel has been found, similar to price zones */
  static priceChannels () {
    const rvalues = Two_Hour_Functions.regression()
    if ((rvalues[0] * rvalues[0]) > 0.8 && (rvalues[1] * rvalues[1]) > 0.8) {
      return true
    } else {
      return false
    }
  }

  /** used to determine consolidation via volatility, is added to consolidationtwo that was recently made now */
  static consolidation () {
    // Get price data
    const history = Two_Hour_Functions.priceHist
    const histLen = history.length
    
    // Need enough data for analysis
    if (histLen < 30) return false
    
    // SECTION 1: PRICE STRUCTURE ANALYSIS
    // Sample recent prices (more weight on recent activity)
    const recentPrices = history.slice(-25)
    const olderPrices = history.slice(-50, -25)
    
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
    
    // Search for cycle lengths between 3 and 12 periods
    for (let lag = 3; lag <= 12; lag++) {
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
    
    // SECTION 5: PRICE SPIKES ANALYSIS
    // Detect outliers in price changes (spikes) that would disqualify consolidation
    const stdDevChanges = Math.sqrt(
      changes.reduce((sum, change) => sum + change * change, 0) / changes.length
    )
    
    let spikeCount = 0
    for (const change of changes) {
      if (Math.abs(change) > stdDevChanges * 2.5) {
        spikeCount++
      }
    }
    
    // Too many spikes suggest volatility, not consolidation
    if (spikeCount > 2) {
      return false
    }
    
    // SECTION 6: DECISION FRAMEWORK
    // Combined criteria with strict thresholds
    
    // Core consolidation conditions
    const narrowRange = recentRange < 0.012 // Very strict: 1.2% range maximum
    const stableRange = Math.abs(recentRange - olderRange) / olderRange < 0.3 // Range stability
    const lowVolatility = normalizedAtr < 0.002 // Strict volatility threshold
    const goodCycleStrength = normCorrelation > 0.4 // Strong cyclic behavior
    
    // Count how many conditions are met
    let conditionsMet = 0
    if (narrowRange) conditionsMet++
    if (stableRange) conditionsMet++
    if (lowVolatility) conditionsMet++ 
    if (goodCycleStrength) conditionsMet++
    
    // Additional context-specific conditions
    const consistentStructure = maxConsecutive <= 3 // No more than 3 consecutive moves same direction
    const limitedSpikes = spikeCount <= 1 // At most 1 price spike
    
    if (consistentStructure) conditionsMet++
    if (limitedSpikes) conditionsMet++
    
    // Set an adaptive threshold based on overall volatility
    const requiredConditions = normalizedAtr < 0.0015 ? 4 : 5
    
    // Final decision with high bar for consolidation
    return conditionsMet >= requiredConditions;
  }

  /** used to determine slope between two points */
  static slopes () {
    Two_Hour_Functions.recentHist()
    const recentHistory = Two_Hour_Functions.recentHisto
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
    Two_Hour_Functions.recentHist()
    const recentHistory = Two_Hour_Functions.recentHisto
    const slope = Two_Hour_Functions.slopes()
    const maxes = []
    const mins = []
    for (let value = 3; value < slope.length - 2; value++) {
      if (slope[value - 1] > 0 && slope[value] < 0) {
        if (slope[value - 2] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) } else if (slope[value - 3] > 0 && slope[value + 1] < 0) { maxes.push(recentHistory[value]) }
      } else if (slope[value - 1] < 0 && slope[value] > 0) {
        if (slope[value - 2] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) } else if (slope[value - 3] < 0 && slope[value + 1] > 0) { mins.push(recentHistory[value]) }
      }
    }
    Two_Hour_Functions.maxes = maxes
    Two_Hour_Functions.mins = mins
  }

  /** used to determine regression lines (moving averages, for example) */
  static regression () {
    Two_Hour_Functions.maxes_mins()
    const x = []
    const length = Two_Hour_Functions.maxes.length
    for (let value = 0; value < length; value++) { x.push(value) }
    const y = Two_Hour_Functions.maxes
    const regressions = new regression.SimpleLinearRegression(x, y)
    const xtwo = []
    const lengthtwo = Two_Hour_Functions.mins.length
    for (let value = 0; value < lengthtwo; value++) { xtwo.push(value) }
    const ytwo = Two_Hour_Functions.mins
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
    // Get price history data including highs and lows
    const history = Two_Hour_Functions.priceHist
    const highs = Two_Hour_Functions.highs
    const lows = Two_Hour_Functions.lows
    const price = Two_Hour_Functions.getPrice()
    
    // Ensure we have enough data
    if (history.length < 15) {
      // Initialize with default values if insufficient data
      Daily_Nexus.support = price * 0.99
      Daily_Nexus.resistance = price * 1.01
      Daily_Nexus.finlevs = [price * 0.99, price * 1.01]
      return
    }
    
    // Calculate price range and normalize
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
    const filteredLevels = Two_Hour_Functions.filterCloseValues ? 
      Two_Hour_Functions.filterCloseValues(levels, minimumDistance) : 
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
      const volatility = Two_Hour_Functions.volatility ? Two_Hour_Functions.volatility() : 0.01
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
      const volatility = Two_Hour_Functions.volatility ? Two_Hour_Functions.volatility() : 0.01
      resistance = price * (1 + volatility * 2)
    }
    
    // Store results
    Two_Hour_Nexus.support = support
    Two_Hour_Nexus.resistance = resistance
    Two_Hour_Nexus.finlevs = filteredLevels
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

  /** self explanatory, finds RSI and compares the last two */
  static rsi () {
    const history = Two_Hour_Functions.priceHist
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
    const history = Two_Hour_Functions.priceHist
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
    const history = Two_Hour_Functions.priceHist
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
    const history = Two_Hour_Functions.priceHist
    const q = emas.calculate({ period: 8, values: history })
    const r = emas.calculate({ period: 14, values: history })
    const qlast = q[q.length - 1]
    const rlast = r[r.length - 1]
    if (qlast > rlast) { return true }
    if (rlast > qlast) { return false }
  }

  /** new indicator mix that finds EMAS of RSI and compares the last two values */
  static obv () {
    const history = Two_Hour_Functions.priceHist
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
      Two_Hour_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 3) {
      Two_Hour_Functions.multiplier = 100
    } else if (String(num1).indexOf('.') == 4) {
      Two_Hour_Functions.multiplier = 10
    } else if (String(num1).indexOf('.') == 5) {
      Two_Hour_Functions.multiplier = 1
    } else if (String(num1).indexOf('.') == 5) {
      Two_Hour_Functions.multiplier = 0.1
    } else if (String(num1).indexOf('.') == 6) {
      Two_Hour_Functions.multiplier = 0.01
    } else if (String(num1).indexOf('.') == 7) {
      Two_Hour_Functions.multiplier = 0.001
    } else if (String(num1).indexOf('.') == 8) {
      Two_Hour_Functions.multiplier = 0.0001
    } else if (String(num1).indexOf('.') == 9) {
      Two_Hour_Functions.multiplier = 0.00001
    } else if (String(num1).indexOf('.') == 10) {
      Two_Hour_Functions.multiplier = 0.000001
    } else { Two_Hour_Functions.multiplier = 10000 }
    num1 *= Two_Hour_Functions.multiplier
    num2 *= Two_Hour_Functions.multiplier
    return [num1, num2]
  }

  /** pip converter */
  static pipreverse (num, num2) {
    if (String(num).indexOf('.') == 2) {
      Two_Hour_Functions.multiplier = 0.001
    } else if (String(num).indexOf('.') == 3) {
      Two_Hour_Functions.multiplier = 0.01
    } else if (String(num).indexOf('.') == 4) {
      Two_Hour_Functions.multiplier = 0.1
    } else if (String(num).indexOf('.') == 5) {
      Two_Hour_Functions.multiplier = 1
    } else if (String(num).indexOf('.') == 5) {
      Two_Hour_Functions.multiplier = 10
    } else if (String(num).indexOf('.') == 6) {
      Two_Hour_Functions.multiplier = 100
    } else if (String(num).indexOf('.') == 7) {
      Two_Hour_Functions.multiplier = 1000
    } else if (String(num).indexOf('.') == 8) {
      Two_Hour_Functions.multiplier = 10000
    } else if (String(num).indexOf('.') == 9) {
      Two_Hour_Functions.multiplier = 100000
    } else if (String(num).indexOf('.') == 10) {
      Two_Hour_Functions.multiplier = 1000000
    } else { Two_Hour_Functions.multiplier = 0.0001 }
    num2 *= Two_Hour_Functions.multiplier
    return (num2)
  }

  static instrument_switcher (instrument) {
  }

  /* sets value difference as a decimal-percentage of floor to ceiling */
  /** gets value difference for normalization of data points */
  static valdiff (num1, num2) {
    const history = Two_Hour_Functions.priceHist
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
      Two_Hour_Functions.multiplier = 1000
    } else if (String(price).indexOf('.') == 3) {
      Two_Hour_Functions.multiplier = 100
    } else if (String(price).indexOf('.') == 4) {
      Two_Hour_Functions.multiplier = 10
    } else if (String(price).indexOf('.') == 5) {
      Two_Hour_Functions.multiplier = 1
    } else if (String(price).indexOf('.') == 5) {
      Two_Hour_Functions.multiplier = 0.1
    } else if (String(price).indexOf('.') == 6) {
      Two_Hour_Functions.multiplier = 0.01
    } else if (String(price).indexOf('.') == 7) {
      Two_Hour_Functions.multiplier = 0.001
    } else if (String(price).indexOf('.') == 8) {
      Two_Hour_Functions.multiplier = 0.0001
    } else if (String(price).indexOf('.') == 9) {
      Two_Hour_Functions.multiplier = 0.00001
    } else if (String(price).indexOf('.') == 10) {
      Two_Hour_Functions.multiplier = 0.000001
    } else {
      Two_Hour_Functions.multiplier = 10000
    }
    return num1 * Two_Hour_Functions.multiplier
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closest (num1) {
    const values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
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
    const closestbelow = Two_Hour_Functions.price - Math.min(...valdiffless)
    const closestabove = Two_Hour_Functions.price + Math.min(...valdiffgreater)
    const closests = [closestbelow, closestabove]
    return Math.min(...closests)
  }

  /** Counts pips between two values for buying */
  static pipCountBuy (num1, num2) {
    let nums
    nums = Two_Hour_Functions.pip(num1, num2)
    return (nums[1] - nums[0])
  }

  /** Counts pips between two values for selling */
  static pipCountSell (num1, num2) {
    let nums
    nums = Two_Hour_Functions.pip(num1, num2)
    return (nums[0] - nums[1])
  }

  /** Calculate standard deviation of values */
  static calculateStdDev(values) {
    if (!values || values.length === 0) return 0;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate sum of squared differences
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((sum, val) => sum + val, 0);
    
    // Return standard deviation
    return Math.sqrt(sumSquaredDiffs / values.length);
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
  price = 0
  support = 0
  resistance = 0
  maxes = []
  mins = []
  recentHisto = []
  highs = []
  lows = []

  /** load instrument name from json file */
  static instrument_name () {
    Two_Hour_Nexus.pair = instrum
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
    const history = Four_Hour_Functions.priceHist
    const highs = Four_Hour_Functions.highs 
    const lows = Four_Hour_Functions.lows 
    const histmax = Math.max(...highs)
    const histmin = Math.min(...lows)
    const histdiff = histmax - histmin
    
    // Ensure we have enough data
    const minDataPoints = 20
    if (history.length < minDataPoints) {
      // Return false instead of defaulting to true when insufficient data
      return false;
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
    
    // Narrowing bands indicate consolidation - stricter threshold for 2h timeframe
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.015 // Tighter bands threshold (was 0.02)
    
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
    
    // Decreasing TR indicates consolidation - stricter threshold
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0] * 0.9 // Must be 10% lower
    const isLowVolatility = normalizedATR < 0.006 // Stricter low volatility threshold (was 0.008)
    
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
    
    // Narrow range indicates consolidation - stricter thresholds
    const isNarrowRange = priceRangePercent < 0.015 // Tighter range threshold (was 0.02)
    const isLowDeviation = relativeStdDev < 0.008 // Stricter deviation threshold (was 0.01)
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Flat slope and good fit indicate consolidation
    const isFlatSlope = slope < 0.00008 * mean // Stricter slope threshold (was 0.0001)
    const isPoorFit = r2 < 0.45 // Stricter fit threshold (was 0.5)
    
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
    if (consecutiveHigherHighs >= 2 || consecutiveLowerLows >= 2) { // Stricter pattern detection (was 3)
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
    
    // Return true if consolidation probability is above 70% (was 60%)
    return consolidationProbability >= 0.70;
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

  /** Machine learning method for four hour timeframe used to determine past movement patterns to support supreslevs */
  static overall () {
    // Get extended price history data and current price
    const extendedhistory = Four_Hour_Functions.extendHist
    const extendedHighs = Four_Hour_Functions.extendHigh  
    const extendedLows = Four_Hour_Functions.extendLow
    const price = Four_Hour_Functions.price
    
    // Get levels from multiple timeframes for more robust analysis
    // Use Array.isArray to prevent "not iterable" errors
    const dailyLevels = Array.isArray(Daily_Functions.finlevs) ? Daily_Functions.finlevs : []
    const weeklyLevels = Array.isArray(Weekly_Functions.finlevs) ? Weekly_Functions.finlevs : []
    const keyLevels = [...dailyLevels, ...weeklyLevels]
    
    // Calculate volatility for dynamic buffer adjustment using ATR concept
    const volatility = Four_Hour_Functions.volatility ? Four_Hour_Functions.volatility() : 0.05
    
    // Calculate price range and adaptive buffer based on market conditions
    const priceRange = Math.max(...extendedhistory) - Math.min(...extendedhistory)
    const recentVolatility = Four_Hour_Functions.calculateStdDev ? 
      Four_Hour_Functions.calculateStdDev(extendedhistory.slice(-30)) / 
      (extendedhistory.slice(-30).reduce((a, b) => a + b, 0) / 30) : 0.01
    
    // Adaptive buffer - increases in volatile markets, decreases in stable markets
    const buffer = priceRange * Math.max(0.03, Math.min(0.08, volatility))
    
    // Define price range for historical analysis
    const lower = price - buffer
    const upper = price + buffer
    const pricerange = [lower, upper]
    
    // Find historical instances at similar price levels with recency weighting
    const studylist = []
    const weightDecay = 0.995 // Slight decay factor to give more weight to recent instances
    for (let val = 0; val < extendedhistory.length; val++) {
      if (extendedhistory[val] <= upper && extendedhistory[val] >= lower) {
        // Calculate recency weight - more recent data points have higher weight
        const recency = Math.pow(weightDecay, extendedhistory.length - val - 1)
        studylist.push([val, extendedhistory[val], recency])
      }
    }
    
    // Check if price is near a key support/resistance level with adaptive proximity
    let keyLevelProximity = false
    let keyLevelStrength = 0
    const adaptiveProximity = Math.min(0.005, Math.max(0.002, volatility * 0.05)) // Between 0.2% and 0.5%
    
    for (const level of keyLevels) {
      const distance = Math.abs(price - level) / price
      if (distance < adaptiveProximity) {
        keyLevelProximity = true
        // Calculate strength based on closeness to level (closer = stronger)
        keyLevelStrength = Math.max(keyLevelStrength, 1 - (distance / adaptiveProximity))
        if (keyLevelStrength > 0.8) break; // Strong level found, no need to check others
      }
    }
    
    // Check for consolidation to avoid trading in indecisive markets
    const isConsolidating = Four_Hour_Functions.consolidationtwo ? 
      Four_Hour_Functions.consolidationtwo() : false
    
    // Too little data for reliable analysis
    if (studylist.length < 5) {
      // If near key level with strong proximity, avoid trading (false)
      return !(keyLevelProximity && keyLevelStrength > 0.7)
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
    
    // Enhanced decision making with multiple factors:
    // 1. Strong key level proximity is a major concern (increased risk)
    if (keyLevelProximity && keyLevelStrength > 0.8) return false;
    
    // 2. Consolidating market near key level should be avoided
    if (isConsolidating && keyLevelProximity) return false;
    
    // 3. Either positive analysis or sufficient non-key-level data with no consolidation
    return result || (!keyLevelProximity && studylist.length >= 8 && !isConsolidating)
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis (cases, extendedhistory, pricerange, highs, lows, keyLevels) {
    // Initialize rejection zones array
    Four_Hour_Functions.rejectionzones = []
    
    // Get current price and normal history
    const price = Four_Hour_Functions.price
    const histnorm = Four_Hour_Functions.priceHist
    
    // Calculate price statistics
    const priceStdDev = Four_Hour_Functions.calculateStdDev ? 
      Four_Hour_Functions.calculateStdDev(extendedhistory.slice(-50)) : 
      (Math.max(...histnorm) - Math.min(...histnorm)) * 0.025
    
    // Significant price movement threshold (scaled by market volatility)
    const histRange = Math.max(...histnorm) - Math.min(...histnorm)
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
    
    // Define rejection threshold based on market volatility
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
      if (highs && lows && idx < highs.length && idx < lows.length) {
        const highLowRange = highs[idx] - lows[idx]
        const bodySize = Math.abs(extendedhistory[idx] - (idx > 0 ? extendedhistory[idx-1] : extendedhistory[idx]))
        
        // Detect potential doji, hammer, or shooting star
        if (highLowRange > bodySize * 2) {
          rejectionEvidence += 1
        }
      }
      
      // Pattern 5: Check for confluence with key levels from multiple timeframes
      if (keyLevels && keyLevels.length) {
        const currentPrice = extendedhistory[idx]
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

  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    Four_Hour_Functions.overall()
    const rejects = Four_Hour_Functions.rejectionzones
    const diffs = []
    for (const val in rejects) {
      if (Two_Hour_Nexus.pot_buy) {
        if (Four_Hour_Functions.price < val) {
          diffs.push(val - Four_Hour_Functions.price)
        }
      }
      if (Two_Hour_Nexus.pot_sell) {
        if (Four_Hour_Functions.price > val) {
          diffs.push(Four_Hour_Functions.price - val)
        }
      }
    }
    if (Math.abs(Math.min(...diffs)) < Math.abs(Two_Hour_Functions.price - Two_Hour_Nexus.tp)) {
      Two_Hour_Nexus.pot_buy = false
      Two_Hour_Nexus.pot_sell = false
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
    const posdiff = Math.abs(Two_Hour_Nexus.posprice - Four_Hour_Functions.price)
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
    // Get price data
    const history = Four_Hour_Functions.priceHist
    const histLen = history.length
    
    // Need enough data for analysis
    if (histLen < 30) return false
    
    // SECTION 1: PRICE STRUCTURE ANALYSIS
    // Sample recent prices (more weight on recent activity)
    const recentPrices = history.slice(-25)
    const olderPrices = history.slice(-50, -25)
    
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
    
    // Search for cycle lengths between 3 and 12 periods
    for (let lag = 3; lag <= 12; lag++) {
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
    
    // SECTION 5: PRICE SPIKES ANALYSIS
    // Detect outliers in price changes (spikes) that would disqualify consolidation
    const stdDevChanges = Math.sqrt(
      changes.reduce((sum, change) => sum + change * change, 0) / changes.length
    )
    
    let spikeCount = 0
    for (const change of changes) {
      if (Math.abs(change) > stdDevChanges * 2.5) {
        spikeCount++
      }
    }
    
    // Too many spikes suggest volatility, not consolidation
    if (spikeCount > 2) {
      return false
    }
    
    // SECTION 6: DECISION FRAMEWORK
    // Combined criteria with strict thresholds
    
    // Core consolidation conditions
    const narrowRange = recentRange < 0.012 // Very strict: 1.2% range maximum
    const stableRange = Math.abs(recentRange - olderRange) / olderRange < 0.3 // Range stability
    const lowVolatility = normalizedAtr < 0.002 // Strict volatility threshold
    const goodCycleStrength = normCorrelation > 0.4 // Strong cyclic behavior
    
    // Count how many conditions are met
    let conditionsMet = 0
    if (narrowRange) conditionsMet++
    if (stableRange) conditionsMet++
    if (lowVolatility) conditionsMet++ 
    if (goodCycleStrength) conditionsMet++
    
    // Additional context-specific conditions
    const consistentStructure = maxConsecutive <= 3 // No more than 3 consecutive moves same direction
    const limitedSpikes = spikeCount <= 1 // At most 1 price spike
    
    if (consistentStructure) conditionsMet++
    if (limitedSpikes) conditionsMet++
    
    // Set an adaptive threshold based on overall volatility
    const requiredConditions = normalizedAtr < 0.0015 ? 4 : 5
    
    // Final decision with high bar for consolidation
    return conditionsMet >= requiredConditions;
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
    // Get price history data including highs and lows
    const history = Four_Hour_Functions.priceHist
    const highs = Four_Hour_Functions.highs
    const lows = Four_Hour_Functions.lows
    const price = Four_Hour_Functions.getPrice()
    
    // Ensure we have enough data
    if (history.length < 20) {
      // Initialize with default values if insufficient data
      Four_Hour_Functions.support = price * 0.99
      Four_Hour_Functions.resistance = price * 1.01
      Four_Hour_Functions.finlevs = [price * 0.99, price * 1.01]
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
    const minimumDistance = avgPrice * 0.004 // 0.4% minimum separation for two-hour timeframe
    const filteredLevels = Four_Hour_Functions.filterCloseValues ? 
      Four_Hour_Functions.filterCloseValues(levels, minimumDistance) : 
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
      const volatility = Four_Hour_Functions.volatility ? Four_Hour_Functions.volatility() : 0.01
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
      const volatility = Four_Hour_Functions.volatility ? Four_Hour_Functions.volatility() : 0.01
      resistance = price * (1 + volatility * 2)
    }
    
    // Store results
    Four_Hour_Functions.support = support
    Four_Hour_Functions.resistance = resistance
    Four_Hour_Functions.finlevs = filteredLevels
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
    const values = Two_Hour_Nexus.finlevs.concat(Two_Hour_Nexus.biggersupres)
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

  /** Calculate standard deviation of values */
  static calculateStdDev(values) {
    if (!values || values.length === 0) return 0;
    
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate sum of squared differences
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((sum, val) => sum + val, 0);
    
    // Return standard deviation
    return Math.sqrt(sumSquaredDiffs / values.length);
  }
}

class Daily_Functions {
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
  extendHist = []
  extendHigh = []
  extendLow = []

  static HistoryAssigner () {
    const instrument = Two_Hour_Functions.instrument_name()
    Daily_Functions.priceHist = dataset.Daily.c
    Daily_Functions.highs = dataset.Daily.h
    Daily_Functions.lows = dataset.Daily.l
    Daily_Functions.extendHist = dataset.Daily_Extend.c
    Daily_Functions.extendHigh = dataset.Daily_Extend.h
    Daily_Functions.extendLow = dataset.Daily_Extend.l
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
  /** finds support and resistance levels, very important for code function, would love to improve this */
  static supreslevs () {
    const history = Daily_Functions.priceHist
    const highs = Daily_Functions.highs
    const lows = Daily_Functions.lows
    const price = Daily_Functions.getPrice()
    
    // Ensure we have enough data
    if (history.length < 15) {
      // Initialize with default values if insufficient data
      Daily_Nexus.support = price * 0.99
      Daily_Nexus.resistance = price * 1.01
      Daily_Nexus.finlevs = [price * 0.99, price * 1.01]
      return
    }
    
    // Calculate price range and normalize
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
    Daily_Functions.support = support
    Daily_Functions.resistance = resistance
    Daily_Functions.finlevs = filteredLevels
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
  support = 0
  resistance = 0
  maxes = []
  mins = []
  recentHisto = []
  finlevs = []
  support = 0
  resistance = 0
  highs = highs
  lows = lows
  extendHist = []
  extendHigh = []
  extendLow = []

  static HistoryAssigner () {
    const instrument = Two_Hour_Functions.instrument_name()
    Weekly_Functions.priceHist = dataset.Weekly.c
    Weekly_Functions.highs = dataset.Weekly.h
    Weekly_Functions.lows = dataset.Weekly.l
    Weekly_Functions.extendHist = dataset.Weekly_Extend.c
    Weekly_Functions.extendHigh = dataset.Weekly_Extend.h
    Weekly_Functions.extendLow = dataset.Weekly_Extend.l
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
  /** finds support and resistance levels, very important for code function, would love to improve this */
  static supreslevs () {
    const history = Weekly_Functions.priceHist
    const highs = Weekly_Functions.highs
    const lows = Weekly_Functions.lows
    const price = Weekly_Functions.getPrice()
    
    // Ensure we have enough data
    if (history.length < 15) {
      // Initialize with default values if insufficient data
      Weekly_Functions.support = price * 0.98
      Weekly_Functions.resistance = price * 1.02
      Weekly_Functions.finlevs = [price * 0.98, price * 1.02]
      return
    }
    
    // Calculate price range and normalize
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
    const minimumDistance = avgPrice * 0.006 // 0.6% minimum separation for weekly timeframe
    const filteredLevels = Weekly_Functions.filterCloseValues ? 
      Weekly_Functions.filterCloseValues(levels, minimumDistance) : 
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
      // Fallback support - wider for weekly
      const volatility = Weekly_Functions.volatility ? Weekly_Functions.volatility() : 0.02
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
      // Fallback resistance - wider for weekly
      const volatility = Weekly_Functions.volatility ? Weekly_Functions.volatility() : 0.02
      resistance = price * (1 + volatility * 2)
    }
    
    // Store results
    Weekly_Functions.support = support
    Weekly_Functions.resistance = resistance
    Weekly_Functions.finlevs = filteredLevels
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
  support = 0
  resistance = 0
  price = 0
  maxes = []
  mins = []
  recentHisto = []
  highs = []
  lows = []
  extendHist = []
  extendHigh = []
  extendLow = []

  static HistoryAssigner () {
    const instrument = Two_Hour_Functions.instrument_name()
    One_Hour_Functions.priceHist = dataset.One_Hour.c
    One_Hour_Functions.highs = dataset.One_Hour.h
    One_Hour_Functions.lows = dataset.One_Hour.l
    One_Hour_Functions.extendHist = dataset.One_Hour_Extend.c
    One_Hour_Functions.extendHigh = dataset.One_Hour_Extend.h
    One_Hour_Functions.extendLow = dataset.One_Hour_Extend.l
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
  support = 0
  resistance = 0
  highs = []
  extendHist = []
  extendHigh = []
  extendLow = []

  static HistoryAssigner () {
    const instrument = Two_Hour_Functions.instrument_name()
    Thirty_Min_Functions.priceHist = dataset.Thirty_Min.c
    Thirty_Min_Functions.highs = dataset.Thirty_Min.h
    Thirty_Min_Functions.lows = dataset.Thirty_Min.l
    Thirty_Min_Functions.extendHist = dataset.Thirty_Min_Extend.c
    Thirty_Min_Functions.extendHigh = dataset.Thirty_Min_Extend.h
    Thirty_Min_Functions.extendLow = dataset.Thirty_Min_Extend.l
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
      // Return false instead of defaulting to true when insufficient data
      return false;
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
    
    // Narrowing bands indicate consolidation - stricter threshold for 2h timeframe
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.015 // Tighter bands threshold (was 0.02)
    
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
    
    // Decreasing TR indicates consolidation - stricter threshold
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0] * 0.9 // Must be 10% lower
    const isLowVolatility = normalizedATR < 0.006 // Stricter low volatility threshold (was 0.008)
    
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
    
    // Narrow range indicates consolidation - stricter thresholds
    const isNarrowRange = priceRangePercent < 0.015 // Tighter range threshold (was 0.02)
    const isLowDeviation = relativeStdDev < 0.008 // Stricter deviation threshold (was 0.01)
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Flat slope and good fit indicate consolidation
    const isFlatSlope = slope < 0.00008 * mean // Stricter slope threshold (was 0.0001)
    const isPoorFit = r2 < 0.45 // Stricter fit threshold (was 0.5)
    
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
    if (consecutiveHigherHighs >= 2 || consecutiveLowerLows >= 2) { // Stricter pattern detection (was 3)
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
    
    // Return true if consolidation probability is above 70% (was 60%)
    return consolidationProbability >= 0.70;
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

class Fifteen_Min_Functions {
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
  extendHist = []
  extendHigh = []
  extendLow = []

  static HistoryAssigner () {
    const instrument = Two_Hour_Functions.instrument_name()
    Fifteen_Min_Functions.priceHist = dataset.Fifteen_Min.c
    Fifteen_Min_Functions.highs = dataset.Fifteen_Min.h
    Fifteen_Min_Functions.lows = dataset.Fifteen_Min.l
    Fifteen_Min_Functions.extendHist = dataset.Fifteen_Min_Extend.c
    Fifteen_Min_Functions.extendHigh = dataset.Fifteen_Min_Extend.h
    Fifteen_Min_Functions.extendLow = dataset.Fifteen_Min_Extend.l
  }

 /** second consolidation method, meant to strengthen consolidation identification */
 static consolidationtwo () {
  const history = Fifteen_Min_Functions.priceHist
  const highs = Fifteen_Min_Functions.highs 
  const lows = Fifteen_Min_Functions.lows 
  const histmax = Math.max(...highs)
  const histmin = Math.min(...lows)
  const histdiff = histmax - histmin
  
  // Ensure we have enough data
  const minDataPoints = 20
  if (history.length < minDataPoints) {
    // Return false instead of defaulting to true when insufficient data
    return false;
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
  
  // Narrowing bands indicate consolidation - stricter threshold for 2h timeframe
  const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
  const isTightBands = avgBandWidth < 0.015 // Tighter bands threshold (was 0.02)
  
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
  
  // Decreasing TR indicates consolidation - stricter threshold
  const trTrend = recentTR[recentTR.length - 1] < recentTR[0] * 0.9 // Must be 10% lower
  const isLowVolatility = normalizedATR < 0.006 // Stricter low volatility threshold (was 0.008)
  
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
  
  // Narrow range indicates consolidation - stricter thresholds
  const isNarrowRange = priceRangePercent < 0.015 // Tighter range threshold (was 0.02)
  const isLowDeviation = relativeStdDev < 0.008 // Stricter deviation threshold (was 0.01)
  
  // APPROACH 4: Linear regression slope and R-squared analysis
  const x = Array.from({ length: recentHistory.length }, (_, i) => i)
  const y = recentHistory
  
  // Calculate linear regression
  const regResult = new regression.SimpleLinearRegression(x, y)
  const slope = Math.abs(regResult.slope)
  const r2 = regResult.rSquared
  
  // Flat slope and good fit indicate consolidation
  const isFlatSlope = slope < 0.00008 * mean // Stricter slope threshold (was 0.0001)
  const isPoorFit = r2 < 0.45 // Stricter fit threshold (was 0.5)
  
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
  if (consecutiveHigherHighs >= 2 || consecutiveLowerLows >= 2) { // Stricter pattern detection (was 3)
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
  
  // Return true if consolidation probability is above 70% (was 60%)
  return consolidationProbability >= 0.70;
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

function testtwohour (data, price, instrument) {
  instrum = instrument;
  liveprice = price;
  // Assign to the global dataset variable
  dataset = data;
  Two_Hour_Nexus.controlMain();
  
  // If we have a potential buy signal
  if (Two_Hour_Nexus.pot_buy && !Two_Hour_Nexus.buy_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Two_Hour_Functions.supreslevs();
    Two_Hour_Functions.getPrice();
    Two_Hour_Functions.stoploss();
    Two_Hour_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Two_Hour_Nexus.sl.toFixed(5);
    const formattedTP = Two_Hour_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[TwoHour] BUY SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('BUY', instrument, formattedSL, formattedTP, 0.03, 'Two_Hour algorithm signal', 'Two_Hour');
  }
  
  // If we have a potential sell signal
  if (Two_Hour_Nexus.pot_sell && !Two_Hour_Nexus.sell_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Two_Hour_Functions.supreslevs();
    Two_Hour_Functions.getPrice();
    Two_Hour_Functions.stoploss();
    Two_Hour_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Two_Hour_Nexus.sl.toFixed(5);
    const formattedTP = Two_Hour_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[TwoHour] SELL SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('SELL', instrument, formattedSL, formattedTP, 0.04, 'Two_Hour algorithm signal', 'Two_Hour')
  }
}

module.exports = {
  testtwohour
};
