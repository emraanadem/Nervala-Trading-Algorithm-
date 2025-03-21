# MetaTrader Integration for Nervala Trading System

This documentation explains how to connect your Nervala Trading System to MetaTrader for automated trading execution. This integration allows your trading algorithms to send orders directly to MetaTrader 4/5 platforms.

## System Architecture

The integration consists of three main components:

1. **Trading Algorithm Files** - Your existing JS files (OneHour.js, Daily.js, etc.) that generate trading signals
2. **MetaTrader Connector** - Node.js module that communicates with MetaTrader via ZeroMQ
3. **MetaTrader Expert Advisor** - MQL4/5 script that runs in MetaTrader and executes orders

```
┌─────────────────┐     ┌───────────────────┐     ┌────────────────┐
│ Trading         │     │ MetaTrader        │     │ MetaTrader     │
│ Algorithm Files │────▶│ Connector (Node)  │────▶│ Expert Advisor │
└─────────────────┘     └───────────────────┘     └────────────────┘
```

## Prerequisites

- Node.js (v14+ recommended)
- MetaTrader 4 or 5 platform
- MetaTrader ZeroMQ library

## Installation

### 1. Install Node.js Dependencies

```bash
npm install zeromq@6.0.0-beta.6 winston
```

Note: We use zeromq v6 beta for its async/await support.

### 2. Install MetaTrader ZeroMQ Library

1. Download ZeroMQ for MetaTrader from [GitHub](https://github.com/dingmaotu/mql-zmq)
2. Copy the `Include/Zmq` folder to your MetaTrader installation's `Include` directory
3. Copy the appropriate DLLs to your MetaTrader installation's `Libraries` directory:
   - For MT4: `Libraries/MT4/`
   - For MT5: `Libraries/MT5/`

### 3. Install the MetaTrader Expert Advisor

1. Copy the `mt4-zeromq-bridge.mq4` file to your MetaTrader's `MQL4/Experts` directory
2. Compile the EA in MetaTrader by opening it in the editor and pressing F7

## Configuration

### MetaTrader Settings

1. Open MetaTrader
2. Enable algorithmic trading in Tools → Options → Expert Advisors
3. Allow DLL imports and enable the "Allow WebRequests" option
4. Add `localhost` to the allowed URLs if prompted

### Node.js Connector Configuration

The configuration settings are defined in the `metatrader-connector.js` file:

```javascript
// Configuration
const config = {
  // ZeroMQ socket configuration
  zmq: {
    pullPort: 5557,   // Port to receive data from MT
    pushPort: 5558,   // Port to send commands to MT
    pubPort: 5559,    // Port for MT to publish market data
    // ...
  },
  
  // Trade parameters
  trade: {
    defaultVolume: 0.01,    // Default lot size
    maxSlippage: 5,         // Maximum allowed slippage in points
    // ...
  },
  
  // Risk management
  risk: {
    maxPositions: 5,        // Maximum number of open positions
    maxDrawdown: 5.0,       // Maximum drawdown percentage before halting
    // ...
  }
};
```

### Expert Advisor Settings

When you attach the EA to a chart in MetaTrader, you can configure the following inputs:

- `ZmqPushAddress` - Address for the PUSH socket (default: tcp://*:5557)
- `ZmqPullAddress` - Address for the PULL socket (default: tcp://*:5558)
- `ZmqPubAddress` - Address for the PUB socket (default: tcp://*:5559)
- `MagicNumber` - Magic number for trade identification (default: 12345)
- `DebugMode` - Enable debug logging (default: true)
- `LogToFile` - Enable logging to file (default: true)

## Usage

### 1. Start the MetaTrader Platform

1. Open MetaTrader
2. Attach the `MT4-ZeroMQ-Bridge` EA to any chart
3. Make sure it shows "ZeroMQ bridge initialized successfully" in the logs

### 2. Modify Your Trading Algorithm Files

Each of your timeframe trading files (OneHour.js, Daily.js, etc.) needs to be modified to send signals to the MetaTrader connector. See the `mt-integration-example.js` file for detailed examples.

Basic integration for an algorithm:

```javascript
// At the top of your file
import { sendSignal } from './metatrader-connector.js';

// In your buy signal function
sendSignal('OneHour', {
  action: 'BUY',
  symbol: 'EUR_USD', // Your instrument
  stopLoss: 1.2345,  // Your calculated stop loss
  takeProfit: 1.2456, // Your calculated take profit
  volume: 0.01,      // Position size in lots
  reason: 'Buy signal from One Hour strategy'
});

// In your sell signal function
sendSignal('OneHour', {
  action: 'SELL',
  symbol: 'EUR_USD',
  stopLoss: 1.2456,
  takeProfit: 1.2345,
  volume: 0.01,
  reason: 'Sell signal from One Hour strategy'
});

// For closing positions
sendSignal('OneHour', {
  action: 'CLOSE',
  symbol: 'EUR_USD',
  reason: 'Close signal from One Hour strategy'
});

// For modifying existing positions
sendSignal('OneHour', {
  action: 'MODIFY',
  symbol: 'EUR_USD',
  stopLoss: 1.2400, // New stop loss
  takeProfit: 1.2500, // New take profit
  reason: 'Modification from One Hour strategy'
});
```

### 3. Start the Node.js Connector

```bash
node metatrader-connector.js
```

Or incorporate it into your main trading system:

```javascript
import { initialize } from './metatrader-connector.js';

async function main() {
  try {
    // Initialize the connector
    const mtApi = await initialize();
    console.log("MetaTrader connector initialized");
    
    // Start your regular trading system
    // ...
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
```

## Advanced Features

### Combining Signals from Multiple Timeframes

The `SignalAggregator` object in `mt-integration-example.js` demonstrates how to combine signals from multiple timeframes before executing trades. This can lead to more robust trading decisions based on multi-timeframe analysis.

### Handling Account Metrics

The MetaTrader connector monitors account metrics like drawdown and daily profit/loss. You can customize the risk management rules in the `config.risk` section of the connector.

### Symbol Name Conversion

The connector automatically handles the conversion between MetaTrader symbol formats (e.g., "EURUSD") and the format used in your system (e.g., "EUR_USD").

## Troubleshooting

### Connection Issues

If the connector can't connect to MetaTrader:

1. Ensure MetaTrader is running and the EA is attached to a chart
2. Check that the ports match between the connector and EA
3. Make sure your firewall isn't blocking the connections
4. Check the EA logs in MetaTrader's "Experts" tab

### Order Execution Issues

If orders aren't being executed correctly:

1. Check the MetaTrader logs for error messages
2. Verify that the symbol names are valid in your MetaTrader platform
3. Ensure your account has sufficient margin for new positions
4. Check for any trading restrictions on your broker account

## Best Practices

1. **Always use stop losses** - Never send orders without proper stop losses
2. **Start with small volumes** - Use minimal position sizes (0.01 lots) for testing
3. **Monitor executions** - Monitor the first few trades to ensure correct execution
4. **Risk management** - Implement proper risk management in your signals
5. **Error handling** - Add error handling for connection issues and trade rejections

## License

This integration is part of the Nervala Trading System and follows its licensing terms.

## Support

For support or questions, please contact the Nervala Trading System support team. 