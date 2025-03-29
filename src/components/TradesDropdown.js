import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { ArrowDown, ArrowUp, Clock, TrendingUp, Filter, ChevronDown, Search, X } from 'lucide-react';

const formatPrice = (price, pair) => {
  if (price === null || price === undefined) return '';
  const precision = pair && pair.includes('JPY') ? 3 : 5;
  return price.toFixed(precision);
};

const TradesDropdown = () => {
  const { trades, openTradesCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'closed'
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Filter and search trades
  const filteredTrades = trades.filter(trade => {
    // Apply status filter
    if (filter === 'open' && trade.status !== 'open') return false;
    if (filter === 'closed' && trade.status === 'open') return false;
    
    // Apply search (case insensitive search across pair and timeframe)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        trade.pair.toLowerCase().includes(searchLower) || 
        trade.timeframe.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 text-gray-200 hover:text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-4 py-2 font-medium transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <TrendingUp size={18} />
        <span>Trades</span>
        {openTradesCount > 0 && (
          <span className="bg-white text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {openTradesCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Trade History</h3>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${filter === 'open' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setFilter('open')}
                >
                  Open
                </button>
                <button
                  className={`px-2 py-1 text-xs rounded ${filter === 'closed' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setFilter('closed')}
                >
                  Closed
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Search by pair or timeframe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={14} className="text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {filteredTrades.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No trades match your filters
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Pair</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Direction</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Timeframe</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Entry</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTrades.map(trade => (
                    <tr key={trade.id} className="hover:bg-gray-700">
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-white">
                        {trade.pair}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <div className="flex items-center">
                          {trade.direction === 'buy' ? (
                            <ArrowUp size={12} className="text-green-400 mr-1" />
                          ) : (
                            <ArrowDown size={12} className="text-red-400 mr-1" />
                          )}
                          <span className={trade.direction === 'buy' ? 'text-green-400' : 'text-red-400'}>
                            {trade.direction.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">
                        {trade.timeframe}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-300">
                        {formatPrice(trade.entry, trade.pair)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <span className={`inline-flex px-2 py-0.5 text-xs leading-5 font-semibold rounded-full
                          ${trade.status === 'win' ? 'bg-green-900 text-green-200' : 
                            trade.status === 'loss' ? 'bg-red-900 text-red-200' : 
                            'bg-blue-900 text-blue-200'}`}>
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradesDropdown; 