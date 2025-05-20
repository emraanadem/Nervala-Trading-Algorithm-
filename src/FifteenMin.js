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

class Fifteen_Min_Nexus {
  pos = false
  buy_pos = false
  sell_pos = false
  wins = 0
  pot_buy = false
  pot_sell = false
  biggersupres = []
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
  biggersupres = []
  pchan = false
  pzone = false
  bigsupport = 0
  bigresistance = 0
  pair = ''
  backtest = false

  /** announce price zones and price channels */
  static announcer () {
    if (Fifteen_Min_Nexus.pzone == false && Fifteen_Min_Functions.priceZones() == true) {
      Fifteen_Min_Nexus.pzone = true
      console.log('Price Zone Identified')
    } if (Fifteen_Min_Nexus.pzone == true && Fifteen_Min_Functions.priceZones() == false) {
      Fifteen_Min_Nexus.pzone = false
    } if (Fifteen_Min_Nexus.pchan == false && Fifteen_Min_Functions.priceChannels() == true) {
      Fifteen_Min_Nexus.pchan = true
      console.log('Price Channel Identified')
    } if (Fifteen_Min_Nexus.pchan == true && Fifteen_Min_Functions.priceChannels() == false) {
      Fifteen_Min_Nexus.pchan = false
    }
  }

  /** stop loss for buys */
  static stopLossBuy () {
    if (Fifteen_Min_Functions.price <= Fifteen_Min_Nexus.sl) {
      Fifteen_Min_Nexus.closePosSL()
    }
  }

  /** stop loss for selling */
  static stopLossSell () {
    if (Fifteen_Min_Functions.price >= Fifteen_Min_Nexus.sl) {
      Fifteen_Min_Nexus.closePosSL()
    }
  }

  /** initiates the piplog for pipcounting */
  static piploginit () {
    Fifteen_Min_Nexus.piplog = [0, 0, 0]
  }

  /** pip logging method */
  static piplogger () {
    const piplogging = Fifteen_Min_Nexus.piplog
    if (Fifteen_Min_Nexus.buy_pos) {
      piplogging.push(Fifteen_Min_Functions.pipCountBuy(Fifteen_Min_Nexus.posprice, Fifteen_Min_Functions.price))
      Fifteen_Min_Nexus.bigpipprice = Math.max(...piplogging)
      Fifteen_Min_Nexus.piplog = piplogging
    }
    if (Fifteen_Min_Nexus.sell_pos) {
      piplogging.push(Fifteen_Min_Functions.pipCountSell(Fifteen_Min_Nexus.posprice, Fifteen_Min_Functions.price))
      Fifteen_Min_Nexus.bigpipprice = Math.max(...piplogging)
      Fifteen_Min_Nexus.piplog = piplogging
    }
  }

