import { Activity, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TradesList({ trades = [], selectedPair }) {
  const [filteredTrades, setFilteredTrades] = useState([]);
  
  // Filter trades when selectedPair changes
  useEffect(() => {
    if (!trades || trades.length === 0) {
      setFilteredTrades([]);
      return;
    }
    
    setFilteredTrades(trades.filter(trade => 
      !selectedPair || trade.pair === selectedPair
    ));
  }, [trades, selectedPair]);

  if (!trades || trades.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-emerald-500" />
          <h3 className="font-medium">Trades</h3>
        </div>
        <div className="text-center p-6 text-gray-500">
          No trades available
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          <h3 className="font-medium">Trades</h3>
        </div>
        <span className="text-xs text-gray-500">
          {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
        </span>
      </div>
      
      <div className="space-y-3">
        {filteredTrades.map((trade) => (
          <div 
            key={trade.id} 
            className="bg-gray-800 rounded-lg p-3 border-l-4 border-opacity-80"
            style={{ 
              borderLeftColor: trade.direction === 'buy' 
                ? '#10b981' // emerald-500
                : '#ef4444'  // red-500
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5">
                {trade.direction === 'buy' ? (
                  <ArrowUp size={14} className="text-emerald-500" />
                ) : (
                  <ArrowDown size={14} className="text-red-500" />
                )}
                <span className="font-medium">{trade.pair}</span>
              </div>
              <span className="text-xs text-gray-400">{trade.timeframe}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="block text-gray-400">Entry</span>
                <span className="font-mono">{trade.entry}</span>
              </div>
              <div>
                <span className="block text-gray-400">TP</span>
                <span className="font-mono">{trade.takeProfit}</span>
              </div>
              <div>
                <span className="block text-gray-400">SL</span>
                <span className="font-mono">{trade.stopLoss}</span>
              </div>
              <div>
                <span className="block text-gray-400">R:R</span>
                <span>{trade.riskReward}:1</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(trade.timestamp).toLocaleString()}</span>
              </div>
              <span className={clsx(
                "px-1.5 py-0.5 rounded",
                trade.status === 'open' && "bg-blue-900 text-blue-300",
                trade.status === 'win' && "bg-emerald-900 text-emerald-300",
                trade.status === 'loss' && "bg-red-900 text-red-300"
              )}>
                {trade.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper for conditional class names
function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
} 