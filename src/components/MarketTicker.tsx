'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";
import { getMockQuotes, type MarketQuote } from '@/lib/ticker/finnhub';

export default function MarketTicker() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);

  useEffect(() => {
    // Load initial data
    const loadQuotes = async () => {
      // For now, using mock data. To use real Finnhub data, add API key to .env.local:
      // NEXT_PUBLIC_FINNHUB_API_KEY=your_key_here
      // Then import getQuotes and use:
      // const realQuotes = await getQuotes(['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'GOOGL']);
      
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

      <style jsx>{`
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
