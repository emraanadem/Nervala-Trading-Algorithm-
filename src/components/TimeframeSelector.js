import { useState, useCallback } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Clock } from 'lucide-react';
import clsx from 'clsx';

const timeframes = [
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '2h', label: '2h' },
  { value: '4h', label: '4h' },
  { value: 'D', label: 'Daily' },
  { value: 'W', label: 'Weekly' },
];

export default function TimeframeSelector({ selectedTimeframe, onSelectTimeframe }) {
  // Only call onSelectTimeframe if the value actually changed
  const handleValueChange = useCallback((value) => {
    if (value !== selectedTimeframe) {
      onSelectTimeframe(value);
    }
  }, [selectedTimeframe, onSelectTimeframe]);

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-emerald-500" />
        <h3 className="font-medium">Timeframe</h3>
      </div>
      
      <Tabs.Root 
        value={selectedTimeframe} 
        onValueChange={handleValueChange}
        className="flex flex-col"
      >
        <Tabs.List className="flex flex-wrap gap-2">
          {timeframes.map((timeframe) => (
            <Tabs.Trigger
              key={timeframe.value}
              value={timeframe.value}
              className={clsx(
                "px-3 py-1 text-sm rounded-md transition-colors",
                "data-[state=active]:bg-emerald-600 data-[state=active]:text-white",
                "data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-400",
                "hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
              )}
            >
              {timeframe.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
} 