import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import { Activity, ArrowDown, ArrowUp, X, Clock } from 'lucide-react';

export default forwardRef(({ pair, timeframe }, ref) => {
  // First, ensure all references are initialized at the component top level
  // to avoid "Cannot access uninitialized variable" errors

  // Define refs first - before any functions that might use them
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const priceLabelRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const timerRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const chartInitializedRef = useRef(false);
  const isRetryingRef = useRef(false);
  const containerReadyRef = useRef(false);

  // Define state variables next
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChangePositive, setPriceChangePositive] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Define utility functions before they're used
  const cleanupTimersAndIntervals = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
  }, []);

  const cleanupChart = useCallback(() => {
    if (chartRef.current) {
      try {
        chartRef.current.remove();
        console.log("Chart removed successfully");
      } catch (err) {
        console.error("Error removing chart:", err);
      }
      
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      priceLabelRef.current = null;
    }
  }, []);

  // Define fetchCandleData before handleRetry to avoid circular reference
  const fetchCandleData = useCallback(() => {
    // Skip if already fetching
    if (isFetchingRef.current || !isMountedRef.current) {
      console.log("Fetch already in progress or component unmounted, skipping");
      return Promise.resolve();
    }
    
    // Skip if no chart reference exists
    if (!chartRef.current || !candlestickSeriesRef.current) {
      console.log("Chart references not available, skipping data fetch");
      return Promise.resolve();
    }
    
    console.log(`Fetching candle data for ${pair}/${timeframe}`);
    isFetchingRef.current = true;
    
    return fetch(`/api/candles?pair=${pair}&timeframe=${timeframe}&_=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Check if component still mounted and references valid
        if (!isMountedRef.current || !chartRef.current || !candlestickSeriesRef.current) {
          console.log("Component unmounted or references lost during fetch");
          return;
        }
        
        console.log(`Received ${data.candles?.length || 0} candles`);
        
        if (!data.candles || !Array.isArray(data.candles) || data.candles.length === 0) {
          throw new Error('No valid candle data received');
        }
        
        // Format candle data safely
        const candleData = data.candles
          .filter(candle => candle && typeof candle.time === 'number')
          .map(candle => ({
            time: candle.time,
            open: Number(candle.o) || 0,
            high: Number(candle.h) || 0,
            low: Number(candle.l) || 0,
            close: Number(candle.c) || 0
          }));
        
        if (candleData.length === 0) {
          throw new Error('No valid candles after filtering');
        }
        
        // Set the data
        candlestickSeriesRef.current.setData(candleData);
        
        // Update price if available
        if (data.currentPrice !== undefined) {
          const numericPrice = Number(data.currentPrice);
          if (!isNaN(numericPrice)) {
            // Determine price direction
            if (currentPrice !== null) {
              setPriceChangePositive(numericPrice >= currentPrice);
            }
            setCurrentPrice(numericPrice);
            
            // Update price line if it exists
            if (priceLabelRef.current) {
              try {
                priceLabelRef.current.applyOptions({
                  price: numericPrice,
                  title: `Live: ${numericPrice.toFixed(pair.includes('JPY') ? 3 : 5)}`,
                });
              } catch (err) {
                console.error("Error updating price line:", err);
              }
            }
          }
        }
        
        // Fit content
        try {
          chartRef.current.timeScale().fitContent();
        } catch (err) {
          console.error("Error fitting chart content:", err);
        }
        
        // Update last update time
        setLastUpdateTime(new Date());
        setIsLoading(false);
        setError(null);
        
        return data;
      })
      .catch(error => {
        console.error('Error fetching candle data:', error);
        if (isMountedRef.current) {
          setError(`Failed to load data: ${error.message}`);
          setIsLoading(false);
        }
        return null;
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [pair, timeframe, currentPrice]);

  // Now define handleRetry after fetchCandleData is defined
  const handleRetry = useCallback(() => {
    console.log("Retry button clicked, hard reset");
    
    if (isRetryingRef.current) {
      console.log("Already retrying, ignoring duplicate request");
      return;
    }
    
    isRetryingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    // Clean up existing resources
    cleanupChart();
    cleanupTimersAndIntervals();
    
    // Create chart with delay to ensure clean state
    setTimeout(() => {
      if (!chartContainerRef.current || !isMountedRef.current) {
        setError("Chart container not available");
        setIsLoading(false);
        isRetryingRef.current = false;
        return;
      }
      
      try {
        const container = chartContainerRef.current;
        
        // Set container styles
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.display = 'block';
        
        // Get dimensions
        const width = Math.max(container.clientWidth || 300, 300);
        const height = Math.max(container.clientHeight || 300, 300);
        
        console.log(`Creating chart with dimensions: ${width}x${height}`);
        
        // Create chart with minimal options
        const chart = createChart(container, {
          width,
          height,
          layout: {
            background: { color: '#121212' },
            textColor: '#d1d4dc',
          },
          grid: {
            vertLines: {
              color: 'rgba(42, 46, 57, 0.4)',
              style: 1,
            },
            horzLines: {
              color: 'rgba(42, 46, 57, 0.4)',
              style: 1,
            },
          },
        });
        
        const series = chart.addCandlestickSeries({
          upColor: '#10b981', 
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        
        // Save references
        chartRef.current = chart;
        candlestickSeriesRef.current = series;
        
        // Add price line
        const priceLine = series.createPriceLine({
          price: 0,
          color: '#2196F3',
          lineWidth: 1,
          axisLabelVisible: true,
          title: 'Live',
        });
        priceLabelRef.current = priceLine;
        
        // Set up resize handler
        const handleResize = () => {
          if (!chartRef.current || !container) return;
          
          const newWidth = container.clientWidth;
          const newHeight = container.clientHeight;
          
          if (newWidth > 0 && newHeight > 0) {
            try {
              chartRef.current.resize(newWidth, newHeight);
            } catch (err) {
              console.error("Error resizing chart:", err);
            }
          }
        };
        
        // Set up resize observer
        try {
          resizeObserverRef.current = new ResizeObserver(handleResize);
          resizeObserverRef.current.observe(container);
        } catch (err) {
          console.error("Error setting up ResizeObserver:", err);
          window.addEventListener('resize', handleResize);
        }
        
        // Load data
        fetchCandleData()
          .then(() => {
            console.log("Initial data loaded successfully");
          })
          .catch(err => {
            console.error("Failed to load initial data:", err);
          })
          .finally(() => {
            isRetryingRef.current = false;
          });
          
      } catch (err) {
        console.error("Error in chart creation:", err);
        setError(`Chart creation failed: ${err.message}`);
        setIsLoading(false);
        isRetryingRef.current = false;
      }
    }, 300);
  }, [pair, timeframe, cleanupChart, cleanupTimersAndIntervals, fetchCandleData]);

  // Initialize chart only once
  useEffect(() => {
    console.log("Chart initialization effect running");
    
    // Call handleRetry to initialize the chart
    handleRetry();
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      cleanupChart();
      cleanupTimersAndIntervals();
    };
  }, []); // Empty dependency array - run only once

  // Set up data refresh interval
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;
    
    console.log("Setting up data refresh interval");
    
    // Update every 30 seconds
    updateIntervalRef.current = setInterval(() => {
      if (isMountedRef.current && !isFetchingRef.current) {
        fetchCandleData().catch(err => {
          console.error("Error in interval fetch:", err);
        });
      }
    }, 30000);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [fetchCandleData]);

  // Use useLayoutEffect to check container dimensions before mounting
  useLayoutEffect(() => {
    if (chartContainerRef.current) {
      const container = chartContainerRef.current;
      
      // Force container to be visible and have dimensions
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '400px';
      container.style.display = 'block';
      container.style.position = 'relative';
      
      // Log dimensions
      console.log(`Initial container dimensions: ${container.clientWidth}x${container.clientHeight}`);
      
      // Set container ready if dimensions are valid
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        containerReadyRef.current = true;
      } else {
        // Force dimensions one more time
        container.style.width = '100vw';
        container.style.height = '70vh';
        
        // Check again after a moment
        setTimeout(() => {
          console.log(`Delayed container dimensions: ${container.clientWidth}x${container.clientHeight}`);
          containerReadyRef.current = container.clientWidth > 0 && container.clientHeight > 0;
        }, 100);
      }
    }
  }, []);

  // Initialize chart when component mounts
  useEffect(() => {
    console.log("ChartComponent mounted");
    isMountedRef.current = true;
    
    // Wait for next tick to ensure container is in DOM
    setTimeout(() => {
      if (!containerReadyRef.current && chartContainerRef.current) {
        // Check dimensions again
        const container = chartContainerRef.current;
        console.log(`Container dimensions before init: ${container.clientWidth}x${container.clientHeight}`);
        
        // Force minimum size if needed
        if (container.clientWidth < 10 || container.clientHeight < 10) {
          container.style.width = '100%';
          container.style.height = '400px';
          container.style.minHeight = '400px';
        }
      }
      
      const success = handleRetry();
      
      if (success) {
        fetchCandleData()
          .then(() => {
            console.log("Initial data loaded successfully");
          })
          .catch(err => {
            console.error("Failed to load initial data:", err);
          });
        
        // Set up data refresh interval
        updateIntervalRef.current = setInterval(() => {
          if (isMountedRef.current && !isFetchingRef.current) {
            fetchCandleData().catch(err => {
              console.error("Error in interval fetch:", err);
            });
          }
        }, 30000);
      }
    }, 300);
    
    return () => {
      console.log("ChartComponent unmounting");
      isMountedRef.current = false;
      cleanupChart();
      cleanupTimersAndIntervals();
    };
  }, [handleRetry, fetchCandleData, cleanupChart, cleanupTimersAndIntervals]);

  // Return component JSX
  return (
    <div className="flex flex-col w-full h-full relative" style={{ minHeight: '400px' }}>
      <div 
        ref={chartContainerRef} 
        className="flex-1 w-full h-full"
        style={{ 
          minHeight: '400px',
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'block'
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 bg-gray-900 z-10">
          <div className="text-white">Loading chart data...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-opacity-75 bg-gray-900 z-10">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}
      
      {currentPrice && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 z-20">
          <span className={`text-sm font-mono ${priceChangePositive ? 'text-green-500' : 'text-red-500'}`}>
            {currentPrice.toFixed(pair.includes('JPY') ? 3 : 5)}
          </span>
          {lastUpdateTime && (
            <span className="text-xs text-gray-400">
              {lastUpdateTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}); 