import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Mock data for demonstration
const getMockQuotes = (): MarketQuote[] => {
  return [
    { symbol: 'SPY', price: 452.31, change: 2.43, changePercent: 0.54 },
    { symbol: 'QQQ', price: 378.92, change: -1.23, changePercent: -0.32 },
    { symbol: 'DIA', price: 348.76, change: 1.87, changePercent: 0.54 },
    { symbol: 'AAPL', price: 175.43, change: 2.11, changePercent: 1.22 },
    { symbol: 'MSFT', price: 338.54, change: -0.87, changePercent: -0.26 },
    { symbol: 'GOOGL', price: 127.89, change: 1.45, changePercent: 1.15 },
  ];
};

export default function MarketTicker() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);

  useEffect(() => {
    // Load initial data
    const loadQuotes = async () => {
      setQuotes(getMockQuotes());
    };

    loadQuotes();

    // Refresh every 30 seconds
    const interval = setInterval(loadQuotes, 30000);
    return () => clearInterval(interval);
  }, []);

  if (quotes.length === 0) {
    return null;
  }

  const marketData = quotes.map(q => ({
    name: q.symbol,
    value: q.price.toFixed(2),
    change: q.changePercent >= 0 ? `+${q.changePercent.toFixed(2)}%` : `${q.changePercent.toFixed(2)}%`,
    up: q.change >= 0,
  }));

  // Duplicate the data for seamless infinite scroll
  const duplicatedData = [...marketData, ...marketData, ...marketData];

  return (
    <div className="w-full bg-black text-white border-b border-gray-700 py-2 overflow-hidden relative">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {duplicatedData.map((item, index) => (
            <div key={`${item.name}-${index}`} className="ticker-item inline-flex items-center px-6 whitespace-nowrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-3">
                {item.name}
              </span>
              <span className="text-sm font-medium text-white mr-2">
                {item.value}
              </span>
              <span className={`text-xs font-medium flex items-center ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                {item.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {item.change}
              </span>
              <span className="text-gray-600 mx-4">|</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .ticker-content {
          display: inline-flex;
          animation: scroll 60s linear infinite;
          will-change: transform;
        }

        .ticker-content:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .ticker-item {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

