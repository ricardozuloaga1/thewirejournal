# Finnhub Market Ticker Setup

The market ticker currently uses **mock data** that simulates realistic stock movements.

## To Enable Real Market Data

1. **Get a Finnhub API Key** (Free)
   - Go to https://finnhub.io/register
   - Sign up for a free account
   - Copy your API key from the dashboard
   - Free tier: 60 API calls/minute

2. **Add to Environment Variables**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key_here
   ```

3. **Update MarketTicker Component**
   Open `src/components/MarketTicker.tsx` and uncomment these lines:
   ```typescript
   // Uncomment this import at the top:
   import { getQuotes } from '@/lib/ticker/finnhub';
   
   // Then replace the mock data call with:
   const realQuotes = await getQuotes(['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'GOOGL']);
   if (realQuotes.length > 0) {
     setQuotes(realQuotes);
     return;
   }
   // Falls back to mock if API fails
   setQuotes(getMockQuotes());
   ```

4. **Restart the server**
   ```bash
   npm run dev
   ```

## Symbols Displayed

Default tickers:
- **SPY** - S&P 500 ETF
- **QQQ** - Nasdaq 100 ETF
- **DIA** - Dow Jones ETF
- **AAPL** - Apple
- **MSFT** - Microsoft
- **GOOGL** - Google

You can customize these in `src/lib/ticker/finnhub.ts` by changing the `DEFAULT_SYMBOLS` array.

## Features

- **Auto-refresh**: Updates every 30 seconds
- **Live prices**: Real-time market data from Finnhub
- **Color-coded**: Green for gains, red for losses
- **Trending icons**: Up/down arrows
- **Fallback**: Uses mock data if API is unavailable