  /** take profit for buying */
  static takeProfitBuy () {
    if (Fifteen_Min_Functions.price >= Fifteen_Min_Nexus.tp) {
      if (Fifteen_Min_Functions.volatility() > 0.618) {
        if ((Fifteen_Min_Functions.price - Fifteen_Min_Nexus.tp) > (Fifteen_Min_Nexus.tp - Fifteen_Min_Nexus.tstoploss)) {
          if (Fifteen_Min_Nexus.tp < Fifteen_Min_Nexus.tptwo) {
            Fifteen_Min_Nexus.piploginit()
            Fifteen_Min_Nexus.posprice = Fifteen_Min_Nexus.tp
            Fifteen_Min_Nexus.tp = Fifteen_Min_Nexus.tptwo
            Fifteen_Min_Functions.tpvariation()
            console.log('pair: ' + Fifteen_Min_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Fifteen_Min_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Fifteen_Min_Nexus.tptwo))
          }
        }
      } else {
        Fifteen_Min_Nexus.closePosTP()
      }
    } else if (Fifteen_Min_Functions.price <= Fifteen_Min_Nexus.tstoploss) {
      Fifteen_Min_Nexus.closePosTP()
    } else if (Fifteen_Min_Functions.price == Fifteen_Min_Nexus.tptwo) {
      Fifteen_Min_Nexus.closePosTP()
    }
  }

  /** take profit for selling */
  static takeProfitSell () {
    if (Fifteen_Min_Functions.price <= Fifteen_Min_Nexus.tp) {
      if (Fifteen_Min_Functions.volatility() > 0.618) {
        if ((Fifteen_Min_Nexus.tp - Fifteen_Min_Functions.price) > (Fifteen_Min_Nexus.tstoploss - Fifteen_Min_Nexus.tp)) {
          if (Fifteen_Min_Nexus.tp < Fifteen_Min_Nexus.tptwo) {
            Fifteen_Min_Nexus.piploginit()
            Fifteen_Min_Nexus.posprice = Fifteen_Min_Nexus.tp
            Fifteen_Min_Nexus.tp = Fifteen_Min_Nexus.tptwo
            Fifteen_Min_Functions.tpvariation()
            console.log('pair: ' + Fifteen_Min_Nexus.pair)
            console.log('\nTarget Take Profit Has been Surpassed, Anticipating approaching higher level TPs. New Trade Information Loading...')
            console.log('New Target Take Profit: ' + String(Fifteen_Min_Nexus.tp))
            console.log('New Take Profit 2: ' + String(Fifteen_Min_Nexus.tptwo))
          }
        }
      } else {
        Fifteen_Min_Nexus.closePosTP()
      }
    } else if (Fifteen_Min_Functions.price >= Fifteen_Min_Nexus.tstoploss) {
      Fifteen_Min_Nexus.closePosTP()
    } else if (Fifteen_Min_Functions.price == Fifteen_Min_Nexus.tptwo) {
      Fifteen_Min_Nexus.closePosTP()
    }
  }

  /** stop loss defining method */
  static stoplossdef () {
    const stoploss = Fifteen_Min_Functions.stoploss()
    if (Fifteen_Min_Nexus.buy_pos) {
      Fifteen_Min_Nexus.sl = Fifteen_Min_Functions.price - stoploss
    }
    if (Fifteen_Min_Nexus.sell_pos) {
      Fifteen_Min_Nexus.sl = Fifteen_Min_Functions.price + stoploss
    }
  }

  /** define volatility for the system, tells me whether or not to alter trailing stop loss */
  static volatilitydef () {
    if (Fifteen_Min_Functions.volatility() > 0.618 && Fifteen_Min_Nexus.tstoplossinits && !Fifteen_Min_Nexus.tstoplossvoid) {
      Fifteen_Min_Nexus.tstoplossdefvol()
    }
  }

  /** initiate trailing stop loss */
  static tstoplossinit () {
    const stoploss = Fifteen_Min_Nexus.sldiff
    if (!Fifteen_Min_Nexus.tstop && !Fifteen_Min_Nexus.tstoplossinits && !Fifteen_Min_Nexus.tstoplossvoid) {
      if (Fifteen_Min_Nexus.buy_pos) {
        if (Fifteen_Min_Functions.price > Fifteen_Min_Nexus.posprice + 0.3 * stoploss) {
          Fifteen_Min_Nexus.tstoplossinits = true
          Fifteen_Min_Nexus.tstoplossdef()
        }
      }
      if (Fifteen_Min_Nexus.sell_pos) {
        if (Fifteen_Min_Functions.price < Fifteen_Min_Nexus.posprice - 0.3 * stoploss) {
          Fifteen_Min_Nexus.tstoplossinits = true
          Fifteen_Min_Nexus.tstoplossdef()
        }
      }
    }
  }

  /** trailing stop loss defining method for volatile trades, where it will make the tstop larger to give the code a
     * sort of "bubble" when trading so that you don't get stopped out of trades really early
     */
  static tstoplossdefvol () {
    Fifteen_Min_Nexus.sldiff = Fifteen_Min_Functions.stoploss()
    const stoploss = Fifteen_Min_Nexus.sldiff
    if (Fifteen_Min_Nexus.buy_pos) {
      if (Fifteen_Min_Functions.price > Fifteen_Min_Nexus.posprice + 0.3 * stoploss) {
        Fifteen_Min_Nexus.tstop = true
        Fifteen_Min_Nexus.tstoploss = Fifteen_Min_Nexus.posprice + (((Math.abs(Fifteen_Min_Functions.price - Fifteen_Min_Nexus.posprice)) * (Fifteen_Min_Functions.trailingsl())))
      }
    }
    if (Fifteen_Min_Nexus.sell_pos) {
      if (Fifteen_Min_Functions.price < Fifteen_Min_Nexus.posprice - 0.3 * stoploss) {
        Fifteen_Min_Nexus.tstop = true
        Fifteen_Min_Nexus.tstoploss = Fifteen_Min_Nexus.posprice - (((Math.abs(Fifteen_Min_Functions.price - Fifteen_Min_Nexus.posprice)) * (Fifteen_Min_Functions.trailingsl())))
      }
    }
  }

  /** sort of checks and balances method, where the trailing stop loss is checked for and adjusted, and therefore reset depending on the price and volatility */
  static tstoplosscheck () {
    const tstoploss = Fifteen_Min_Nexus.sldiff
    if (Fifteen_Min_Nexus.buy_pos) {
      if (Fifteen_Min_Functions.price < Fifteen_Min_Nexus.posprice + 0.3 * tstoploss) {
        Fifteen_Min_Nexus.tstoplossvoid = true
      } else {
        Fifteen_Min_Nexus.tstoplossvoid = false
        Fifteen_Min_Nexus.volatilitydef()
        Fifteen_Min_Nexus.tstoplossinit()
      }
    }
    if (Fifteen_Min_Nexus.sell_pos) {
      if (Fifteen_Min_Functions.price > Fifteen_Min_Nexus.posprice - 0.3 * tstoploss) {
        Fifteen_Min_Nexus.tstoplossvoid = true
      } else {
        Fifteen_Min_Nexus.tstoplossvoid = false
        Fifteen_Min_Nexus.volatilitydef()
        Fifteen_Min_Nexus.tstoplossinit()
      }
    }
  }

  /** method that, if the price movement is not too volatile, will reset trailing stop loss based on given parameters */
  static tstoplosscont () {
    if (Fifteen_Min_Functions.volatility() < 0.618 && Fifteen_Min_Nexus.tstoplossinits && !Fifteen_Min_Nexus.tstoplossvoid) {
      Fifteen_Min_Nexus.sldiff = Fifteen_Min_Functions.stoploss()
      const stoploss = Fifteen_Min_Nexus.sldiff
      if (Fifteen_Min_Nexus.buy_pos) {
        if (Fifteen_Min_Functions.price > Fifteen_Min_Nexus.posprice + 0.3 * stoploss) {
          Fifteen_Min_Nexus.tstoploss = Fifteen_Min_Nexus.posprice + Fifteen_Min_Functions.pipreverse(Fifteen_Min_Nexus.posprice, 0.618 * Fifteen_Min_Nexus.bigpipprice)
        }
      }
      if (Fifteen_Min_Nexus.sell_pos) {
        if (Fifteen_Min_Functions.price < Fifteen_Min_Nexus.posprice - 0.3 * stoploss) {
          Fifteen_Min_Nexus.tstoploss = Fifteen_Min_Nexus.posprice - Fifteen_Min_Functions.pipreverse(Fifteen_Min_Nexus.posprice, 0.618 * Fifteen_Min_Nexus.bigpipprice)
        }
      }
    }
  }

  /** method that defines trailing stop loss for the system to begin with trailing stop loss */
  static tstoplossdef () {
    Fifteen_Min_Nexus.sldiff = Fifteen_Min_Functions.stoploss()
    const stoploss = Fifteen_Min_Nexus.sldiff
    if (Fifteen_Min_Nexus.buy_pos) {
      if (Fifteen_Min_Functions.price > Fifteen_Min_Nexus.posprice + 0.3 * stoploss) {
        Fifteen_Min_Nexus.tstop = true
        Fifteen_Min_Nexus.tstoploss = Fifteen_Min_Nexus.posprice + Fifteen_Min_Functions.pipreverse(Fifteen_Min_Nexus.posprice, 0.618 * Fifteen_Min_Nexus.bigpipprice)
      }
    }
    if (Fifteen_Min_Nexus.sell_pos) {
      if (Fifteen_Min_Functions.price < Fifteen_Min_Nexus.posprice - 0.3 * stoploss) {
        Fifteen_Min_Nexus.tstop = true
        Fifteen_Min_Nexus.tstoploss = Fifteen_Min_Nexus.posprice - Fifteen_Min_Functions.pipreverse(Fifteen_Min_Nexus.posprice, 0.618 * Fifteen_Min_Nexus.bigpipprice)
      }
    }
  }

  /* FOR STATIC BUY AND STATIC SELL MAKE SURE TO CHANGE THE VALDIFF VALUE TO A VALUE THAT IS VARIABLE OF THE DIFFERENCE BETWEEN THE PRICE AND THE STOPLOSS! */

  /** initiates a buy signal */
  static buy () {
    Fifteen_Min_Functions.supreslevs()
    Fifteen_Min_Functions.getPrice()
    Fifteen_Min_Functions.stoploss()
    Fifteen_Min_Functions.tpvariation()
    if (!Fifteen_Min_Functions.rejectionzoning()) {
      if (Math.abs(Fifteen_Min_Functions.valdiff(Fifteen_Min_Functions.price, Fifteen_Min_Functions.closest(Fifteen_Min_Functions.price))) > 0.025) {
        Fifteen_Min_Nexus.tp = Fifteen_Min_Nexus.resistance
        Fifteen_Min_Nexus.pos = true
        Fifteen_Min_Nexus.buy_pos = true
        Fifteen_Min_Nexus.posprice = Fifteen_Min_Functions.price
        Fifteen_Min_Functions.stoploss()
        Fifteen_Min_Functions.tpvariation()
        console.log('pair: ' + Fifteen_Min_Nexus.pair)
        console.log('Open Buy Order on Fifteen Min')
        console.log('Entry Price: ' + String(Fifteen_Min_Nexus.posprice))
        console.log('Stop Loss: ' + String(Fifteen_Min_Nexus.sl))
        console.log('Target Take Profit: ' + String(Fifteen_Min_Nexus.tp))
        console.log('Take Profit 2: ' + String(Fifteen_Min_Nexus.tptwo))
    }
    sendSignal(
      'BUY',
      Fifteen_Min_Nexus.pair,
      Fifteen_Min_Nexus.sl,
      Fifteen_Min_Nexus.tp,
      0.01, // Smaller size for shorter timeframe
      'FifteenMin'
    );
  }}

  /** initiates a sell order */
  static sell () {
    Fifteen_Min_Functions.supreslevs()
    Fifteen_Min_Functions.getPrice()
    Fifteen_Min_Functions.stoploss()
    Fifteen_Min_Functions.tpvariation()
    if (!Fifteen_Min_Functions.rejectionzoning()) {
      if (Math.abs(Fifteen_Min_Functions.valdiff(Fifteen_Min_Functions.price, Fifteen_Min_Functions.closest(Fifteen_Min_Functions.price))) > 0.025) {
        Fifteen_Min_Nexus.tp = Fifteen_Min_Nexus.support
        Fifteen_Min_Nexus.pos = true
        Fifteen_Min_Nexus.sell_pos = true
        Fifteen_Min_Nexus.posprice = Fifteen_Min_Functions.price
        Fifteen_Min_Functions.stoploss()
        Fifteen_Min_Functions.tpvariation()
        console.log('pair: ' + Fifteen_Min_Nexus.pair)
        console.log('Open Sell Order on Fifteen Min')
        console.log('Entry Price: ' + String(Fifteen_Min_Nexus.posprice))
        console.log('Stop Loss: ' + String(Fifteen_Min_Nexus.sl))
        console.log('Target Take Profit: ' + String(Fifteen_Min_Nexus.tp))
        console.log('Take Profit 2: ' + String(Fifteen_Min_Nexus.tptwo))
    }
    sendSignal(
      'SELL',
      Fifteen_Min_Nexus.pair,
      Fifteen_Min_Nexus.sl,
      Fifteen_Min_Nexus.tp,
      0.01, // Smaller size for shorter timeframe
      'FifteenMin'
    );
  }}

  /** checks for price movement in lower periods to get better idea of the trend */
  static controlSmallerPeriod () {
    try {
      /* Confirm Trend w/ indicators and price movement */
      Five_Min_Functions.HistoryAssigner()
      Four_Hour_Functions.HistoryAssigner()
      Fifteen_Min_Functions.stoploss()
      Fifteen_Min_Functions.tpvariation()
      let buy = false
      let sell = false
      if (!Four_Hour_Functions.rejectionzoning() &&
            !Five_Min_Functions.consolidationtwo()) {
        if (Four_Hour_Functions.trend() && Five_Min_Functions.ema()) {
          if (Five_Min_Functions.trend() && Five_Min_Functions.macd() && Five_Min_Functions.obv()) {
            if (Five_Min_Functions.ema()) {
              if (Five_Min_Functions.rsi() && Five_Min_Functions.obv()) {
                buy = true
              }
            }
          }
        }
        if (!Four_Hour_Functions.trend() && !Five_Min_Functions.ema()) {
          if (!Five_Min_Functions.trend() && !Five_Min_Functions.macd() && !Five_Min_Functions.obv()) {
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
    let h = new Array()
    let i = new Array()
    h = Four_Hour_Functions.finlevs
    i = One_Hour_Functions.finlevs
    const totallevs = h.push(i)
    Fifteen_Min_Nexus.biggersupres = totallevs
    Fifteen_Min_Nexus.finlevs.concat(totallevs)
  } catch (error) {
    console.log(error)
  }
}

  /** main control method, takes control of the entire program and serves as the brain */
  static controlMain () {
    try {
      Fifteen_Min_Functions.HistoryAssigner()
      Fifteen_Min_Functions.ValueAssigner()
      Five_Min_Functions.HistoryAssigner()
      Four_Hour_Functions.HistoryAssigner()
      One_Hour_Functions.HistoryAssigner()
      Fifteen_Min_Functions.supreslevs()
      Four_Hour_Functions.supreslevs()
      One_Hour_Functions.supreslevs()
      Fifteen_Min_Nexus.controlSmallerPeriod()
      Fifteen_Min_Functions.stoploss()
      Fifteen_Min_Functions.getPrice()
      Fifteen_Min_Nexus.controlBiggerPeriod()
      if (!Fifteen_Min_Functions.consolidationtwo() && !Fifteen_Min_Functions.consolidation() && Fifteen_Min_Functions.overall() &&
            !Fifteen_Min_Functions.keylev()) {
        if (Fifteen_Min_Functions.ema()) {
          if (Fifteen_Min_Nexus.controlSmallerPeriod()[0] == true) {
            if (Fifteen_Min_Functions.trend() && Fifteen_Min_Functions.rsi() &&
                            Fifteen_Min_Functions.macd() && Fifteen_Min_Functions.roc() && Fifteen_Min_Functions.obv()) {
              if (!Fifteen_Min_Nexus.pos) {
                if (!Fifteen_Min_Nexus.buy_pos) { Fifteen_Min_Nexus.pot_buy = true }
                Fifteen_Min_Functions.stoploss()
                Fifteen_Min_Nexus.piploginit()
                Fifteen_Min_Nexus.buy()
              }
            }
          }
        }
        if (!Fifteen_Min_Functions.ema()) {
          if (Fifteen_Min_Nexus.controlSmallerPeriod()[1] == true) {
            if (!Fifteen_Min_Functions.trend() && !Fifteen_Min_Functions.rsi() &&
                            !Fifteen_Min_Functions.macd() && !Fifteen_Min_Functions.roc() && !Fifteen_Min_Functions.obv()) {
              if (!Fifteen_Min_Nexus.pos) {
                if (!Fifteen_Min_Nexus.sell_pos) { Fifteen_Min_Nexus.pot_sell = true }
                Fifteen_Min_Functions.stoploss()
                Fifteen_Min_Nexus.piploginit()
                Fifteen_Min_Nexus.sell()
              }
            }
          }
        }
      }
      if (Fifteen_Min_Nexus.pos && Fifteen_Min_Nexus.buy_pos) {
        Fifteen_Min_Nexus.piplogger()
        Fifteen_Min_Nexus.stopLossBuy()
        Fifteen_Min_Nexus.tstoplosscheck()
        Fifteen_Min_Nexus.tstoplosscont()
        Fifteen_Min_Nexus.takeProfitBuy()
      }
      if (Fifteen_Min_Nexus.pos && Fifteen_Min_Nexus.sell_pos) {
        Fifteen_Min_Nexus.piplogger()
        Fifteen_Min_Nexus.stopLossSell()
        Fifteen_Min_Nexus.tstoplosscheck()
        Fifteen_Min_Nexus.tstoplosscont()
        Fifteen_Min_Nexus.takeProfitSell()
      }
    } catch (error) {
      console.log(error)
    }
    /* figure out how to clear memory, and do so here after every iteration */
    /* memory issue solved: 4/20/22 */ }

  /** close position method for taking profit, and gives pip count and win/loss ratio */
  static closePosTP () {
    if (Fifteen_Min_Nexus.pos) {
      if (Fifteen_Min_Nexus.buy_pos) {
        Fifteen_Min_Nexus.buy_pos = false
        Fifteen_Min_Nexus.pos = false
        Fifteen_Min_Nexus.tstop = false
        Fifteen_Min_Nexus.tstoplossinits = false
        Fifteen_Min_Nexus.tstoplossvoid = false
        Fifteen_Min_Nexus.pchan = false
        Fifteen_Min_Nexus.pot_buy = false
        Fifteen_Min_Nexus.pzone = false
        Fifteen_Min_Nexus.wins += 1
        Fifteen_Min_Nexus.trades += 1
        Fifteen_Min_Nexus.piplog = [0, 0, 0]
        const pipchange = Fifteen_Min_Functions.pipCountBuy(Fifteen_Min_Nexus.posprice, Fifteen_Min_Functions.price)
        Fifteen_Min_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Fifteen_Min_Nexus.pair)
        console.log('Take Profit Hit on Fifteen Min')
        console.log(Fifteen_Min_Nexus.wins + ' Wins and     ' + Fifteen_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Fifteen_Min_Nexus.wins / Fifteen_Min_Nexus.trades)
        console.log('Pip Count: ' + Fifteen_Min_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Fifteen_Min_Nexus.pair,
          0,
          0,
          0.01,
          'FifteenMin'
        );
      }
      if (Fifteen_Min_Nexus.sell_pos) {
        Fifteen_Min_Nexus.sell_pos = false
        Fifteen_Min_Nexus.pos = false
        Fifteen_Min_Nexus.tstop = false
        Fifteen_Min_Nexus.pot_sell = false
        Fifteen_Min_Nexus.tstoplossinits = false
        Fifteen_Min_Nexus.tstoplossvoid = false
        Fifteen_Min_Nexus.pchan = false
        Fifteen_Min_Nexus.pzone = false
        Fifteen_Min_Nexus.wins += 1
        Fifteen_Min_Nexus.trades += 1
        Fifteen_Min_Nexus.piplog = [0, 0, 0]
        const pipchange = Fifteen_Min_Functions.pipCountSell(Fifteen_Min_Nexus.posprice, Fifteen_Min_Functions.price)
        Fifteen_Min_Nexus.pips += Math.abs(pipchange)
        console.log('pair: ' + Fifteen_Min_Nexus.pair)
        console.log('Take Profit Hit on Fifteen Min')
        console.log(Fifteen_Min_Nexus.wins + ' Wins and     ' + Fifteen_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Fifteen_Min_Nexus.wins / Fifteen_Min_Nexus.trades)
        console.log('Pip Count: ' + Fifteen_Min_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Fifteen_Min_Nexus.pair,
          0,
          0,
          0.01,
          'FifteenMin'
        );
      }
    }
  }

  /** close position method for stopping out of losses, also gives pip count and win/loss ratio */
  static closePosSL () {
    if (Fifteen_Min_Nexus.pos) {
      if (Fifteen_Min_Nexus.sell_pos) {
        Fifteen_Min_Nexus.sell_pos = false
        Fifteen_Min_Nexus.pos = false
        Fifteen_Min_Nexus.tstop = false
        Fifteen_Min_Nexus.pot_sell = false
        Fifteen_Min_Nexus.tstoplossinits = false
        Fifteen_Min_Nexus.tstoplossvoid = false
        Fifteen_Min_Nexus.pchan = false
        Fifteen_Min_Nexus.pzone = false
        Fifteen_Min_Nexus.losses += 1
        Fifteen_Min_Nexus.trades += 1
        Fifteen_Min_Nexus.piplog = [0, 0, 0]
        const pipchange = Fifteen_Min_Functions.pipCountSell(Fifteen_Min_Nexus.posprice, Fifteen_Min_Functions.price)
        Fifteen_Min_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Fifteen_Min_Nexus.pair)
        console.log('Stop Loss Hit on Fifteen Min')
        console.log(Fifteen_Min_Nexus.wins + ' Wins and     ' + Fifteen_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Fifteen_Min_Nexus.wins / Fifteen_Min_Nexus.trades)
        console.log('Pip Count: ' + Fifteen_Min_Nexus.pips)
        sendSignal(
          'CLOSE_SELL',
          Fifteen_Min_Nexus.pair,
          0,
          0,
          0.01,
          'FifteenMin'
        );
      }
      if (Fifteen_Min_Nexus.buy_pos) {
        Fifteen_Min_Nexus.buy_pos = false
        Fifteen_Min_Nexus.pos = false
        Fifteen_Min_Nexus.pot_buy = false
        Fifteen_Min_Nexus.tstop = false
        Fifteen_Min_Nexus.tstoplossinits = false
        Fifteen_Min_Nexus.tstoplossvoid = false
        Fifteen_Min_Nexus.pchan = false
        Fifteen_Min_Nexus.pzone = false
        Fifteen_Min_Nexus.losses += 1
        Fifteen_Min_Nexus.trades += 1
        Fifteen_Min_Nexus.piplog = [0, 0, 0]
        const pipchange = Fifteen_Min_Functions.pipCountBuy(Fifteen_Min_Nexus.posprice, Fifteen_Min_Functions.price)
        Fifteen_Min_Nexus.pips -= Math.abs(pipchange)
        console.log('pair: ' + Fifteen_Min_Nexus.pair)
        console.log('Stop Loss Hit on Fifteen Min')
        console.log(Fifteen_Min_Nexus.wins + ' Wins and     ' + Fifteen_Min_Nexus.losses + ' Losses')
        console.log('Win Ratio: ' + Fifteen_Min_Nexus.wins / Fifteen_Min_Nexus.trades)
        console.log('Pip Count: ' + Fifteen_Min_Nexus.pips)
        sendSignal(
          'CLOSE_BUY',
          Fifteen_Min_Nexus.pair,
          0,
          0,
          0.01,
          'FifteenMin'
        );
      }
    }
  }

  // Add a method for trailing stop modifications if applicable
  static updateTrailingStop() {
    if (Fifteen_Min_Nexus.tstop && Fifteen_Min_Nexus.pos) {
      sendSignal('FifteenMin', {
        action: 'MODIFY',
        symbol: Fifteen_Min_Nexus.pair,
        stopLoss: Fifteen_Min_Nexus.tstoploss,
        takeProfit: Fifteen_Min_Nexus.tp,
        reason: 'Trailing stop update from 15-min strategy'
      });
    }
  }
}

