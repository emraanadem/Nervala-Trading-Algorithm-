import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef, useLayoutEffect } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import { Activity, ArrowDown, ArrowUp, X, Clock } from 'lucide-react';

// Add helper function for formatting price values consistently
const formatPrice = (price, pair) => {
  if (price === null || price === undefined) return '';
  const precision = pair.includes('JPY') ? 3 : 5;
  return price.toFixed(precision);
};

export default forwardRef(({ pair, timeframe, externalTrades }, ref) => {
  // First, ensure all references are initialized at the component top level
  // to avoid "Cannot access uninitialized variable" errors

  // Define refs first - before any functions that might use them
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const priceLabelRef = useRef(null);
  const markerSeriesRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const timerRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const chartInitializedRef = useRef(false);
  const isRetryingRef = useRef(false);
  const containerReadyRef = useRef(false);
  const tradesContainerRef = useRef(null);

  // Define state variables next
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChangePositive, setPriceChangePositive] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [trades, setTrades] = useState([]);
  const [isFetchingTrades, setIsFetchingTrades] = useState(false);

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

  // Function to update the chart with current price and its relation to trade targets
  const updateCurrentPriceIndicator = useCallback((price) => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;
    
    if (priceLabelRef.current) {
      try {
        priceLabelRef.current.applyOptions({
          price,
          title: `Live: ${formatPrice(price, pair)}`,
          axisLabelVisible: true, // Always show the live price on axis
        });
      } catch (err) {
        console.error("Error updating price line:", err);
      }
    }
    
    // We've removed the trade progress indicator UI, so we don't need to calculate
    // progress percentages toward targets anymore. Just let the price lines show visually
    // where the entry, SL and TP levels are on the chart.
  }, [pair]);

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
            
            // Update price line and trade progress indicators
            updateCurrentPriceIndicator(numericPrice);
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
        
        // Ensure chart is showing appropriate price range
        try {
          // Adjust the visible range to ensure we see enough price levels
          const visibleRange = chartRef.current.timeScale().getVisibleRange();
          if (visibleRange) {
            const priceScale = chartRef.current.priceScale('right');
            if (priceScale) {
              // Force price scale update
              priceScale.applyOptions({
                autoScale: true,
                mode: 0,
                ticksVisible: true,
                scaleMargins: {
                  top: 0.1, 
                  bottom: 0.1,
                },
              });
            }
          }
          
          // Fit content with animation
          chartRef.current.timeScale().fitContent();
        } catch (err) {
          console.error("Error adjusting price scale:", err);
        }
        
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

  // Define fetchTrades function to get trade data
  const fetchTrades = useCallback(() => {
    if (isFetchingTrades || !isMountedRef.current) {
      console.log("Trades fetch already in progress or component unmounted, skipping");
      return Promise.resolve();
    }
    
    console.log(`Fetching trades for ${pair}/${timeframe}`);
    setIsFetchingTrades(true);
    
    return fetch(`/api/trades?pair=${pair}&timeframe=${timeframe}&_=${Date.now()}`, {
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
        if (!isMountedRef.current) {
          console.log("Component unmounted during trades fetch");
          return;
        }
        
        console.log(`Received ${data.trades?.length || 0} trades`);
        
        if (!data.trades || !Array.isArray(data.trades)) {
          throw new Error('No valid trade data received');
        }
        
        setTrades(data.trades);
        
        // Update markers on chart if chart is initialized
        if (chartRef.current && candlestickSeriesRef.current) {
          updateTradeMarkers(data.trades);
        }
        
        return data.trades;
      })
      .catch(error => {
        console.error('Error fetching trade data:', error);
        return [];
      })
      .finally(() => {
        setIsFetchingTrades(false);
      });
  }, [pair, timeframe]);
  
  // Function to update trade markers on the chart
  const updateTradeMarkers = useCallback((tradeData) => {
    if (!chartRef.current) return;
    
    try {
      // Ensure we have valid trade data
      if (!tradeData || !Array.isArray(tradeData) || tradeData.length === 0) {
        // Clear markers if no trades
        if (markerSeriesRef.current) {
          markerSeriesRef.current.setMarkers([]);
        } else if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setMarkers([]);
        }
        return;
      }
      
      // Filter trades for this pair and timeframe
      const relevantTrades = tradeData.filter(trade => 
        trade.pair === pair && (trade.timeframe === timeframe || !timeframe)
      );
      
      console.log(`Creating markers for ${relevantTrades.length} relevant trades`);
      
      // Create markers for entry/exit points
      const markers = relevantTrades.flatMap(trade => {
        const time = new Date(trade.timestamp).getTime() / 1000;
        const markers = [];
        
        // Entry marker
        markers.push({
          time,
          position: trade.direction === 'buy' ? 'belowBar' : 'aboveBar',
          color: trade.direction === 'buy' ? '#10b981' : '#ef4444',
          shape: trade.direction === 'buy' ? 'arrowUp' : 'arrowDown',
          text: `Entry ${formatPrice(trade.entry, pair)}`,
          size: 2
        });
        
        // Exit marker (for closed trades)
        if (trade.status !== 'open') {
          markers.push({
            time: time + (60 * 60), // Add some time offset for visualization
            position: trade.direction === 'buy' ? 'aboveBar' : 'belowBar',
            color: trade.status === 'win' ? '#10b981' : '#ef4444',
            shape: 'circle',
            text: `Exit (${trade.status.toUpperCase()})`,
            size: 2
          });
        }
        
        return markers;
      });
      
      console.log(`Setting ${markers.length} markers on chart`);
      
      // Set markers to the series
      if (markerSeriesRef.current) {
        try {
          markerSeriesRef.current.setMarkers(markers);
        } catch (err) {
          console.error("Error setting markers on marker series:", err);
          // Fall back to candlestick series
          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setMarkers(markers);
          }
        }
      } else if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setMarkers(markers);
      }

      // Add price lines for open trades to visualize entry/exit levels
      if (candlestickSeriesRef.current) {
        // First, try to remove any existing trade price lines
        try {
          // Use a try-catch block since the priceLines method might not exist
          // Instead of trying to get all price lines, just attempt to remove the ones we know about
          // by their IDs (which we'll track in state)
          const openTrades = relevantTrades.filter(trade => trade.status === 'open');
          openTrades.forEach(trade => {
            try {
              // Try to remove existing lines for this trade ID if they exist
              candlestickSeriesRef.current.removePriceLine(trade.id + '_entry');
              candlestickSeriesRef.current.removePriceLine(trade.id + '_sl');
              candlestickSeriesRef.current.removePriceLine(trade.id + '_tp');
            } catch (err) {
              // Ignore errors from removing non-existent lines
            }
          });
        } catch (err) {
          console.error("Error removing existing price lines:", err);
        }
        
        // Add new price lines for open trades
        const openTrades = relevantTrades.filter(trade => trade.status === 'open');
        openTrades.forEach(trade => {
          // Entry price line
          try {
            candlestickSeriesRef.current.createPriceLine({
              price: trade.entry,
              color: trade.direction === 'buy' ? '#10b981' : '#ef4444',
              lineWidth: 2,
              lineStyle: 1, // Solid
              axisLabelVisible: false, // Hide axis label to prevent clutter
              title: `Entry ${formatPrice(trade.entry, pair)}`,
              id: trade.id + '_entry' // Use a simpler ID format
            });
            
            // No longer showing stop loss line
            
            // Take Profit price line
            candlestickSeriesRef.current.createPriceLine({
              price: trade.takeProfit,
              color: '#10b981', // Green
              lineWidth: 2,
              lineStyle: 3, // Dotted
              axisLabelVisible: false, // Hide axis label to prevent clutter
              title: `TP ${formatPrice(trade.takeProfit, pair)}`,
              id: trade.id + '_tp'
            });
          } catch (err) {
            console.error("Error adding trade price lines:", err);
          }
        });
      }
    } catch (err) {
      console.error("Error updating trade markers:", err);
    }
  }, [pair, timeframe]);

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
            fontSize: 12,
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
          rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.3)',
            borderVisible: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
            // Ensure more price labels on the y-axis
            minimumHeight: 20, // Even smaller value = more labels
            textColor: '#d1d4dc',
            fontSize: 11,
            alignLabels: true,
            mode: 0, // 0 = Normal is better for standard price display
            autoScale: true,
            entireTextOnly: false,
            ticksVisible: true,
            visible: true,
          },
          timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.3)',
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time, tickMarkType, locale) => {
              const date = new Date(time * 1000);
              // Format based on timeframe
              if (timeframe === '1d' || timeframe === 'Daily' || timeframe === 'Weekly') {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } else {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
              }
            },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              color: 'rgba(224, 227, 235, 0.4)',
              width: 1,
              style: 1,
              visible: true,
              labelVisible: true,
            },
            horzLine: {
              color: 'rgba(224, 227, 235, 0.4)',
              width: 1,
              style: 1,
              visible: true,
              labelVisible: true,
            },
          },
          // Handle watermark
          watermark: {
            visible: false,
          },
        });
        
        // Function to determine appropriate price precision based on pair and current price level
        const determinePricePrecision = (pair, currentPrice) => {
          if (pair.includes('JPY')) return 3;
          
          // For pairs with very small price movements (like some crypto pairs)
          if (currentPrice < 0.01) return 8;
          
          // Default for forex pairs like EUR_USD
          return 5;
        };
        
        // Get appropriate precision for this pair
        const precision = determinePricePrecision(pair, currentPrice || 1.0);
        
        const series = chart.addCandlestickSeries({
          upColor: '#10b981', 
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
          priceFormat: {
            type: 'price',
            precision: precision,
            minMove: Math.pow(10, -precision), // Dynamically set minimum price movement
          },
          // Additional formatting for price labels
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: 'rgba(255, 255, 255, 0.5)',
          priceLineStyle: LineStyle.Dotted,
        });
        
        // After creating the chart, make sure the rightPriceScale is properly configured
        chart.applyOptions({
          rightPriceScale: {
            autoScale: true,
            mode: 0,
            invertScale: false,
            alignLabels: true,
            borderVisible: true,
            scaleMargins: {
              top: 0.1, 
              bottom: 0.1,
            },
            ticksVisible: true,
            // Adjust the number of price labels
            minimumHeight: 20,
          }
        });
        
        // Force price format update
        series.applyOptions({
          priceFormat: {
            type: 'price',
            precision: precision,
            minMove: Math.pow(10, -precision),
          }
        });
        
        // Add volume histogram with proper configuration
        try {
          const volumeSeries = chart.addHistogramSeries({
            priceScaleId: '', // Use default scale
            scaleMargins: {
              top: 0.85, // Position volume at the bottom
              bottom: 0,
            },
            priceFormat: {
              type: 'volume',
            },
            color: 'rgba(76, 175, 80, 0.5)',
          });
          
          volumeSeriesRef.current = volumeSeries;
        } catch (err) {
          console.error("Failed to add volume series:", err);
          // Continue without volume series
        }
        
        // Save references
        chartRef.current = chart;
        candlestickSeriesRef.current = series;
        
        // Add marker series for trade entry/exit points
        try {
          const markerSeries = chart.addLineSeries({
            lineVisible: false,
            lastValueVisible: false,
            priceLineVisible: false,
            baseLineVisible: false,
            crosshairMarkerVisible: false,
            priceFormat: {
              type: 'price',
              precision: precision,
              minMove: Math.pow(10, -precision),
            }
          });
          markerSeriesRef.current = markerSeries;
          
          // If we already have trades, immediately add markers
          if (trades && trades.length > 0) {
            updateTradeMarkers(trades);
          } else if (externalTrades && Array.isArray(externalTrades)) {
            // Or use external trades if available
            const relevantTrades = externalTrades.filter(trade => 
              trade.pair === pair && (trade.timeframe === timeframe || !timeframe)
            );
            updateTradeMarkers(relevantTrades);
          }
        } catch (err) {
          console.error("Failed to add marker series:", err);
          // Continue without marker series, will fall back to candlestick series for markers
        }
        
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
          .then((data) => {
            console.log("Initial data loaded successfully");
            
            // If we have volume data, set up volume series
            if (data && data.candles && data.candles.length > 0 && data.candles[0].volume && volumeSeriesRef.current) {
              try {
                const volumeData = data.candles.map(candle => ({
                  time: candle.time,
                  value: candle.volume || 0,
                  color: candle.c >= candle.o 
                    ? 'rgba(16, 185, 129, 0.5)'  // green for up
                    : 'rgba(239, 68, 68, 0.5)'   // red for down
                }));
                
                volumeSeriesRef.current.setData(volumeData);
              } catch (err) {
                console.error("Error setting volume data:", err);
              }
            }
            
            // Apply trade markers after chart data is loaded
            setTimeout(() => {
              if (externalTrades && Array.isArray(externalTrades) && externalTrades.length > 0) {
                console.log("Applying external trade markers after chart initialization");
                updateTradeMarkers(externalTrades);
              } else {
                // Try to fetch and apply trade data
                fetchTrades()
                  .then(fetchedTrades => {
                    if (fetchedTrades && fetchedTrades.length > 0) {
                      console.log("Applying fetched trade markers after chart initialization");
                      updateTradeMarkers(fetchedTrades);
                    }
                  })
                  .catch(err => {
                    console.error("Error fetching trades for markers:", err);
                  });
              }
            }, 500);
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
  }, [pair, timeframe, cleanupChart, cleanupTimersAndIntervals, fetchCandleData, currentPrice]);

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

  // Set up trade data fetch
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;
    
    console.log("Fetching initial trade data");
    fetchTrades().catch(err => {
      console.error("Error fetching initial trade data:", err);
    });
    
    // Set up interval to refresh trade data
    const tradeUpdateInterval = setInterval(() => {
      if (isMountedRef.current && !isFetchingTrades) {
        fetchTrades().catch(err => {
          console.error("Error in trade interval fetch:", err);
        });
      }
    }, 30000);
    
    return () => {
      clearInterval(tradeUpdateInterval);
    };
  }, [fetchTrades]);

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

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    reloadChart: () => {
      console.log("Reload chart method called from parent");
      if (chartRef.current) {
        fetchCandleData().catch(err => {
          console.error("Error reloading chart data:", err);
        });
        
        fetchTrades().catch(err => {
          console.error("Error reloading trade data:", err);
        });
      } else {
        console.warn("Chart not initialized, cannot reload");
      }
    }
  }));
  
  // Sync with external trades
  useEffect(() => {
    if (externalTrades && Array.isArray(externalTrades)) {
      console.log(`Received ${externalTrades.length} external trades`);
      
      // Filter trades for the current pair and timeframe
      const filteredTrades = externalTrades.filter(trade => 
        trade.pair === pair && 
        (trade.timeframe === timeframe || !timeframe)
      );
      
      setTrades(filteredTrades);
      
      // Update markers if chart is ready
      if (chartRef.current && candlestickSeriesRef.current) {
        updateTradeMarkers(filteredTrades);
      }
    }
  }, [externalTrades, pair, timeframe, updateTradeMarkers]);

  // Create a separate effect specifically for updating markers when externalTrades change
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Local function to update markers without dependency on updateTradeMarkers
    const applyMarkers = () => {
      if (externalTrades && Array.isArray(externalTrades)) {
        console.log(`External trades updated, updating markers (${externalTrades.length} trades)`);
        
        // Filter trades for this pair and timeframe
        const relevantTrades = externalTrades.filter(trade => 
          trade.pair === pair && (trade.timeframe === timeframe || !timeframe)
        );
        
        if (relevantTrades.length === 0) {
          console.log('No relevant trades to display');
          return;
        }
        
        console.log(`Found ${relevantTrades.length} relevant trades for markers`);
        
        try {
          // Create markers for entry/exit points
          const markers = relevantTrades.flatMap(trade => {
            const time = new Date(trade.timestamp).getTime() / 1000;
            const markers = [];
            
            // Entry marker
            markers.push({
              time,
              position: trade.direction === 'buy' ? 'belowBar' : 'aboveBar',
              color: trade.direction === 'buy' ? '#10b981' : '#ef4444',
              shape: trade.direction === 'buy' ? 'arrowUp' : 'arrowDown',
              text: `Entry ${formatPrice(trade.entry, pair)}`,
              size: 2
            });
            
            // Exit marker (for closed trades)
            if (trade.status !== 'open') {
              markers.push({
                time: time + (60 * 60), // Add some time offset for visualization
                position: trade.direction === 'buy' ? 'aboveBar' : 'belowBar',
                color: trade.status === 'win' ? '#10b981' : '#ef4444',
                shape: 'circle',
                text: `Exit (${trade.status.toUpperCase()})`,
                size: 2
              });
            }
            
            return markers;
          });
          
          console.log(`Setting ${markers.length} markers on chart`);
          
          // Set markers to the appropriate series
          if (markerSeriesRef.current) {
            markerSeriesRef.current.setMarkers(markers);
          } else if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setMarkers(markers);
          }
          
          // Add price lines for open trades to visualize entry/exit levels
          if (candlestickSeriesRef.current) {
            // First, try to remove any existing trade price lines
            try {
              // Use a try-catch block since the priceLines method might not exist
              // Instead of trying to get all price lines, just attempt to remove the ones we know about
              // by their IDs (which we'll track in state)
              const openTrades = relevantTrades.filter(trade => trade.status === 'open');
              openTrades.forEach(trade => {
                try {
                  // Try to remove existing lines for this trade ID if they exist
                  candlestickSeriesRef.current.removePriceLine(trade.id + '_entry');
                  candlestickSeriesRef.current.removePriceLine(trade.id + '_sl');
                  candlestickSeriesRef.current.removePriceLine(trade.id + '_tp');
                } catch (err) {
                  // Ignore errors from removing non-existent lines
                }
              });
            } catch (err) {
              console.error("Error removing existing price lines:", err);
            }
            
            // Add new price lines for open trades
            const openTrades = relevantTrades.filter(trade => trade.status === 'open');
            openTrades.forEach(trade => {
              // Entry price line
              try {
                candlestickSeriesRef.current.createPriceLine({
                  price: trade.entry,
                  color: trade.direction === 'buy' ? '#10b981' : '#ef4444',
                  lineWidth: 2,
                  lineStyle: 1, // Solid
                  axisLabelVisible: false, // Hide axis label to prevent clutter
                  title: `Entry ${formatPrice(trade.entry, pair)}`,
                  id: trade.id + '_entry' // Use a simpler ID format
                });
                
                // No longer showing stop loss line
                
                // Take Profit price line
                candlestickSeriesRef.current.createPriceLine({
                  price: trade.takeProfit,
                  color: '#10b981', // Green
                  lineWidth: 2,
                  lineStyle: 3, // Dotted
                  axisLabelVisible: false, // Hide axis label to prevent clutter
                  title: `TP ${formatPrice(trade.takeProfit, pair)}`,
                  id: trade.id + '_tp'
                });
              } catch (err) {
                console.error("Error adding trade price lines:", err);
              }
            });
          }
        } catch (err) {
          console.error("Error setting markers:", err);
        }
      }
    };
    
    // Apply with a short timeout to ensure chart is ready
    const timerId = setTimeout(applyMarkers, 100);
    
    return () => clearTimeout(timerId);
  }, [externalTrades, pair, timeframe]);

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
            {formatPrice(currentPrice, pair)}
          </span>
          {lastUpdateTime && (
            <span className="text-xs text-gray-400">
              {lastUpdateTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
      
      {/* Trade progress indicator - removed as it's redundant with chart price lines */}
      
      {/* Trades panel */}
      <div 
        ref={tradesContainerRef}
        className="w-full bg-gray-900 border-t border-gray-700 overflow-auto"
        style={{ height: '150px', minHeight: '150px' }}
      >
        <div className="p-2 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">Trades</h3>
          <div className="text-xs text-gray-400">
            {trades.length} {trades.length === 1 ? 'trade' : 'trades'} for {pair} / {timeframe}
          </div>
        </div>
        
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No trades found for this pair and timeframe
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Direction</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entry</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stop Loss</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Take Profit</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">R:R</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {trades.map(trade => (
                  <tr key={trade.id} className="hover:bg-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {trade.direction === 'buy' ? (
                          <ArrowUp size={14} className="text-green-500 mr-1" />
                        ) : (
                          <ArrowDown size={14} className="text-red-500 mr-1" />
                        )}
                        <span className={trade.direction === 'buy' ? 'text-green-500' : 'text-red-500'}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-mono">
                      {formatPrice(trade.entry, pair)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-red-500">
                      {formatPrice(trade.stopLoss, pair)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-green-500">
                      {formatPrice(trade.takeProfit, pair)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {trade.riskReward}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full
                        ${trade.status === 'win' ? 'bg-green-100 text-green-800' : 
                          trade.status === 'loss' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                      {new Date(trade.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}); 