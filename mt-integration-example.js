/**
 * MetaTrader Integration Examples
 * 
 * This file shows how to modify your existing timeframe modules
 * to send signals to the MetaTrader connector.
 */

import { sendSignal, initialize } from './metatrader-connector.js';

/**
 * EXAMPLE 1: OneHour.js Integration
 * 
 * Below is a simplified example showing how to modify the OneHour.js file
 * to send trading signals to the MetaTrader connector.
 */

// Original OneHour.js extract:
/*
export function testonehour(data, price, instrument) {
  instrum = instrument
  liveprice = price
  dataset = data
  One_Hour_Nexus.controlMain()
}

// Inside One_Hour_Nexus object:
const One_Hour_Nexus = {
  pair: null,
  sl: 0,
  tp: 0,
  
  // ... other properties
  
  buy: function() {
    // Original buy logic
    // ...
  },
  
  sell: function() {
    // Original sell logic
    // ...
  },
  
  closePosTP: function() {
    // Original close position logic
    // ...
  },
  
  closePosSL: function() {
    // Original close position logic
    // ...
  }
}
*/

// MODIFIED VERSION WITH METATRADER INTEGRATION:

// Import the MetaTrader connector
// Add this at the top of OneHour.js:
// import { sendSignal } from './metatrader-connector.js';

// Modify the One_Hour_Nexus object methods:

const One_Hour_Nexus_Modified = {
  pair: null,
  sl: 0,
  tp: 0,
  
  // ... existing properties ...
  
  buy: function() {
    // Original buy logic
    // ...
    
    // Add this at the end of the buy method:
    sendSignal('OneHour', {
      action: 'BUY',
      symbol: this.pair,
      stopLoss: this.sl,
      takeProfit: this.tp,
      volume: 0.01, // Use your position sizing logic here
      reason: 'Buy signal from One Hour strategy'
    });
  },
  
  sell: function() {
    // Original sell logic
    // ...
    
    // Add this at the end of the sell method:
    sendSignal('OneHour', {
      action: 'SELL',
      symbol: this.pair,
      stopLoss: this.sl,
      takeProfit: this.tp,
      volume: 0.01, // Use your position sizing logic here
      reason: 'Sell signal from One Hour strategy'
    });
  },
  
  closePosTP: function() {
    // Original close position logic
    // ...
    
    // Add this at the end of the closePos method:
    sendSignal('OneHour', {
      action: 'CLOSE',
      symbol: this.pair,
      reason: 'Take profit signal from One Hour strategy'
    });
  },
  
  closePosSL: function() {
    // Original close position logic
    // ...
    
    // Add this at the end of the closePos method:
    sendSignal('OneHour', {
      action: 'CLOSE',
      symbol: this.pair,
      reason: 'Stop loss signal from One Hour strategy'
    });
  },
  
  modifySL: function(newSL) {
    // If you have position modification logic
    this.sl = newSL;
    
    // Send position modification signal
    sendSignal('OneHour', {
      action: 'MODIFY',
      symbol: this.pair,
      stopLoss: newSL,
      takeProfit: this.tp,
      reason: 'Trail stop from One Hour strategy'
    });
  }
};

/**
 * EXAMPLE 2: Daily.js Integration
 * 
 * Similar to OneHour.js but for the Daily timeframe
 */

const Daily_Nexus_Modified = {
  // Similar structure to One_Hour_Nexus but with Daily specific signals
  
  buy: function() {
    // Original daily buy logic
    // ...
    
    sendSignal('Daily', {
      action: 'BUY',
      symbol: this.pair,
      stopLoss: this.sl,
      takeProfit: this.tp,
      volume: 0.02, // Potentially larger position size for longer timeframe
      reason: 'Buy signal from Daily strategy'
    });
  },
  
  // ... other methods similar to OneHour
};

/**
 * EXAMPLE 3: Combining Multiple Timeframe Signals
 * 
 * This demonstrates how to create a more complex signal that
 * considers multiple timeframes before executing
 */

