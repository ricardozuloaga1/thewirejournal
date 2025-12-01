/**
 * Finnhub API integration for market data
 * Free tier: 60 calls/minute
 */

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

const FINNHUB_API_URL = 'https://finnhub.io/api/v1';

const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'GOOGL'];

/**
 * Fetch quote for a single symbol
 */
export async function getQuote(symbol: string): Promise<MarketQuote | null> {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  
  if (!apiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${FINNHUB_API_URL}/quote?symbol=${symbol}&token=${apiKey}`
    );

    if (!response.ok) {
      console.error(`Finnhub error for ${symbol}:`, response.status);
      return null;
    }

    const data = await response.json();

    // Finnhub returns: c (current), d (change), dp (change percent), h (high), l (low), o (open), pc (previous close)
    if (!data.c) return null;

    return {
      symbol,
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || data.c,
      low: data.l || data.c,
      open: data.o || data.c,
      previousClose: data.pc || data.c,
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols
 */
export async function getQuotes(symbols: string[] = DEFAULT_SYMBOLS): Promise<MarketQuote[]> {
  const quotes = await Promise.all(
    symbols.map(symbol => getQuote(symbol))
  );

  return quotes.filter((q): q is MarketQuote => q !== null);
}

/**
 * Get mock data for development/demo
 */
export function getMockQuotes(): MarketQuote[] {
  const mockData = [
    { symbol: 'SPY', name: 'S&P 500', basePrice: 450 },
    { symbol: 'QQQ', name: 'Nasdaq', basePrice: 385 },
    { symbol: 'DIA', name: 'Dow Jones', basePrice: 355 },
    { symbol: 'AAPL', name: 'Apple', basePrice: 175 },
    { symbol: 'MSFT', name: 'Microsoft', basePrice: 380 },
    { symbol: 'GOOGL', name: 'Google', basePrice: 140 },
  ];

  return mockData.map(stock => {
    // Simulate random market movement
    const changePercent = (Math.random() - 0.5) * 3; // -1.5% to +1.5%
    const price = stock.basePrice * (1 + changePercent / 100);
    const change = price - stock.basePrice;

    return {
      symbol: stock.symbol,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number((price * 1.01).toFixed(2)),
      low: Number((price * 0.99).toFixed(2)),
      open: Number((stock.basePrice * 0.998).toFixed(2)),
      previousClose: stock.basePrice,
    };
  });
}


