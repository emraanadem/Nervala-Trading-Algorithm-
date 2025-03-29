import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ToastNotification from './ToastNotification';

// Create a notification context
const NotificationContext = createContext();

// Custom hook to use notifications
export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [trades, setTrades] = useState([]);
  const [openTradesCount, setOpenTradesCount] = useState(0);

  // Add a new notification
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Fetch all trades across pairs and timeframes
  const fetchAllTrades = useCallback(async () => {
    try {
      const response = await fetch('/api/trades?all=true');
      if (!response.ok) {
        throw new Error('Failed to fetch trades');
      }
      const data = await response.json();
      
      // Sort by most recent first
      const sortedTrades = data.trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Check for new trades by comparing with current trades
      const currentTradeIds = new Set(trades.map(trade => trade.id));
      const newTrades = sortedTrades.filter(trade => !currentTradeIds.has(trade.id));
      
      // Create notifications for new trades
      newTrades.forEach(trade => {
        const direction = trade.direction === 'buy' ? 'BUY' : 'SELL';
        const message = `New ${direction} trade: ${trade.pair} (${trade.timeframe})`;
        addNotification(message, 'trade', 8000);
      });
      
      setTrades(sortedTrades);
      
      // Count open trades
      const openTrades = sortedTrades.filter(trade => trade.status === 'open');
      setOpenTradesCount(openTrades.length);
      
      return sortedTrades;
    } catch (error) {
      console.error('Error fetching all trades:', error);
      addNotification('Failed to fetch trades', 'error');
      return [];
    }
  }, [trades, addNotification]);

  // Poll for trades periodically
  useEffect(() => {
    // Initial fetch
    fetchAllTrades();
    
    // Set up polling
    const interval = setInterval(() => {
      fetchAllTrades();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchAllTrades]);

  // Create value for provider
  const value = {
    notifications,
    addNotification,
    removeNotification,
    trades,
    openTradesCount,
    fetchAllTrades
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Container to display all active notifications
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationProvider; 