class Fifteen_Min_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  rejectionzones = new Array()
  extendHigh = []
  extendLow = []
  timeperiods = {}
  vals = []
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
    Fifteen_Min_Nexus.pair = instrum
    return instrum
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Fifteen_Min_Functions.instrument_name()
    Fifteen_Min_Functions.priceHist = dataset.Fifteen_Min.c
    Fifteen_Min_Functions.highs = dataset.Fifteen_Min.h
    Fifteen_Min_Functions.lows = dataset.Fifteen_Min.l
    Fifteen_Min_Functions.extendHist = dataset.Fifteen_Min_Extend.c
    Fifteen_Min_Functions.extendHigh = dataset.Fifteen_Min_Extend.h
    Fifteen_Min_Functions.extendLow = dataset.Fifteen_Min_Extend.l
  }

  /** load price from json file */
  static ValueAssigner () {
    Fifteen_Min_Functions.price = liveprice
  }

  /** second consolidation method, meant to strengthen consolidation identification */
  static consolidationtwo () {
    const history = Fifteen_Min_Functions.priceHist
    const highs = Fifteen_Min_Functions.highs 
    const lows = Fifteen_Min_Functions.lows 
    
    // Ensure we have valid arrays before proceeding
    if (!history || !highs || !lows || 
        history.length === 0 || highs.length === 0 || lows.length === 0) {
      return false;
    }
    
    const histmax = Math.max(...highs)
    const histmin = Math.min(...lows)
    const histdiff = histmax - histmin
    
    // Ensure we have enough data - stricter requirement
    const minDataPoints = 25
    if (history.length < minDataPoints) {
      return false; // Return false if not enough data to determine
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
    
    // Check if we have enough bollinger band data
    if (bollingerBands.length < 10) {
      return false;
    }
    
    // Calculate normalized Bollinger Band width
    const bandWidths = bollingerBands.map(band => (band.upper - band.lower) / band.middle)
    const recentBandWidths = bandWidths.slice(-5)
    const avgBandWidth = recentBandWidths.reduce((sum, width) => sum + width, 0) / recentBandWidths.length
    
    // Narrowing bands indicate consolidation
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.018 // Tighter threshold
    
    // APPROACH 2: True Range (volatility) analysis
    const trValues = tr.calculate({ 
      high: recentHighs, 
      low: recentLows, 
      close: recentClose, 
      period: 14 
    })
    
    // Check if we have enough TR data
    if (trValues.length < 5) {
      return false;
    }
    
    // Calculate average true range relative to price
    const recentTR = trValues.slice(-5)
    const avgTR = recentTR.reduce((sum, val) => sum + val, 0) / recentTR.length
    const normalizedTR = avgTR / recentHistory[recentHistory.length - 1]
    
    // Decreasing volatility indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedTR < 0.006 // Stricter threshold
    
    // APPROACH 3: Price range analysis
    // Calculate recent price range as percentage of price
    const rangePercent = (Math.max(...recentHighs) - Math.min(...recentLows)) / 
                        recentHistory[recentHistory.length - 1]
    
    const isNarrowRange = rangePercent < 0.018 // Stricter threshold
    
    // Calculate standard deviation of close prices
    const sum = recentHistory.reduce((a, b) => a + b, 0)
    const mean = sum / recentHistory.length
    const squaredDiffs = recentHistory.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    const stdDev = Math.sqrt(avgSquaredDiff)
    const coefficientOfVariation = stdDev / mean
    
    const isLowDeviation = coefficientOfVariation < 0.009 // Stricter threshold
    
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
    const isFlatSlope = Math.abs(slope) < 0.000008 * mean // Stricter threshold
    const isPoorFit = rSquared < 0.35 // Stricter threshold
    
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
    
    // APPROACH 6: Check for price acceleration
    let acceleration = 0;
    for (let i = 2; i < Math.min(5, recentHistory.length); i++) {
      const firstDiff = recentHistory[recentHistory.length - i + 1] - recentHistory[recentHistory.length - i];
      const secondDiff = recentHistory[recentHistory.length - i + 2] - recentHistory[recentHistory.length - i + 1];
      acceleration += Math.abs(secondDiff - firstDiff);
    }
    acceleration = acceleration / 3 / mean;
    
    // Acceleration indicates trending, not consolidation
    const isLowAcceleration = acceleration < 0.0008;
    
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
    
    // Direction factors
    if (!hasDirectionalMovement) consolidationScore++;
    if (isLowAcceleration) consolidationScore++;
    totalFactors += 2;
    
    // Calculate overall probability of consolidation
    const consolidationProbability = consolidationScore / totalFactors;
    
    // Stricter threshold for determining consolidation
    return consolidationProbability >= 0.65;
  }

  /** TP variation, helps change TP depending on volatility and price movement depending on whether or not the code has surpassed TP1 and
     * is about to hit TP2
     */
  static tpvariation () {
    const tp = Fifteen_Min_Nexus.tp
    
    // Ensure both arrays exist before trying to concatenate
    const finlevs = Fifteen_Min_Nexus.finlevs
    const biggersupres = Fifteen_Min_Nexus.biggersupres
    const values = finlevs.concat(biggersupres)
    
    const valdiffgreater = []
    const valdiffless = []
    let closesttp = 0
    let filteredvaldiff = []
    let nexttp = 0
    let referenceval = 0
    const num1 = Fifteen_Min_Nexus.price
    const volval = Fifteen_Min_Functions.volatility()
    
    // Ensure we have at least some values to work with
    if (values.length === 0) {
      // Add fallback values if none exist
      if (Fifteen_Min_Nexus.buy_pos) {
        return Fifteen_Min_Functions.price * 1.01; // 1% above current price
      } else if (Fifteen_Min_Nexus.sell_pos) {
        return Fifteen_Min_Functions.price * 0.99; // 1% below current price
      }
      return Fifteen_Min_Nexus.tp || Fifteen_Min_Functions.price; // Return existing TP or current price
    }
    
    if (Fifteen_Min_Nexus.buy_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 < values[item]) {
          valdiffgreater.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Fifteen_Min_Nexus.tp
      filteredvaldiff = [...new Set(valdiffgreater)]
      for (const valuers in filteredvaldiff) {
        referenceval = closesttp - num1
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Fifteen_Min_Nexus.tp = Fifteen_Min_Functions.price + (Math.abs(Fifteen_Min_Functions.price - Fifteen_Min_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Fifteen_Min_Functions.price)) {
          nexttp = Fifteen_Min_Functions.price + (Math.abs(Fifteen_Min_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Fifteen_Min_Functions.price + ((Fifteen_Min_Nexus.tp - Fifteen_Min_Functions.price) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Fifteen_Min_Functions.price)) {
          nexttp = Fifteen_Min_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Fifteen_Min_Functions.price + ((Fifteen_Min_Functions.tp - Fifteen_Min_Functions.price) * 1.382)
        }
      }
    }
    if (Fifteen_Min_Nexus.sell_pos) {
      for (let item = 0; item < values.length; item++) {
        if (num1 > values[item]) {
          valdiffless.push(Math.abs(num1 - values[item]))
        }
      }
      closesttp = Fifteen_Min_Nexus.tp
      filteredvaldiff = [...new Set(valdiffless)]
      for (const valuers in filteredvaldiff) {
        referenceval = num1 - closesttp
        if ((referenceval >= valuers)) {
          filteredvaldiff.splice(filteredvaldiff.indexOf(valuers), 1)
        }
      }
      if (volval > 0.618) {
        Fifteen_Min_Nexus.tp = Fifteen_Min_Functions.price - (Math.abs(Fifteen_Min_Functions.price - Fifteen_Min_Nexus.tp) * 1.382)
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Fifteen_Min_Functions.price)) {
          nexttp = Fifteen_Min_Functions.price - (Math.abs(Fifteen_Min_Functions.price - Math.min(...filteredvaldiff)) * 1.382)
        } else {
          nexttp = Fifteen_Min_Functions.price - ((Fifteen_Min_Functions.price - Fifteen_Min_Nexus.tp) * 1.618)
        }
      } else {
        if (Number.isFinite(Math.min(...filteredvaldiff)) && Math.min(...filteredvaldiff) < Infinity && Math.min(...filteredvaldiff) > 0 &&
                    !(Math.min(...filteredvaldiff) == Fifteen_Min_Functions.price)) {
          nexttp = Fifteen_Min_Functions.price + Math.min(...filteredvaldiff)
        } else {
          nexttp = Fifteen_Min_Functions.price - ((Fifteen_Min_Functions.price - Fifteen_Min_Nexus.tp) * 1.382)
        }
      }
    }
    Fifteen_Min_Nexus.tptwo = nexttp
  }

  /** fibonacci levels to be added to the program...
     * update 6/5/22 @ 4:43 PM: Adding identification of retracement origin point
    */
  static fib () {
    const recents = Fifteen_Min_Functions.recentHisto
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
    const currentprice = Fifteen_Min_Functions.price
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
    
    // Return false if we don't have enough data to analyze
    if (!extendedhistory || extendedhistory.length < 30) {
      return false;
    }
    
    // Define support/resistance levels from multiple timeframes for more robust rejection zones
    const onehourLevels = One_Hour_Functions.finlevs || []
    const fifteenMinLevels = Fifteen_Min_Nexus.finlevs || []
    const fourHourLevels = Four_Hour_Functions.finlevs || []
    const keyLevels = [...onehourLevels, ...fifteenMinLevels, ...fourHourLevels]
    
    // Calculate volatility to adjust buffer size dynamically
    const recentPrices = extendedhistory.slice(-50)
    const volatility = Four_Hour_Functions.volatility ? Four_Hour_Functions.volatility() : 0.05
    
    // Adjust buffer based on volatility - more volatile markets need wider buffers
    const max = Math.max(...extendedhistory)
    const min = Math.min(...extendedhistory)
    const priceRange = max - min
    const buffer = priceRange * Math.max(0.02, Math.min(0.07, volatility))
    
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
    
    // Detect if price is near a key level from any timeframe (adjusted threshold)
    let keyLevelProximity = false
    for (const level of keyLevels) {
      const distance = Math.abs(price - level) / price
      if (distance < 0.0012) { // Tighter threshold to allow more trades
        keyLevelProximity = true;
        break;
      }
    }
    
    // If no similar price points found or too few for analysis
    if (studylist.length < 4) {
      // More likely to return true if we don't have enough data points
      return !keyLevelProximity; 
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
    
    // Check if price is at extreme levels (high or low) in recent history
    const recentHighLow = recentPrices.slice(-30);
    const isAtExtremeLevel = price > (max - (priceRange * 0.15)) || price < (min + (priceRange * 0.15));
    
    // Technical indicators from other timeframes
    const hourlyTrend = One_Hour_Functions.trend ? One_Hour_Functions.trend() : null;
    
    // More nuanced decision making
    if (result) {
      // Analysis is positive - high confidence
      return true;
    } else if (!keyLevelProximity && studylist.length >= 8) {
      // Enough data points and not near key level - moderate confidence
      return true;
    } else if (!isAtExtremeLevel && hourlyTrend !== null && studylist.length >= 5) {
      // Not at extreme price levels and not near key level - lower confidence
      return true;
    }
    
    // Default to false for any other case
    return false;
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
      if (Fifteen_Min_Nexus.pot_buy) {
        if (Four_Hour_Functions.price < val) {
          diffs.push(val - Four_Hour_Functions.price)
        }
      }
      if (Fifteen_Min_Nexus.pot_sell) {
        if (Four_Hour_Functions.price > val) {
          diffs.push(Four_Hour_Functions.price - val)
        }
      }
    }
    if (Math.abs(Math.min(...diffs)) < Math.abs(Fifteen_Min_Functions.price - Fifteen_Min_Nexus.tp)) {
      Fifteen_Min_Nexus.pot_buy = false
      Fifteen_Min_Nexus.pot_sell = false
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
    Fifteen_Min_Functions.getPrice()
    if (Fifteen_Min_Functions.valdiff(Fifteen_Min_Functions.price, Four_Hour_Functions.closest(Fifteen_Min_Functions.price)) < 0.1) {
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
    const posdiff = Math.abs(Fifteen_Min_Nexus.posprice - Four_Hour_Functions.price)
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
    
    // Need enough data for analysis - return false if not enough data for proper analysis
    if (histLen < 20) return false
    
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
    
    // Balanced condition: Reject if strong directional trend is present
    if (maxConsecutive >= 5) {
      return false
    }
    
    // Balanced condition: Reject on high volatility expansion
    const volatilityExpanding = normalizedAtr > 0.003 && recentRange > olderRange * 1.4
    if (volatilityExpanding) {
      return false
    }
    
    // SECTION 5: PRICE SPIKES ANALYSIS
    // Detect outliers in price changes (spikes) that would disqualify consolidation
    const stdDevChanges = Math.sqrt(
      changes.reduce((sum, change) => sum + change * change, 0) / changes.length
    )
    
    let spikeCount = 0
    for (const change of changes) {
      // Balanced spike detection threshold 
      if (Math.abs(change) > stdDevChanges * 2.8) {
        spikeCount++
      }
    }
    
    // Balanced spike count threshold
    if (spikeCount > 3) {
      return false
    }
    
    // SECTION 6: DECISION FRAMEWORK
    // Balanced consolidation conditions
    const narrowRange = recentRange < 0.016
    const stableRange = Math.abs(recentRange - olderRange) / olderRange < 0.45
    const lowVolatility = normalizedAtr < 0.0025
    const goodCycleStrength = normCorrelation > 0.32
    
    // Count how many conditions are met
    let conditionsMet = 0
    if (narrowRange) conditionsMet++
    if (stableRange) conditionsMet++
    if (lowVolatility) conditionsMet++ 
    if (goodCycleStrength) conditionsMet++
    
    // Additional context-specific conditions with balanced thresholds
    const consistentStructure = maxConsecutive <= 4
    const limitedSpikes = spikeCount <= 2
    
    if (consistentStructure) conditionsMet++
    if (limitedSpikes) conditionsMet++
    
    // Balanced threshold based on overall volatility
    const requiredConditions = normalizedAtr < 0.0015 ? 3 : 4
    
    // Final balanced decision
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
    // Get price history data
    const history = Fifteen_Min_Functions.priceHist
    const highs = Fifteen_Min_Functions.highs 
    const lows = Fifteen_Min_Functions.lows 
    const price = Fifteen_Min_Functions.getPrice()
    
    // Ensure we have valid data
    if (!highs || !lows || !history || highs.length === 0 || lows.length === 0 || history.length === 0) {
      // Return fallback level
      Fifteen_Min_Functions.support = price * 0.995
      Fifteen_Min_Functions.resistance = price * 1.005
      return [price * 0.995, price * 1.005]
    }
    
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
      smaller.push(price - Fifteen_Min_Functions.pipreverse(price, Fifteen_Min_Functions.pipdiffy(price, Fifteen_Min_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Fifteen_Min_Functions.pipreverse(price, Fifteen_Min_Functions.pipdiffy(price, Fifteen_Min_Functions.stoploss())))
    }
    
    // Find closest support and resistance
    const smaller_diff = smaller.map(level => Math.abs(level - price))
    const larger_diff = larger.map(level => Math.abs(level - price))
    
    const supportIndex = smaller_diff.indexOf(Math.min(...smaller_diff))
    const resistanceIndex = larger_diff.indexOf(Math.min(...larger_diff))
    
    const support = smaller[supportIndex]
    const resistance = larger[resistanceIndex]
    
    // Store calculated levels
    Fifteen_Min_Functions.support = support
    Fifteen_Min_Functions.resistance = resistance
    Fifteen_Min_Nexus.finlevs = finalLevs
    
    return finalLevs
  }

  /** self explanatory, finds RSI and compares the last two */
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
    const values = Fifteen_Min_Nexus.finlevs.concat(Fifteen_Min_Nexus.biggersupres)
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

class One_Hour_Functions {
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
  extendHist = []
  extendHigh = []
  extendLow = []

  static HistoryAssigner () {
    const instrument = Fifteen_Min_Functions.instrument_name()
    One_Hour_Functions.priceHist = dataset.One_Hour.c
    One_Hour_Functions.highs = dataset.One_Hour.h
    One_Hour_Functions.lows = dataset.One_Hour.l
    One_Hour_Functions.extendHist = dataset.One_Hour_Extend.c
    One_Hour_Functions.extendHigh = dataset.One_Hour_Extend.h
    One_Hour_Functions.extendLow = dataset.One_Hour_Extend.l
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
      smaller.push(price - Fifteen_Min_Functions.pipreverse(price, Fifteen_Min_Functions.pipdiffy(price, Fifteen_Min_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Fifteen_Min_Functions.pipreverse(price, Fifteen_Min_Functions.pipdiffy(price, Fifteen_Min_Functions.stoploss())))
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
    
    return finalLevs
  }

  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      One_Hour_Functions.multiplier = 1000
    }
    // Calculate pip difference based on currency pair
    return Math.abs(num1 - num2) * One_Hour_Functions.multiplier
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

class Four_Hour_Functions {
  multiplier = 0
  priceHist = []
  extendHist = []
  rejectionzones = new Array()
  timeperiods = {}
  extendHigh = []
  extendLow = []
  resistance = 0
  support = 0
  vals = []
  price = 0
  maxes = []
  finlevs = []
  mins = []
  recentHisto = []
  highs = []
  lows = []

  /** load instrument name from json file */
  static instrument_name () {
    return Fifteen_Min_Functions.instrument_name()
  }

  /** load historical prices from json file */
  static HistoryAssigner () {
    const instrument = Four_Hour_Functions.instrument_name()
    Four_Hour_Functions.priceHist = dataset.Four_Hour.c
    Four_Hour_Functions.highs = dataset.Four_Hour.h
    Four_Hour_Functions.lows = dataset.Four_Hour.l
    if (dataset.Four_Hour_Extend) {
      Four_Hour_Functions.extendHist = dataset.Four_Hour_Extend.c
      Four_Hour_Functions.extendHigh = dataset.Four_Hour_Extend.h
      Four_Hour_Functions.extendLow = dataset.Four_Hour_Extend.l
    }
  }

  /** load price from json file */
  static ValueAssigner () {
    Four_Hour_Functions.price = liveprice
  }

  /**  Machine learning method used to determine past movement patterns at different prices, can help with stop loss and take profit definition */
  static overall () {
    // Get extended price history data and current price
    const extendedhistory = Four_Hour_Functions.extendHist
    const extendedHighs = Four_Hour_Functions.extendHigh 
    const extendedLows = Four_Hour_Functions.extendLow 
    const price = Four_Hour_Functions.price
    
    // Return false if we don't have enough data to analyze
    if (!extendedhistory || extendedhistory.length < 30) {
      return false;
    }
    
    // Define support/resistance levels from multiple timeframes for more robust rejection zones
    // Define support/resistance levels from multiple timeframes for more robust rejection zones
    const onehourLevels = One_Hour_Functions.finlevs
    const fifteenMinLevels = Fifteen_Min_Nexus.finlevs
    const fourHourLevels = Four_Hour_Functions.finlevs
    const keyLevels = [...onehourLevels, ...fifteenMinLevels, ...fourHourLevels]
    
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

  static consolidationtwo() {
    const history = Four_Hour_Functions.priceHist
    const highs = Four_Hour_Functions.highs
    const lows = Four_Hour_Functions.lows
    const histmax = Math.max(...highs)
    const histmin = Math.min(...lows)
    const histdiff = histmax - histmin
    
    // Ensure we have enough data
    const minDataPoints = 30 // More data needed for meaningful four-hour analysis
    if (history.length < minDataPoints) {
      return false; // Default to false if not enough data
    }
    
    // Normalize all arrays to same length (use recent data)
    const lookbackPeriod = Math.min(60, history.length) // Longer lookback for four-hour timeframe
    const recentHistory = history.slice(-lookbackPeriod)
    const recentHighs = highs.slice(-lookbackPeriod)
    const recentLows = lows.slice(-lookbackPeriod)
    const recentClose = history.slice(-lookbackPeriod)
    
    // APPROACH 1: Bollinger Bands width analysis
    const bollingerBands = bolls.calculate({ 
      period: 20, // Longer period for four-hour chart
      values: recentHistory, 
      stdDev: 2
    })
    
    // Calculate normalized Bollinger Band width
    const bandWidths = bollingerBands.map(band => (band.upper - band.lower) / band.middle)
    const recentBandWidths = bandWidths.slice(-6) // Longer period for four-hour
    const avgBandWidth = recentBandWidths.reduce((sum, width) => sum + width, 0) / recentBandWidths.length
    
    // Narrowing bands indicate consolidation
    const bandWidthShrinking = recentBandWidths[recentBandWidths.length - 1] < recentBandWidths[0]
    const isTightBands = avgBandWidth < 0.027 // Higher threshold for four-hour charts
    
    // APPROACH 2: True Range (volatility) analysis
    const trValues = tr.calculate({ 
      high: recentHighs, 
      low: recentLows, 
      close: recentClose, 
      period: 14 // Longer period for four-hour
    })
    
    // Calculate average true range relative to price
    const recentTR = trValues.slice(-6) // Using more bars for four-hour
    const avgTR = recentTR.reduce((sum, val) => sum + val, 0) / recentTR.length
    const normalizedATR = avgTR / recentHistory[recentHistory.length - 1]
    
    // Decreasing TR indicates consolidation
    const trTrend = recentTR[recentTR.length - 1] < recentTR[0]
    const isLowVolatility = normalizedATR < 0.011 // Higher threshold for four-hour timeframe
    
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
    const isNarrowRange = priceRangePercent < 0.035 // Higher threshold for four-hour timeframe
    const isLowDeviation = relativeStdDev < 0.015 // Higher threshold for four-hour timeframe
    
    // APPROACH 4: Linear regression slope and R-squared analysis
    // Prepare x and y for regression
    const x = Array.from({ length: recentHistory.length }, (_, i) => i)
    const y = recentHistory
    
    // Calculate linear regression
    const regResult = new regression.SimpleLinearRegression(x, y)
    const slope = Math.abs(regResult.slope)
    const r2 = regResult.rSquared
    
    // Flat slope and good fit indicate consolidation
    const isFlatSlope = slope < 0.00008 * mean // Lower threshold - four-hour moves should be flatter for consolidation
    const isPoorFit = r2 < 0.45 // Stricter for four-hour - less noise expected
    
    // APPROACH 5: Check for higher highs/lower lows pattern
    let hasDirectionalMovement = false
    
    // Check for consecutive higher highs or lower lows (trend indicators)
    let consecutiveHigherHighs = 0
    let consecutiveLowerLows = 0
    const pattern_window = 5 // Longer window for four-hour
    
    for (let i = 1; i < pattern_window; i++) {
      if (recentHighs[recentHighs.length - i] > recentHighs[recentHighs.length - i - 1]) {
        consecutiveHigherHighs++;
      }
      if (recentLows[recentLows.length - i] < recentLows[recentLows.length - i - 1]) {
        consecutiveLowerLows++;
      }
    }
    
    // Strong directional pattern indicates trending, not consolidation
    if (consecutiveHigherHighs >= 3 || consecutiveLowerLows >= 3) { // Same as 15min, but with longer window
      hasDirectionalMovement = true;
    }
    
    // Combine all factors to decide if the market is consolidating
    // Use a scoring system where more indicators agreeing increases confidence
    
    let consolidationScore = 0;
    let totalFactors = 0;
    
    // Bollinger factors - for four-hour, these are very important
    if (bandWidthShrinking) consolidationScore += 1.5;
    if (isTightBands) consolidationScore += 1.5;
    totalFactors += 3;
    
    // TR factors
    if (trTrend) consolidationScore += 1.25; // Slightly more weight for four-hour
    if (isLowVolatility) consolidationScore += 1.25;
    totalFactors += 2.5;
    
    // Range factors
    if (isNarrowRange) consolidationScore += 1;
    if (isLowDeviation) consolidationScore += 1;
    totalFactors += 2;
    
    // Regression factors - more important for four-hour
    if (isFlatSlope) consolidationScore += 1.25;
    if (isPoorFit) consolidationScore += 0.75; // Less important in four-hour
    totalFactors += 2;
    
    // Direction factor (negative score if directional)
    if (!hasDirectionalMovement) consolidationScore += 1;
    totalFactors += 1;
    
    // Calculate overall probability of consolidation
    const consolidationProbability = consolidationScore / totalFactors;
    
    // Threshold for four-hour timeframe
    return consolidationProbability >= 0.65; // Slightly higher threshold for four-hour - require more confidence
  }

  static getPrice () {
    return Four_Hour_Functions.price
  }

  static priceHistory () {
    return Four_Hour_Functions.priceHist
  }

  static trend () {
    const history = Four_Hour_Functions.priceHist
    if (history[history.length - 1] > history[history.length - 2] && history[history.length - 2] >= history[history.length - 3]) { return true }
    if (history[history.length - 1] < history[history.length - 2] && history[history.length - 2] <= history[history.length - 3]) { return false }
  }

  static recentHist () {
    const history = Four_Hour_Functions.priceHist
    const historytwo = []
    for (let x = 0; x < 30; x++) { historytwo.push(history.splice(-1, 1)[0]) }
    Four_Hour_Functions.recentHisto = historytwo.reverse()
  }

  static priceZones () {
    const biggersupres = Four_Hour_Functions.supreslevs()
    return biggersupres
  }

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
      smaller.push(price - Fifteen_Min_Functions.pipreverse(price, Fifteen_Min_Functions.pipdiffy(price, Fifteen_Min_Functions.stoploss())))
    }
    if (larger.length < 1) {
      larger.push(price + Fifteen_Min_Functions.pipreverse(price, Fifteen_Min_Functions.pipdiffy(price, Fifteen_Min_Functions.stoploss())))
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
    
    return finalLevs
  }

  /** finds closest support and resistance level to whatever price u put in */
  static closest (num1) {
    const values = Fifteen_Min_Nexus.finlevs.concat(Four_Hour_Functions.finlevs)
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

  static pip (num1, num2) {
    if (String(num1).indexOf('.') == 2) {
      Four_Hour_Functions.multiplier = 1000
    } else if (String(num1).indexOf('.') == 10) {
      Four_Hour_Functions.multiplier = 0.000001
    } else {
      Four_Hour_Functions.multiplier = 10000
    }
    return Math.abs(num1 - num2) * Four_Hour_Functions.multiplier
  }

  static pipCountBuy (num1, num2) {
    return Four_Hour_Functions.pip(num2, num1)
  }

  static pipCountSell (num1, num2) {
    return Four_Hour_Functions.pip(num1, num2)
  }
  
  /** Smart array that grows as program runs longer for each time period, shows rejection zones and if the program is near them, it'll not allow trading */
  static rejectionzoning () {
    try {
      // Initialize rejection zones if not already done
      if (!Four_Hour_Functions.rejectionzones) {
        Four_Hour_Functions.rejectionzones = []
      }
      
      // Call overall to ensure rejection zones are calculated
      try {
        Four_Hour_Functions.overall()
      } catch (err) {
        console.log("Warning: Failed to calculate overall in rejectionzoning", err.message)
        return false
      }
      
      const rejects = Four_Hour_Functions.rejectionzones
      
      // If no rejection zones, return false (no rejection)
      if (!rejects || rejects.length === 0) {
        return false
      }
      
      const diffs = []
      for (const val in rejects) {
        if (Fifteen_Min_Nexus.pot_buy) {
          if (Four_Hour_Functions.price < val) {
            diffs.push(val - Four_Hour_Functions.price)
          }
        }
        if (Fifteen_Min_Nexus.pot_sell) {
          if (Four_Hour_Functions.price > val) {
            diffs.push(Four_Hour_Functions.price - val)
          }
        }
      }
      
      // If no diffs were calculated or they're empty, return false
      if (!diffs || diffs.length === 0) {
        return false
      }
      
      // Check if price is too close to a rejection zone
      if (Math.abs(Math.min(...diffs)) < Math.abs(Four_Hour_Functions.price - Fifteen_Min_Nexus.tp)) {
        Fifteen_Min_Nexus.pot_buy = false
        Fifteen_Min_Nexus.pot_sell = false
        return true
      } else {
        return false
      }
    } catch (err) {
      console.log("Error in Four_Hour_Functions.rejectionzoning:", err.message)
      return false
    }
  }

  static calculateStdDev(values) {
    if (!values || values.length === 0) return 0;
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }
}

class Five_Min_Functions {
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
    const instrument = Fifteen_Min_Functions.instrument_name()
    Five_Min_Functions.priceHist = dataset.Five_Min.c
    Five_Min_Functions.highs = dataset.Five_Min.h
    Five_Min_Functions.lows = dataset.Five_Min.l
  }

  /** second consolidation method, meant to strengthen consolidation identification */
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

function testfifteen(data, price, instrument) {
  instrum = instrument;
  liveprice = price;
  // Assign to the global dataset variable
  dataset = data;
  Fifteen_Min_Nexus.controlMain();
  
  // If we have a potential buy signal
  if (Fifteen_Min_Nexus.pot_buy && !Fifteen_Min_Nexus.buy_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Fifteen_Min_Functions.supreslevs();
    Fifteen_Min_Functions.getPrice();
    Fifteen_Min_Functions.stoploss();
    Fifteen_Min_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Fifteen_Min_Nexus.sl.toFixed(5);
    const formattedTP = Fifteen_Min_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[FifteenMin] BUY SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('BUY', instrument, formattedSL, formattedTP, 0.01, 'Fifteen_Min algorithm signal', 'Fifteen_Min');
  }
  
  // If we have a potential sell signal
  if (Fifteen_Min_Nexus.pot_sell && !Fifteen_Min_Nexus.sell_pos) {
    // Call functions to setup the predetermined stop loss and take profit values
    Fifteen_Min_Functions.supreslevs();
    Fifteen_Min_Functions.getPrice();
    Fifteen_Min_Functions.stoploss();
    Fifteen_Min_Functions.tpvariation();
    
    // Format as strings with proper precision
    const formattedSL = Fifteen_Min_Nexus.sl.toFixed(5);
    const formattedTP = Fifteen_Min_Nexus.tp.toFixed(5);
    const formattedPrice = price.toFixed(5);
    
    // Log the signal
    console.log(`[FifteenMin] SELL SIGNAL for ${instrument} at ${formattedPrice}, SL: ${formattedSL}, TP: ${formattedTP}`);
    
    // Send the trade signal to MT5 and the trade store
    sendSignal('SELL', instrument, formattedSL, formattedTP, 0.01, 'Fifteen_Min algorithm signal', 'Fifteen_Min');
  }
}

module.exports = {
  testfifteen
};