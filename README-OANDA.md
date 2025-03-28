# Oanda API Integration for Nervala

This document provides instructions for configuring Nervala to use real market data from the Oanda API.

## Prerequisites

1. You need an Oanda account. You can create a free practice account at [Oanda's website](https://www.oanda.com/apply/).
2. Generate an API token from your Oanda account dashboard.

## Configuration Steps

1. Open the `.env.local` file in the root of your project.
2. Replace the placeholder values with your actual Oanda credentials:

```
OANDA_ACCOUNT_ID_1=YOUR_OANDA_ACCOUNT_ID
OANDA_API_TOKEN_1=YOUR_OANDA_API_TOKEN
```

3. Save the file and restart the development server (if it's running).

## Available Instruments

Nervala supports all forex pairs, commodities, indices, and crypto pairs available on the Oanda platform. The currency pairs should be formatted as shown below:

- Forex pairs: `EUR_USD`, `GBP_USD`, `USD_JPY`, etc.
- Commodities: `XAU_USD` (Gold), `XAG_USD` (Silver), etc.
- Indices: `US30_USD` (Dow Jones), `SPX500_USD` (S&P 500), etc.
- Crypto: `BTC_USD`, `ETH_USD`, etc.

## API Rate Limits

Oanda imposes rate limits on their API. If you encounter errors related to rate limiting, consider:

1. Reducing the polling frequency in `ChartComponent.js`
2. Using a proxy server to distribute API requests
3. Implementing a caching mechanism for frequently accessed data

## Troubleshooting

If you encounter issues with the Oanda API:

1. Verify your API credentials are correct
2. Check if your account has access to the requested instruments
3. Ensure your network allows connections to Oanda's API servers

For development purposes, the application will fall back to sample data if it cannot connect to the Oanda API.

## Using a Proxy Server

If you need to use a proxy server to access the Oanda API:

1. Uncomment and configure the proxy settings in `.env.local`:

```
PROXY_HOST_1=127.0.0.1
PROXY_PORT_1=8080
PROXY_USER_1=username
PROXY_PASS_1=password
```

2. The application will automatically use these settings when connecting to Oanda. 