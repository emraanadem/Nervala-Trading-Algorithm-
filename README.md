# Nervala

Nervala is a trading algorithm visualization platform built with Next.js. It provides a modern UI for monitoring trading signals and analyzing market data across different timeframes and currency pairs.

## Features

- Interactive candlestick chart with zoom and pan capabilities powered by lightweight-charts
- Real-time data from Oanda API (with sample data fallback for development)
- Timeframe selection (15m, 30m, 1h, 2h, 4h, Daily, Weekly)
- Real-time trade signals display
- Global keyboard shortcut for quick currency pair search
- Dark theme UI for reduced eye strain during trading

## Getting Started

### Prerequisites

- Node.js 14+ 
- npm or yarn
- Oanda account (for live data, optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nervala
```

2. Install the dependencies
```bash
npm install
# or
yarn install
```

3. Configure the Oanda API (optional)
   - Copy the provided credentials from your Oanda account to `.env.local`
   - See `README-OANDA.md` for detailed instructions

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

To build the application for production:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Algorithm Integration

The application integrates with your trading algorithm through:

- `piston.js` - Main algorithm entry point
- `worker-forex.js` - Worker for processing forex pairs
- `worker-wrapper.js` - Worker management 

Trade signals are captured from the algorithm's output and displayed in the UI in real-time.

## Data Sources

Nervala can use data from multiple sources:

1. **Oanda API** (default) - Real market data for forex, commodities, indices, and more
2. **Sample Data** (fallback) - Automatically used if Oanda API is unavailable
3. **Custom Algorithm Data** - Data from your own algorithm

See `README-OANDA.md` for details on configuring the Oanda API integration.

## Project Structure

- `/src/pages` - Next.js pages
- `/src/components` - React components
- `/src/utils` - Utility functions
- `/src/styles` - Global styles
- `/src/pages/api` - API routes for data fetching
- `/data` - Algorithm data files
- `/src` - Algorithm source code

## License

[MIT](LICENSE) 