// Create a signal aggregator to combine signals
const SignalAggregator = {
  signals: {
    FifteenMin: { direction: null, strength: 0, timestamp: 0 },
    ThirtyMin: { direction: null, strength: 0, timestamp: 0 },
    OneHour: { direction: null, strength: 0, timestamp: 0 },
    FourHour: { direction: null, strength: 0, timestamp: 0 },
    Daily: { direction: null, strength: 0, timestamp: 0 },
    Weekly: { direction: null, strength: 0, timestamp: 0 }
  },
  
  // Register a signal from any timeframe strategy
  addSignal: function(timeframe, direction, strength) {
    if (this.signals[timeframe]) {
      this.signals[timeframe] = {
        direction,
        strength,
        timestamp: Date.now()
      };
      
      // After updating signals, check for confluent signals
      this.checkConfluence();
    }
  },
  
  // Check if multiple timeframes agree
  checkConfluence: function() {
    // Example: Check if at least 3 timeframes agree on direction
    let buyCount = 0;
    let sellCount = 0;
    let totalStrength = 0;
    
    // Count signals and calculate total strength
    for (const tf in this.signals) {
      const signal = this.signals[tf];
      const age = Date.now() - signal.timestamp;
      
      // Only consider signals less than 1 hour old
      if (age < 3600000) {
        if (signal.direction === 'BUY') {
          buyCount++;
          totalStrength += signal.strength;
        } else if (signal.direction === 'SELL') {
          sellCount++;
          totalStrength -= signal.strength; // Negative for sell
        }
      }
    }
    
    // If we have enough agreement, execute a combined signal
    if (buyCount >= 3 && totalStrength > 5) {
      // Generate a MetaTrader buy signal
      this.executeBuySignal(totalStrength);
    } else if (sellCount >= 3 && totalStrength < -5) {
      // Generate a MetaTrader sell signal
      this.executeSellSignal(Math.abs(totalStrength));
    }
  },
  
  // Execute a buy signal with position sizing based on strength
  executeBuySignal: function(strength) {
    // Calculate position size based on signal strength
    const volume = Math.min(0.05, 0.01 * (strength / 2));
    
    // Send to MetaTrader
    sendSignal('Combined', {
      action: 'BUY',
      symbol: 'EUR_USD', // Example symbol, use your actual target
      volume,
      stopLoss: 0, // Calculate based on your risk management
      takeProfit: 0, // Calculate based on your profit targets
      reason: `Combined timeframe buy signal (strength: ${strength})`
    });
  },
  
  // Execute a sell signal with position sizing based on strength
  executeSellSignal: function(strength) {
    // Calculate position size based on signal strength
    const volume = Math.min(0.05, 0.01 * (strength / 2));
    
    // Send to MetaTrader
    sendSignal('Combined', {
      action: 'SELL',
      symbol: 'EUR_USD', // Example symbol, use your actual target
      volume,
      stopLoss: 0, // Calculate based on your risk management
      takeProfit: 0, // Calculate based on your profit targets
      reason: `Combined timeframe sell signal (strength: ${strength})`
    });
  }
};

/**
 * EXAMPLE 4: Integration with your existing FifteenMin.js
 */

// Add this to your FifteenMin.js file:
/*
import { sendSignal } from './metatrader-connector.js';

// Inside the appropriate buy signal method:
sendSignal('FifteenMin', {
  action: 'BUY',
  symbol: this.instrument,
  volume: 0.01,
  stopLoss: calculateStopLoss(), // Your existing SL calculation
  takeProfit: calculateTakeProfit(), // Your existing TP calculation
  reason: 'Buy signal from 15-min strategy'
});

// Inside the appropriate sell signal method:
sendSignal('FifteenMin', {
  action: 'SELL',
  symbol: this.instrument,
  volume: 0.01,
  stopLoss: calculateStopLoss(), // Your existing SL calculation
  takeProfit: calculateTakeProfit(), // Your existing TP calculation
  reason: 'Sell signal from 15-min strategy'
});
*/

/**
 * STARTUP CODE
 * 
 * This function initializes the MetaTrader connector
 * and registers all the necessary signal handlers
 */
async function startMetaTraderConnector() {
  try {
    console.log("Initializing MetaTrader connector...");
    
    // Initialize the connector and get the API
    const mtApi = await initialize();
    
    console.log("MetaTrader connector initialized successfully");
    
    // Get active positions to see what's already running
    const positions = mtApi.getActivePositions();
    console.log(`Current active positions: ${positions.length}`);
    
    // Example: Close all positions when starting (if needed)
    // mtApi.closeAllPositions('System restart');
    
    // Register a signal handler for combined signals
    registerSignalHandler('Combined', (signal) => {
      console.log(`Processing combined signal: ${signal.action} ${signal.symbol}`);
      processSignal('Combined', signal);
    });
    
    console.log("Ready to process trading signals");
    
    return mtApi;
  } catch (error) {
    console.error("Failed to initialize MetaTrader connector:", error);
    throw error;
  }
}

/**
 * USAGE EXAMPLE
 * 
 * This is how you would use this integration in your main script
 */

// Example main.js
/*
import { startMetaTraderConnector } from './mt-integration-example.js';

async function main() {
  try {
    // Initialize the MT connector
    const mtApi = await startMetaTraderConnector();
    
    // Start your regular data processing and trading logic
    // ...
    
    // The modified timeframe modules will now automatically
    // send signals to MetaTrader when they detect trading opportunities
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
*/ 