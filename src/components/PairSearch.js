import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

// This should match the currencies your algorithm supports
const SUPPORTED_PAIRS = [
  'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'USD_CAD', 'AUD_USD', 'NZD_USD',
  'EUR_JPY', 'EUR_GBP', 'EUR_CHF', 'EUR_CAD', 'EUR_AUD', 'EUR_NZD',
  'GBP_JPY', 'GBP_CHF', 'GBP_CAD', 'GBP_AUD', 'GBP_NZD',
  'AUD_JPY', 'AUD_CAD', 'AUD_CHF', 'AUD_NZD',
  'NZD_JPY', 'NZD_CAD', 'NZD_CHF',
  'CAD_JPY', 'CAD_CHF', 'CHF_JPY',
  'US30_USD', 'SPX500_USD', 'NAS100_USD', 'JP225_USD', 'UK100_GBP', 'DE30_EUR',
  'XAU_USD', 'XAG_USD', 'BCO_USD', 'WTICO_USD',
  'BTC_USD', 'ETH_USD'
];

// Simple debounce function
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function PairSearch({ selectedPair, onSelectPair }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPairs, setFilteredPairs] = useState(SUPPORTED_PAIRS);
  const searchInputRef = useRef(null);
  const keyListenerRef = useRef(null);
  
  // Create a debounced search term setter
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 150),
    []
  );
  
  // Enable global search with keyboard anywhere on the page
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key presses in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Open search dialog on any letter or number key
      if (
        (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) ||
        e.key === '/'
      ) {
        e.preventDefault();
        setOpen(true);
        // Set a small delay to ensure the dialog is open before setting focus
        setTimeout(() => {
          if (searchInputRef.current) {
            const initialValue = e.key === '/' ? '' : e.key;
            searchInputRef.current.value = initialValue;
            searchInputRef.current.focus();
            debouncedSetSearchTerm(initialValue);
          }
        }, 50);
      }
    };

    // Only add the event listener if it's not already added
    if (!keyListenerRef.current) {
      window.addEventListener('keydown', handleKeyDown);
      keyListenerRef.current = handleKeyDown;
    }
    
    return () => {
      if (keyListenerRef.current) {
        window.removeEventListener('keydown', keyListenerRef.current);
        keyListenerRef.current = null;
      }
    };
  }, [debouncedSetSearchTerm]);

  // Filter pairs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPairs(SUPPORTED_PAIRS);
      return;
    }

    const filtered = SUPPORTED_PAIRS.filter((pair) =>
      pair.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPairs(filtered);
  }, [searchTerm]);

  // Handle pair selection
  const handleSelectPair = (pair) => {
    if (pair !== selectedPair) {
      onSelectPair(pair);
    }
    setOpen(false);
    setSearchTerm('');
  };

  // Handle input changes with debounce
  const handleInputChange = (e) => {
    debouncedSetSearchTerm(e.target.value);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Search size={16} />
        <span>{selectedPair}</span>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 p-4">
            <div className="flex items-center gap-2 mb-4 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pairs (e.g., EUR_USD, BTC...)"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-emerald-500"
                defaultValue={searchTerm}
                onChange={handleInputChange}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    if (searchInputRef.current) {
                      searchInputRef.current.value = '';
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {filteredPairs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No pairs found matching your search
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-2">
                  {filteredPairs.map((pair) => (
                    <li key={pair}>
                      <button
                        onClick={() => handleSelectPair(pair)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedPair === pair
                            ? 'bg-emerald-800 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pair}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <Dialog.Close asChild>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
} 