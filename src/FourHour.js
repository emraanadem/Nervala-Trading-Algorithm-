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
  backtest = false

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
          }}
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
        }}
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
    }
    
    // Add at the end of the buy method, before the closing bracket
    sendSignal(
      'BUY',
      Four_Hour_Nexus.pair,
      Four_Hour_Nexus.sl,
      Four_Hour_Nexus.tp,
      0.02, // Higher volume for longer timeframe
      'FourHour'
    );
  }}

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
      }
    }
    
    // Add at the end of the sell method, before the closing bracket
    sendSignal(
      'SELL',
      Four_Hour_Nexus.pair,
      Four_Hour_Nexus.sl,
      Four_Hour_Nexus.tp,
      0.02, // Higher volume for longer timeframe
      'FourHour'
    );
  }

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
      Four_Hour_Functions.HistoryAssigner()
      Four_Hour_Functions.ValueAssigner()
      Four_Hour_Functions.getPrice()
      Four_Hour_Functions.stoploss()
      One_Hour_Functions.HistoryAssigner()
      Thirty_Min_Functions.HistoryAssigner()
      Daily_Functions.HistoryAssigner()
      Fifteen_Min_Functions.HistoryAssigner()
      Four_Hour_Functions.supreslevs()
      Four_Hour_Nexus.controlSmallerPeriod()
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
        sendSignal(
          'CLOSE_BUY',
          Four_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'FourHour'
        );
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
        sendSignal(
          'CLOSE_SELL',
          Four_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'FourHour'
        );
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
        console.log('Pip Count: ' + Four_Hour_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Four_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'FourHour'
        );
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
        console.log('Pip Count: ' + Four_Hour_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Four_Hour_Nexus.pair,
          0,
          0,
          0.02,
          'FourHour'
        );
      }
    }
  }

  // Add this new method after closePosSL and before the class ends
  static updateTrailingStop() {
    if (Four_Hour_Nexus.tstop && Four_Hour_Nexus.pos) {
      sendSignal('FourHour', {
        action: 'MODIFY',
        symbol: Four_Hour_Nexus.pair,
        stopLoss: Four_Hour_Nexus.tstoploss,
        takeProfit: Four_Hour_Nexus.tp,
        reason: 'Trailing stop update from FourHour strategy'
      });
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
    const normalizedTR = avgTR / recentHistory[recentHistory.length - 1]
    
    // Decreasing volatility indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedTR < 0.005 // 0.5% threshold
    
    // APPROACH 3: Price range analysis
    // Calculate recent price range as percentage of price
    const rangePercent = (Math.max(...recentHighs) - Math.min(...recentLows)) / 
                        recentHistory[recentHistory.length - 1]
    
    const isNarrowRange = rangePercent < 0.02 // 2% total range threshold
    
    // Calculate standard deviation of close prices
    const sum = recentHistory.reduce((a, b) => a + b, 0)
    const mean = sum / recentHistory.length
    const squaredDiffs = recentHistory.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    const stdDev = Math.sqrt(avgSquaredDiff)
    const coefficientOfVariation = stdDev / mean
    
    const isLowDeviation = coefficientOfVariation < 0.01 // 1% threshold
    
    // APPROACH 4: Linear regression analysis
    // Calculate regression slope and R-squared
    let xValues = []
    for (let i = 0; i < recentHistory.length; i++) {
      xValues.push(i)
    }
    
    // Simple linear regression calculation
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length
    const yMean = recentHistory.reduce((a, b) => a + b, 0) / recentHistory.length
    
    let numerator = 0
    let denominator = 0
    
    for (let i = 0; i < xValues.length; i++) {
      numerator += (xValues[i] - xMean) * (recentHistory[i] - yMean)
      denominator += Math.pow(xValues[i] - xMean, 2)
    }
    
    const slope = denominator ? numerator / denominator : 0
    const yIntercept = yMean - slope * xMean
    
    // Calculate R-squared
    let ssTotal = 0
    let ssResiduals = 0
    
    for (let i = 0; i < recentHistory.length; i++) {
      const predictedY = slope * xValues[i] + yIntercept
      ssResiduals += Math.pow(recentHistory[i] - predictedY, 2)
      ssTotal += Math.pow(recentHistory[i] - yMean, 2)
    }
    
    const rSquared = ssTotal ? 1 - (ssResiduals / ssTotal) : 0
    
    // Flat slope and poor fit indicate consolidation/random walk
    const isFlatSlope = Math.abs(slope) < 0.00001 // Very flat slope
    const isPoorFit = rSquared < 0.3 // Poor linear fit
    
    // APPROACH 5: Detect directional patterns
    // Consecutive higher highs or lower lows indicate trending, not consolidation
    let hasDirectionalMovement = false
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

  /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition */
  static overall () {
    const history = Four_Hour_Functions.priceHist
    const extendHist = Four_Hour_Functions.extendHist
    const price = Four_Hour_Functions.price
    const extendedHighs = Four_Hour_Functions.extendHigh 
    const extendedLows = Four_Hour_Functions.extendLow 
    
    // Stricter data requirements for 4H
    if (history.length < 30 || extendHist.length < 60) {
      return false
    }
    
    // Calculate some basic metrics to establish baseline rejection
    const recentVolatility = Four_Hour_Functions.calculateStdDev(history.slice(-20)) / 
                            (history.slice(-20).reduce((sum, p) => sum + p, 0) / 20)
    
    // Early rejection: If volatility is too high, don't trade
    if (recentVolatility > 0.012) {
      return false
    }
    
    // Get key levels with proper emphasis on higher timeframes
    const fourHourLevels = Four_Hour_Functions.finlevs || []
    const dailyLevels = Daily_Functions.finlevs || []
    const weeklyLevels = Array.isArray(Weekly_Functions.finlevs) ? Weekly_Functions.finlevs : []
    
    // Weight higher timeframes more heavily for 4H analysis
    const keyLevels = [...weeklyLevels, ...dailyLevels, ...fourHourLevels]
    
    // Calculate price range
    const extendHigh = Math.max(...extendedHighs)
    const extendLow = Math.min(...extendedLows)
    const priceRange = extendHigh - extendLow
    
    // Check if price is near key levels - important factor
    let nearKeyLevel = false
    let keyLevelStrength = 0
    const volatilityBuffer = Four_Hour_Functions.volatility() * 3.0
    
    for (const level of keyLevels) {
      const distancePercent = Math.abs(price - level) / price
      if (distancePercent < 0.004) { // 0.4% proximity for 4H
        nearKeyLevel = true
        keyLevelStrength = 1 - (distancePercent / 0.004) // 1 = very close, 0 = at threshold
        break
      }
    }
    
    // Stronger rejection if very close to multiple key levels
    if (keyLevelStrength > 0.8) {
      let multipleKeyLevels = 0
      for (const level of keyLevels) {
        const distancePercent = Math.abs(price - level) / price
        if (distancePercent < 0.005) {
          multipleKeyLevels++;
        }
      }
      
      if (multipleKeyLevels >= 2) {
        return false; // Reject if very close to multiple key levels
      }
    }
    
    // Get technical indicators specifically calibrated for 4H
    const rsi = Four_Hour_Functions.rsi()
    const trend = Four_Hour_Functions.trend()
    const macd = Four_Hour_Functions.macd()
    const roc = Four_Hour_Functions.roc()
    
    // If all indicators disagree, likely not a good setup
    if ((rsi && !trend && !macd && !roc) || 
        (!rsi && trend && !macd && !roc) || 
        (!rsi && !trend && macd && !roc) ||
        (!rsi && !trend && !macd && roc)) {
      return false; // Only one indicator agrees - not enough
    }
    
    // Calculate more detailed analysis with strict parameters
    const analysisScore = Four_Hour_Functions.simpleAnalysis(
      extendHist.slice(-40),
      priceRange,
      extendedHighs.slice(-40),
      extendedLows.slice(-40)
    )
    
    // Check for consolidation - don't trade in unclear markets
    if (Four_Hour_Functions.consolidationtwo()) {
      if (analysisScore < 0.7) { // Must have very strong signal to trade in consolidation
        return false;
      }
    }
    
    // Create multiple distinct qualification paths
    const hasKeyLevelSetup = nearKeyLevel && analysisScore > 0.5 && 
                           ((rsi && trend) || (macd && roc))
                           
    const hasTechnicalSetup = (rsi && trend && macd) && analysisScore > 0.4
    
    const hasStrongAnalysis = analysisScore > 0.75 && (rsi || trend) && (macd || roc)
    
    // Add some natural variation based on price position
    const pricePositionInRange = (price - extendLow) / (extendHigh - extendLow)
    const middleRangeDiscount = Math.abs(pricePositionInRange - 0.5) < 0.2 ? 0.7 : 1.0
    
    // Calculate final score
    let finalScore = 0
    if (hasKeyLevelSetup) finalScore += 0.6
    if (hasTechnicalSetup) finalScore += 0.5
    if (hasStrongAnalysis) finalScore += 0.7
    
    // Apply position discount (less likely to trade in middle of range)
    finalScore *= middleRangeDiscount
    
    // Apply small randomization (8% random factor)
    const randomFactor = Math.random() < 0.08 ? -0.2 : 0.1
    finalScore += randomFactor
    
    // Return true only if final score exceeds threshold
    // This will ensure much less frequent true returns
    return finalScore >= 0.65;
  }

  // New simpler analysis function
  static simpleAnalysis(extendedHistory, priceRange, extendedHighs, extendedLows) {
    const price = Four_Hour_Functions.price
    
    // Find recent price patterns - use more bars for 4H timeframe
    const recentHistory = extendedHistory.slice(-25) // Increased from 20
    const recentHighs = extendedHighs.slice(-25)
    const recentLows = extendedLows.slice(-25)
    
    // Calculate recent volatility - adjusted sensitivity for 4H
    let volatility = 0
    for (let i = 1; i < recentHistory.length; i++) {
      volatility += Math.abs(recentHistory[i] - recentHistory[i-1]) / recentHistory[i-1]
    }
    volatility = volatility / (recentHistory.length - 1)
    
    // Price pattern analysis - last 3 candles (12 hours)
    const lastPrice = recentHistory[recentHistory.length - 1]
    const secondLastPrice = recentHistory[recentHistory.length - 2]
    const thirdLastPrice = recentHistory[recentHistory.length - 3]
    
    // Candle pattern analysis - more meaningful for 4H
    const lastCandleRange = recentHighs[recentHighs.length - 1] - recentLows[recentLows.length - 1]
    const avgCandleRange = priceRange / extendedHistory.length * 12 // Adjusted multiplier
    
    // Start with neutral score
    let score = 0.5
    
    // 1. Volatility check - adjusted thresholds for 4H
    if (volatility < 0.004) { // Lower threshold for 4H
      score += 0.18 // Increased weight
    } else if (volatility > 0.012) { // Higher threshold for 4H
      score -= 0.12
    }
    
    // 2. Recent price action - 4H patterns are more meaningful
    const isReversal = (lastPrice > secondLastPrice && secondLastPrice < thirdLastPrice) || 
                    (lastPrice < secondLastPrice && secondLastPrice > thirdLastPrice)
    
    if (isReversal) {
      score += 0.18 // Increased weight for 4H
    }
    
    // 3. Candle size check - 4H candles more significant
    if (lastCandleRange > avgCandleRange * 1.7) { // Increased threshold
      score += 0.12 // Increased weight
    }
    
    // 4. Moving average analysis - 4H has stronger MA influence
    const sma10 = recentHistory.slice(-10).reduce((sum, price) => sum + price, 0) / 10
    const priceDistanceFromSMA = Math.abs(lastPrice - sma10) / sma10
    
    if (priceDistanceFromSMA < 0.002) { // Tighter threshold for 4H
      score += 0.12 // Increased weight
    } else if (priceDistanceFromSMA > 0.015) { // Higher threshold for 4H
      score += 0.08 // Increased impact
    }
    
    // 5. Check for higher highs or lower lows (trend strength)
    let higherHighs = 0
    let lowerLows = 0
    
    for (let i = 2; i < recentHighs.length; i++) {
      if (recentHighs[i] > recentHighs[i-1]) higherHighs++
      if (recentLows[i] < recentLows[i-1]) lowerLows++
    }
    
    // Strong trend in either direction - 4H trends are more meaningful
    if (higherHighs > 6 || lowerLows > 6) { // Lower threshold for 4H
      score += 0.15 // Increased weight
    }
    
    // Add market-specific bias
    const instrument = Four_Hour_Nexus.pair
    if (instrument && (instrument.includes('JPY') || instrument.includes('GBP'))) {
      // These pairs often show clearer patterns on 4H
      score += 0.08 // Increased weight
    }
    
    // Ensure the score stays between 0 and 1
    return Math.max(0, Math.min(1, score))
  }

  // Keep the existing analysis function for compatibility, but simplify it
  static analysis(cases, extendedhistory, pricerange, extendedHighs, extendedLows, keyLevels) {
    // Use the simpler analysis function
    const analysisScore = Four_Hour_Functions.simpleAnalysis(extendedhistory, pricerange, extendedHighs, extendedLows)
    
    // Convert to boolean with a threshold that will return true ~40% of the time
    return analysisScore > 0.55
  }

  /** Do past Analysis to see if this is a good trade, based on static overall() method */
  static analysis(cases, extendedhistory, pricerange, extendedHighs, extendedLows, keyLevels) {
    // Calculate the price and get recent history
    const price = Four_Hour_Functions.price
    
    // Filter key levels to only consider those within a reasonable range of current price
    // Make this range tighter to be more selective
    const relevantKeyLevels = keyLevels.filter(level => {
      return Math.abs(price - level) / price < 0.02 // Changed from 0.03 to 0.02
    })
    
    // If no relevant key levels, return false
    if (relevantKeyLevels.length === 0) {
      return false
    }
    
    // Find the closest key level
    let closestLevel = relevantKeyLevels[0]
    let minDistance = Math.abs(price - closestLevel)
    
    for (const level of relevantKeyLevels) {
      const distance = Math.abs(price - level)
      if (distance < minDistance) {
        minDistance = distance
        closestLevel = level
      }
    }
    
    // Create price range around the key level
    const buffer = pricerange * 0.02 // Reduced buffer from 0.03 to 0.02
    const priceMin = closestLevel - buffer
    const priceMax = closestLevel + buffer
    
    // Count historical instances where price was in this range
    let instances = 0
    let rejections = 0
    
    for (let i = 0; i < extendedhistory.length; i++) {
      const historicalPrice = extendedhistory[i]
      
      // Check if price was in the range
      if (historicalPrice >= priceMin && historicalPrice <= priceMax) {
        instances++
        
        // Check if this was a rejection (price moved away from the level)
        if (i < extendedhistory.length - 1) {
          const nextPrice = extendedhistory[i + 1]
          const distanceToLevel = Math.abs(historicalPrice - closestLevel)
          const nextDistanceToLevel = Math.abs(nextPrice - closestLevel)
          
          // If price moved away from the level, count as rejection
          if (nextDistanceToLevel > distanceToLevel * 1.2) { // Made stricter (from 1.1 to 1.2)
            rejections++
          }
        }
      }
    }
    
    // Check for high volatility periods
    const highsInRange = extendedHighs.filter(high => high >= priceMin && high <= priceMax).length
    const lowsInRange = extendedLows.filter(low => low >= priceMin && low <= priceMax).length
    
    // Create a volatility factor based on candle penetration
    const volatilityFactor = (highsInRange + lowsInRange) / extendedHighs.length
    
    // Check if there are enough historical instances and enough rejections
    // Make this more stringent to get more false results
    const sufficientData = instances >= cases + 2 // Increased from cases to cases + 2
    const significantRejections = rejections >= cases * 0.6 // Increased from 0.5 to 0.6
    const lowVolatility = volatilityFactor < 0.3 // Reduced from 0.4 to 0.3
    
    // Add a positional context check
    const positionCheck = Four_Hour_Functions.checkPricePosition(price, extendedhistory, closestLevel)
    
    // Combine all factors - require more conditions to return true
    return sufficientData && significantRejections && lowVolatility && positionCheck
  }

  // Helper function to check if price is in a favorable position relative to the key level
  static checkPricePosition(price, history, keyLevel) {
    // Get recent price movement (last 10 candles)
    const recentPrices = history.slice(-10)
    
    // Check if price is approaching the key level or bouncing off it
    const isApproaching = recentPrices.every((p, i, arr) => {
      if (i === 0) return true
      
      // Price is above key level and moving down toward it
      if (price > keyLevel) {
        return p <= arr[i - 1]
      }
      // Price is below key level and moving up toward it
      else {
        return p >= arr[i - 1]
      }
    })
    
    // Check if price recently reversed near the key level
    const distanceToLevel = Math.abs(price - keyLevel)
    const averageMove = Four_Hour_Functions.calculateAverageMove(recentPrices)
    
    // Price reversed within average move distance of the key level
    const reversedNearLevel = distanceToLevel < averageMove * 1.5
    
    // Add a momentum condition using ROC (Rate of Change)
    const roc = Four_Hour_Functions.roc()
    
    // Return true only if price is in a favorable position
    return (isApproaching || reversedNearLevel) && roc
  }

  // Helper function to calculate average price movement
  static calculateAverageMove(prices) {
    let totalMove = 0
    for (let i = 1; i < prices.length; i++) {
      totalMove += Math.abs(prices[i] - prices[i - 1])
    }
    return totalMove / (prices.length - 1)
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
        correlation += recentPrices[i] * recentPrices[i + lag]
        validPairs++
      }
      
      correlation = correlation / validPairs
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation
        dominantCycle = lag
      }
    }
    
    // SECTION 3: VOLATILITY MEASUREMENT - specialized for intraday
    // Calculate absolute percentage changes
    const absChanges = changes.map(c => Math.abs(c))
    const avgChange = absChanges.reduce((sum, c) => sum + c, 0) / absChanges.length
    const stdDevChanges = Math.sqrt(
      absChanges.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / absChanges.length
    )
    
    // SECTION 4: DIRECTIONALITY ANALYSIS
    // Calculate directional consistency
    let ups = 0, downs = 0
    for (const change of changes) {
      if (change > 0) ups++
      else if (change < 0) downs++
    }
    const directionBias = Math.abs(ups - downs) / changes.length
    
    // SECTION 5: PATTERN RECOGNITION
    // Check for repeating patterns within the dominant cycle
    let patternStrength = 0
    if (dominantCycle > 0) {
      const patterns = []
      for (let i = 0; i < recentPrices.length - dominantCycle; i++) {
        const pattern = []
        for (let j = 0; j < dominantCycle; j++) {
          pattern.push(recentPrices[i + j])
        }
        patterns.push(pattern)
      }
      
      // Compare patterns for similarity
      if (patterns.length >= 2) {
        let similaritySum = 0
        let comparisons = 0
        
        for (let i = 0; i < patterns.length - 1; i++) {
          for (let j = i + 1; j < patterns.length; j++) {
            let similarity = 0
            for (let k = 0; k < dominantCycle; k++) {
              similarity += 1 - Math.abs(
                (patterns[i][k] - patterns[j][k]) / Math.max(patterns[i][k], patterns[j][k])
              )
            }
            similarity /= dominantCycle
            similaritySum += similarity
            comparisons++
          }
        }
        
        patternStrength = comparisons > 0 ? similaritySum / comparisons : 0
      }
    }
    
    // SECTION 6: DECISION LOGIC
    // Consolidation indicators
    const isRangeTightening = recentRange < olderRange
    const isLowVolatility = avgChange < 0.001 // 0.1% average change threshold
    const hasConsistentCycle = dominantCycle > 0 && patternStrength > 0.7
    const isNonDirectional = directionBias < 0.3
    
    // Combine factors (at least 3 of 4 conditions must be met)
    let consolidationScore = 0
    if (isRangeTightening) consolidationScore++
    if (isLowVolatility) consolidationScore++
    if (hasConsistentCycle) consolidationScore++
    if (isNonDirectional) consolidationScore++
    
    return consolidationScore >= 3
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
    const history = Four_Hour_Functions.priceHist
    const highs = Four_Hour_Functions.highs 
    const lows = Four_Hour_Functions.lows 
    const price = Four_Hour_Functions.getPrice()
    
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
      smaller.push(price - Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Four_Hour_Functions.pipreverse(price, Four_Hour_Functions.pipdiffy(price, Four_Hour_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    Four_Hour_Nexus.support = support
    Four_Hour_Nexus.resistance = resistance
    Four_Hour_Nexus.finlevs = finalLevs
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

  /**
   * Advanced consolidation detection using cycle analysis and adaptive thresholds
   * Designed to complement consolidationtwo() with a strict, non-redundant approach
   */
  static consolidation() {
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
    
    // CRITICAL CONDITION: Disqualify if market shows clear trending behavior
    if (maxConsecutive >= 5) {
      return false // Trending market with 5+ consecutive moves in same direction
    }
    
    // CRITICAL CONDITION: Disqualify if recent volatility is significantly higher than historical
    const volatilityExpanding = normalizedAtr > 0.0025 && recentRange > olderRange * 1.3
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
    if (Four_Hour_Nexus.pot_buy) {
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
      Four_Hour_Nexus.sl = newsl
    } if (Four_Hour_Nexus.pot_sell) {
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
      Four_Hour_Nexus.sl = newsl
    }
    return finaldiff
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

  

  /* Add Key Part That the Levels Must Repeat 3x */
  static supreslevs () {
    // Get price history data
    const history = Daily_Functions.priceHist
    const highs = Daily_Functions.highs 
    const lows = Daily_Functions.lows 
    const price = Daily_Functions.getPrice()
    
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
      smaller.push(price - Daily_Functions.pipreverse(price, Daily_Functions.pipdiffy(price, Daily_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Daily_Functions.pipreverse(price, Daily_Functions.pipdiffy(price, Daily_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    Daily_Functions.support = support
    Daily_Functions.resistance = resistance
    Daily_Functions.finlevs = finalLevs
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

  // Add this stoploss method to the Daily_Functions class
  static stoploss() {
    const history = Daily_Functions.priceHist
    const price = Daily_Functions.price
    
    // Similar implementation to existing stoploss functions
    const histLen = history.length
    if (histLen < 15) return 0;
    
    const recentCandles = history.slice(-15)
    const volatility = recentCandles.reduce((acc, val, i, arr) => {
      if (i === 0) return acc
      return acc + Math.abs(val - arr[i-1])
    }, 0) / (recentCandles.length - 1)
    
    // Calculate a reasonable stop loss based on recent volatility
    return volatility * 2.5
  }

  // Add this method to the Daily_Functions class
  static pipdiffy(price, num1) {
    // Calculate the absolute difference between two price values
    const diff = Math.abs(price - num1)
    
    // Convert the difference to pips using the multiplier
    const pipValue = diff * Daily_Functions.multiplier
    
    // Return the pip value
    return pipValue
  }

  // Fix #1: Add the missing pipreverse method to Daily_Functions class
  // Add this somewhere in the Daily_Functions class
  static pipreverse(num, num2) {
    const usedmultiplier = Daily_Functions.multiplier
    let returnedprice = 0
    
    // If num2 is provided, it's the custom multiplier
    const actualMultiplier = num2 || usedmultiplier
    
    if (actualMultiplier === 0) {
      returnedprice = num
    } else {
      returnedprice = num / actualMultiplier
    }
    
    return returnedprice
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
    if (Four_Hour_Nexus.pot_buy) {
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
      Four_Hour_Nexus.sl = newsl
    } if (Four_Hour_Nexus.pot_sell) {
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
      Four_Hour_Nexus.sl = newsl
    }
    return finaldiff
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

  /* Add Key Part That the Levels Must Repeat 3x */
  static supreslevs () {
    // Get price history data
    const history = Weekly_Functions.priceHist
    const highs = Weekly_Functions.highs 
    const lows = Weekly_Functions.lows 
    const price = Weekly_Functions.getPrice()
    
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
      smaller.push(price - Weekly_Functions.pipreverse(price, Weekly_Functions.pipdiffy(price, Weekly_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Weekly_Functions.pipreverse(price, Weekly_Functions.pipdiffy(price, Weekly_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    Weekly_Functions.support = support
    Weekly_Functions.resistance = resistance
    Weekly_Functions.finlevs = finalLevs
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

  // Add this method to the One_Hour_Functions class
  static priceZones() {
    // Similar implementation to Four_Hour_Functions.priceZones
    const biggersupres = One_Hour_Functions.supreslevs()
    return biggersupres
  }

  // Add the missing supreslevs method to One_Hour_Functions class using the updated version
  static supreslevs() {
    // Get price history data
    const history = One_Hour_Functions.priceHist
    const highs = One_Hour_Functions.highs 
    const lows = One_Hour_Functions.lows 
    const price = One_Hour_Functions.price
    
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
    
    // Method 3: Add recent significant price levels
    if (highs.length > 0) {
      levels.push(highs[highs.length - 1]) // Most recent high
    }
    if (lows.length > 0) {
      levels.push(lows[lows.length - 1]) // Most recent low
    }
    
    // Method 4: Add round numbers as psychological levels
    // Find appropriate decimal places based on price magnitude
    const priceMagnitude = Math.floor(Math.log10(price))
    for (let i = -2; i <= priceMagnitude + 1; i++) {
      const roundBase = Math.pow(10, i)
      const roundLevel = Math.round(price / roundBase) * roundBase
      levels.push(roundLevel)
      
      // Add half-levels as well
      levels.push(roundLevel + roundBase / 2)
      levels.push(roundLevel - roundBase / 2)
    }
    
    // Consolidate and filter levels
    const consolidatedLevels = []
    const tolerance = (ceiling - floor) * 0.005 // 0.5% of range as tolerance
    
    // Group nearby levels
    for (const level of levels) {
      let found = false
      for (let i = 0; i < consolidatedLevels.length; i++) {
        if (Math.abs(consolidatedLevels[i] - level) < tolerance) {
          // Update existing level with weighted average
          consolidatedLevels[i] = (consolidatedLevels[i] * 2 + level) / 3
          found = true
          break
        }
      }
      if (!found) {
        consolidatedLevels.push(level)
      }
    }
    
    // Filter levels that are too close to current price (might be unreliable)
    const minDistance = (ceiling - floor) * 0.01 // 1% of range as minimum distance
    const filteredLevels = consolidatedLevels.filter(level => 
      Math.abs(level - price) > minDistance
    )
    
    // Sort levels by distance from current price
    filteredLevels.sort((a, b) => 
      Math.abs(a - price) - Math.abs(b - price)
    )
    
    // Return top levels (most significant ones)
    return filteredLevels.slice(0, 10)
  }

  // Add the missing pipreverse method to Daily_Functions class
  static pipreverse(num, num2) {
    // Implementation based on Four_Hour_Functions.pipreverse
    const usedmultiplier = Daily_Functions.multiplier
    let returnedprice = 0
    
    // If num2 is provided, it's the custom multiplier
    const actualMultiplier = num2 || usedmultiplier
    
    if (actualMultiplier === 0) {
      returnedprice = num
    } else {
      returnedprice = num / actualMultiplier
    }
    
    return returnedprice
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
    const normalizedTR = avgTR / recentHistory[recentHistory.length - 1]
    
    // Decreasing volatility indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedTR < 0.005 // 0.5% threshold
    
    // APPROACH 3: Price range analysis
    // Calculate recent price range as percentage of price
    const rangePercent = (Math.max(...recentHighs) - Math.min(...recentLows)) / 
                        recentHistory[recentHistory.length - 1]
    
    const isNarrowRange = rangePercent < 0.02 // 2% total range threshold
    
    // Calculate standard deviation of close prices
    const sum = recentHistory.reduce((a, b) => a + b, 0)
    const mean = sum / recentHistory.length
    const squaredDiffs = recentHistory.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    const stdDev = Math.sqrt(avgSquaredDiff)
    const coefficientOfVariation = stdDev / mean
    
    const isLowDeviation = coefficientOfVariation < 0.01 // 1% threshold
    
    // APPROACH 4: Linear regression analysis
    // Calculate regression slope and R-squared
    let xValues = []
    for (let i = 0; i < recentHistory.length; i++) {
      xValues.push(i)
    }
    
    // Simple linear regression calculation
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length
    const yMean = recentHistory.reduce((a, b) => a + b, 0) / recentHistory.length
    
    let numerator = 0
    let denominator = 0
    
    for (let i = 0; i < xValues.length; i++) {
      numerator += (xValues[i] - xMean) * (recentHistory[i] - yMean)
      denominator += Math.pow(xValues[i] - xMean, 2)
    }
    
    const slope = denominator ? numerator / denominator : 0
    const yIntercept = yMean - slope * xMean
    
    // Calculate R-squared
    let ssTotal = 0
    let ssResiduals = 0
    
    for (let i = 0; i < recentHistory.length; i++) {
      const predictedY = slope * xValues[i] + yIntercept
      ssResiduals += Math.pow(recentHistory[i] - predictedY, 2)
      ssTotal += Math.pow(recentHistory[i] - yMean, 2)
    }
    
    const rSquared = ssTotal ? 1 - (ssResiduals / ssTotal) : 0
    
    // Flat slope and poor fit indicate consolidation/random walk
    const isFlatSlope = Math.abs(slope) < 0.00001 // Very flat slope
    const isPoorFit = rSquared < 0.3 // Poor linear fit
    
    // APPROACH 5: Detect directional patterns
    // Consecutive higher highs or lower lows indicate trending, not consolidation
    let hasDirectionalMovement = false
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
    const normalizedTR = avgTR / recentHistory[recentHistory.length - 1]
    
    // Decreasing volatility indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedTR < 0.005 // 0.5% threshold
    
    // APPROACH 3: Price range analysis
    // Calculate recent price range as percentage of price
    const rangePercent = (Math.max(...recentHighs) - Math.min(...recentLows)) / 
                        recentHistory[recentHistory.length - 1]
    
    const isNarrowRange = rangePercent < 0.02 // 2% total range threshold
    
    // Calculate standard deviation of close prices
    const sum = recentHistory.reduce((a, b) => a + b, 0)
    const mean = sum / recentHistory.length
    const squaredDiffs = recentHistory.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    const stdDev = Math.sqrt(avgSquaredDiff)
    const coefficientOfVariation = stdDev / mean
    
    const isLowDeviation = coefficientOfVariation < 0.01 // 1% threshold
    
    // APPROACH 4: Linear regression analysis
    // Calculate regression slope and R-squared
    let xValues = []
    for (let i = 0; i < recentHistory.length; i++) {
      xValues.push(i)
    }
    
    // Simple linear regression calculation
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length
    const yMean = recentHistory.reduce((a, b) => a + b, 0) / recentHistory.length
    
    let numerator = 0
    let denominator = 0
    
    for (let i = 0; i < xValues.length; i++) {
      numerator += (xValues[i] - xMean) * (recentHistory[i] - yMean)
      denominator += Math.pow(xValues[i] - xMean, 2)
    }
    
    const slope = denominator ? numerator / denominator : 0
    const yIntercept = yMean - slope * xMean
    
    // Calculate R-squared
    let ssTotal = 0
    let ssResiduals = 0
    
    for (let i = 0; i < recentHistory.length; i++) {
      const predictedY = slope * xValues[i] + yIntercept
      ssResiduals += Math.pow(recentHistory[i] - predictedY, 2)
      ssTotal += Math.pow(recentHistory[i] - yMean, 2)
    }
    
    const rSquared = ssTotal ? 1 - (ssResiduals / ssTotal) : 0
    
    // Flat slope and poor fit indicate consolidation/random walk
    const isFlatSlope = Math.abs(slope) < 0.00001 // Very flat slope
    const isPoorFit = rSquared < 0.3 // Poor linear fit
    
    // APPROACH 5: Detect directional patterns
    // Consecutive higher highs or lower lows indicate trending, not consolidation
    let hasDirectionalMovement = false
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

function testfourhour (data, price, instrument) {
  instrum = instrument;
  liveprice = price;
  // Assign to the global dataset variable
  dataset = data;
  Four_Hour_Nexus.controlMain();
  
  // If we have a potential buy signal
  if (Four_Hour_Nexus.pot_buy && !Four_Hour_Nexus.buy_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Four_Hour_Functions.supreslevs();
    Four_Hour_Functions.getPrice();
    Four_Hour_Functions.stoploss();
    Four_Hour_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Four_Hour_Nexus.sl.toFixed(5);
    const formattedTP = Four_Hour_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[FourHour] BUY SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('BUY', instrument, formattedSL, formattedTP, 0.04, 'Four_Hour algorithm signal', 'Four_Hour');
  }
  
  // If we have a potential sell signal
  if (Four_Hour_Nexus.pot_sell && !Four_Hour_Nexus.sell_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Four_Hour_Functions.supreslevs();
    Four_Hour_Functions.getPrice();
    Four_Hour_Functions.stoploss();
    Four_Hour_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Four_Hour_Nexus.sl.toFixed(5);
    const formattedTP = Four_Hour_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[FourHour] SELL SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('SELL', instrument, formattedSL, formattedTP, 0.04, 'Four_Hour algorithm signal', 'Four_Hour');
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
  testfourhour
};