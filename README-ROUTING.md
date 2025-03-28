# Nervala Account & Proxy Routing System

This document explains how the Nervala application distributes API requests across multiple OANDA accounts and proxies to optimize rate limits and ensure reliable data retrieval.

## Overview

To avoid hitting rate limits and distribute load across multiple resources, Nervala implements a sophisticated routing system that:

1. Assigns each currency pair to a specific account/proxy combination
2. Tracks API usage for monitoring and debugging
3. Provides load balancing across multiple accounts and proxies
4. Visualizes routing information and usage statistics in an admin dashboard

## Configuration Files

The routing system relies on three JSON configuration files in the `data` directory:

- **accounts.json**: Contains OANDA API account IDs and credentials
- **proxylist.json**: Lists available proxy servers (host, port, type)
- **proxyauth.json**: Contains authentication details for proxies that require it

## How Routing Works

The core of the routing system is the `accountProxyRouter.js` utility which:

1. Loads account, proxy, and proxy authentication data
2. Uses a deterministic algorithm to map currency pairs to specific account/proxy combinations
3. Returns routing information for API requests

```javascript
// Example of routing a currency pair
const { account, proxy, proxyAuth } = routePairToAccountAndProxy('EUR_USD');
```

The routing algorithm ensures:
- Consistent mapping (the same pair always routes to the same account/proxy)
- Even distribution of pairs across available resources
- Fallback to environment variables if no account/proxy is available

## Usage Tracking

The system includes a usage tracking feature that:
- Records each API hit by account, proxy, and currency pair
- Calculates load distribution percentages
- Maintains daily statistics for up to 30 days
- Automatically resets counters at midnight

## Admin Dashboard

An admin dashboard is available at `/admin` which provides:

1. **Account Routing**: Shows which accounts are assigned to which currency pairs
2. **Proxy Routing**: Shows which proxies are being used and their distribution
3. **API Usage Stats**: Provides real-time and historical usage statistics
4. **Currency Pair Request Frequency**: Shows which pairs are requested most often

## API Endpoints

The system exposes the following API endpoints:

- `/api/routing`: Returns the routing map for all currency pairs
- `/api/usage`: Returns usage statistics and load distribution data

## UI Indicators

The chart component displays which account/proxy is being used for the current currency pair, providing transparency to users and helping with debugging.

## Adding New Accounts or Proxies

To add new accounts or proxies:

1. Add the account details to `data/accounts.json`
2. Add proxy information to `data/proxylist.json`
3. Add proxy authentication (if needed) to `data/proxyauth.json`

The routing system will automatically incorporate these new resources in its distribution algorithm.

## Security Considerations

- OANDA API tokens are never exposed to the client
- Proxy authentication details are securely handled
- In production, the usage statistics API requires authentication

## Troubleshooting

If you encounter issues with the routing system:

1. Check the admin dashboard for account and proxy usage
2. Verify that your configuration files have the correct format
3. Ensure that your OANDA accounts have appropriate permissions
4. Check the server logs for detailed error messages 