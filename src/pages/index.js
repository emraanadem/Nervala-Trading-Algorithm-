import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import TimeframeSelector from '../components/TimeframeSelector';
import TradesList from '../components/TradesList';
import PairSearch from '../components/PairSearch';
import TradesDropdown from '../components/TradesDropdown';
import { useRouter } from 'next/router';
import { RefreshCw, Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

// Dynamically import the chart component to avoid SSR issues
const ChartComponent = dynamic(() => import('../components/ChartComponent'), {
  ssr: false,
});

// Simple debounce function
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function Home() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedPair, setSelectedPair] = useState('EUR_USD');
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef(null);
  const { notifications, addNotification } = useNotifications();
  
  // Create a debounced version of router.push
  const debouncedUpdateUrl = useCallback(
    debounce((pair, timeframe) => {
      router.push(`/?pair=${pair}&timeframe=${timeframe}`, undefined, { 
        shallow: true 
      });
    }, 300),
    [router]
  );

  // Update URL when pair or timeframe changes (debounced)
  useEffect(() => {
    if (!isLoading) {
      debouncedUpdateUrl(selectedPair, selectedTimeframe);
    }
  }, [selectedPair, selectedTimeframe, debouncedUpdateUrl, isLoading]);

  // Handle URL params on initial load
  useEffect(() => {
    if (router.isReady) {
      const { pair, timeframe } = router.query;
      if (pair) setSelectedPair(pair);
      if (timeframe) setSelectedTimeframe(timeframe);
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);

  // This would fetch trades from your backend API
  useEffect(() => {
    if (isLoading) return;
    
    const fetchTrades = async () => {
      try {
        // In a real implementation, this would be an API call to your backend
        // For now, we'll simulate some sample trades
        const response = await fetch(`/api/trades?pair=${selectedPair}&timeframe=${selectedTimeframe}`);
        const data = await response.json();
        setTrades(data.trades);
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
    
    // Set up a polling interval to check for new trades
    const interval = setInterval(fetchTrades, 30000);
    return () => clearInterval(interval);
  }, [selectedPair, selectedTimeframe, isLoading]);

  // Function to reload the chart data
  const handleReloadChart = () => {
    if (chartRef.current) {
      console.log("Triggering chart reload from parent component");
      try {
        if (typeof chartRef.current.reloadChart === 'function') {
          chartRef.current.reloadChart();
        } else {
          console.error("reloadChart is not a function. Chart ref contains:", chartRef.current);
        }
      } catch (err) {
        console.error("Error calling reloadChart:", err);
      }
    } else {
      console.warn("Chart reference not available");
    }
  };

  const createSampleTrades = async () => {
    try {
      const response = await fetch('/api/trades/sample', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create sample trades: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Created sample trades:', data);
      
      // No need to reload, trades will be fetched by the notification system
    } catch (error) {
      console.error('Error creating sample trades:', error);
    }
  };

  // Create a test notification when bell is clicked
  const handleNotificationClick = () => {
    addNotification('Test notification', 'info', 3000);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Head>
        <title>Nervala | {selectedPair} - {selectedTimeframe}</title>
        <meta name="description" content="Trading algorithm visualization platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-emerald-500">Nervala</h1>
          <a 
            href="/admin" 
            className="ml-6 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-gray-300 hover:text-white transition-colors"
          >
            Admin
          </a>
          <button
            onClick={handleReloadChart}
            className="ml-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Reload chart data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Trades Dropdown */}
          <TradesDropdown />
          
          {/* Notifications Button */}
          <div className="relative">
            <button 
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
          
          {/* Search */}
          <PairSearch selectedPair={selectedPair} onSelectPair={setSelectedPair} />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-800 flex flex-col">
          <TimeframeSelector 
            selectedTimeframe={selectedTimeframe}
            onSelectTimeframe={setSelectedTimeframe}
          />
          <div className="flex-1 overflow-y-auto">
            <TradesList trades={trades} selectedPair={selectedPair} />
          </div>
          <div className="absolute bottom-4 left-4 z-10">
            <button
              onClick={createSampleTrades}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Sample Trades
            </button>
          </div>
        </aside>
        <section className="flex-1">
          <ChartComponent 
            ref={chartRef}
            pair={selectedPair} 
            timeframe={selectedTimeframe} 
            externalTrades={trades}
          />
        </section>
      </main>
    </div>
  );
} 