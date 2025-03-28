import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminDashboard() {
  const [routingMap, setRoutingMap] = useState({});
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountUsage, setAccountUsage] = useState({});
  const [proxyUsage, setProxyUsage] = useState({});
  const [activeTab, setActiveTab] = useState('routing');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch routing data
        const routingResponse = await fetch('/api/routing');
        if (!routingResponse.ok) {
          throw new Error(`Error fetching routing data: ${routingResponse.status}`);
        }
        const routingData = await routingResponse.json();
        setRoutingMap(routingData.routing || {});
        
        // Calculate account and proxy usage from routing
        const accountCounts = {};
        const proxyCounts = {};
        
        Object.entries(routingData.routing || {}).forEach(([pair, info]) => {
          // Count account usage
          const accountId = info.accountId;
          if (accountId) {
            accountCounts[accountId] = (accountCounts[accountId] || 0) + 1;
          }
          
          // Count proxy usage
          const proxyHost = info.proxyHost;
          if (proxyHost) {
            proxyCounts[proxyHost] = (proxyCounts[proxyHost] || 0) + 1;
          }
        });
        
        setAccountUsage(accountCounts);
        setProxyUsage(proxyCounts);
        
        // Fetch usage statistics
        const usageResponse = await fetch('/api/usage');
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setUsageStats(usageData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format date for readability
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Nervala Admin Dashboard</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-emerald-400">Admin Dashboard</h1>
        
        {/* Admin Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'routing' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('routing')}
          >
            Account Routing
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'usage' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('usage')}
          >
            API Usage Stats
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-pulse text-xl">Loading data...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'routing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Usage Panel */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
                    Account Routing
                  </h2>
                  
                  <div className="space-y-4">
                    {Object.entries(accountUsage).length > 0 ? (
                      <>
                        <div className="grid grid-cols-5 gap-2 font-medium text-gray-400 border-b border-gray-700 pb-2">
                          <div className="col-span-3">Account ID</div>
                          <div className="col-span-1 text-center">Pairs</div>
                          <div className="col-span-1 text-center">Load %</div>
                        </div>
                        
                        {Object.entries(accountUsage).map(([accountId, count]) => {
                          const percentage = (count / Object.keys(routingMap).length) * 100;
                          
                          return (
                            <div key={accountId} className="grid grid-cols-5 gap-2 py-2 border-b border-gray-700">
                              <div className="col-span-3 font-mono truncate">{accountId}</div>
                              <div className="col-span-1 text-center">{count}</div>
                              <div className="col-span-1 text-center">
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                  <div 
                                    className="bg-emerald-500 h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-gray-400">No account usage data found</p>
                    )}
                  </div>
                </div>
                
                {/* Proxy Usage Panel */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
                    Proxy Routing
                  </h2>
                  
                  <div className="space-y-4">
                    {Object.entries(proxyUsage).length > 0 ? (
                      <>
                        <div className="grid grid-cols-5 gap-2 font-medium text-gray-400 border-b border-gray-700 pb-2">
                          <div className="col-span-3">Proxy Host</div>
                          <div className="col-span-1 text-center">Pairs</div>
                          <div className="col-span-1 text-center">Load %</div>
                        </div>
                        
                        {Object.entries(proxyUsage).map(([proxyHost, count]) => {
                          const percentage = (count / Object.keys(routingMap).length) * 100;
                          
                          return (
                            <div key={proxyHost} className="grid grid-cols-5 gap-2 py-2 border-b border-gray-700">
                              <div className="col-span-3 truncate">{proxyHost}</div>
                              <div className="col-span-1 text-center">{count}</div>
                              <div className="col-span-1 text-center">
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                  <div 
                                    className="bg-emerald-500 h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-gray-400">No proxy usage data found</p>
                    )}
                  </div>
                </div>
                
                {/* Detailed Routing Table */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:col-span-2">
                  <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
                    Currency Pair Routing
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-700 text-gray-300">
                          <th className="py-2 px-4 text-left">Currency Pair</th>
                          <th className="py-2 px-4 text-left">Account ID</th>
                          <th className="py-2 px-4 text-left">Proxy Host</th>
                          <th className="py-2 px-4 text-left">Proxy Username</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {Object.entries(routingMap).map(([pair, info]) => (
                          <tr key={pair} className="hover:bg-gray-700">
                            <td className="py-2 px-4 font-medium">{pair}</td>
                            <td className="py-2 px-4 font-mono">{info.accountId || 'N/A'}</td>
                            <td className="py-2 px-4">{info.proxyHost || 'N/A'}</td>
                            <td className="py-2 px-4">{info.proxyUsername || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'usage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* API Usage Overview */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-emerald-400">
                      API Usage Statistics
                    </h2>
                    <div className="text-sm text-gray-400">
                      Last Reset: {usageStats?.lastReset ? formatDate(usageStats.lastReset) : 'N/A'}
                    </div>
                  </div>
                  
                  {!usageStats ? (
                    <p className="text-gray-400">No usage statistics available yet</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">Total Accounts</h3>
                        <p className="text-2xl font-bold text-emerald-400">
                          {Object.keys(usageStats.accounts || {}).length}
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">Total Proxies</h3>
                        <p className="text-2xl font-bold text-emerald-400">
                          {Object.keys(usageStats.proxies || {}).length}
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">Monitored Pairs</h3>
                        <p className="text-2xl font-bold text-emerald-400">
                          {Object.keys(usageStats.pairs || {}).length}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Account API Hits */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
                    Account API Usage
                  </h2>
                  
                  {usageStats && Object.keys(usageStats.accounts || {}).length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-2 font-medium text-gray-400 border-b border-gray-700 pb-2">
                        <div className="col-span-2">Account</div>
                        <div className="col-span-1 text-center">Hits</div>
                        <div className="col-span-1 text-center">%</div>
                        <div className="col-span-1 text-center">Last Hit</div>
                      </div>
                      
                      {Object.entries(usageStats.accounts || {}).map(([accountId, data]) => (
                        <div key={accountId} className="grid grid-cols-5 gap-2 py-2 border-b border-gray-700">
                          <div className="col-span-2 font-mono truncate text-sm">{accountId}</div>
                          <div className="col-span-1 text-center">{data.hits}</div>
                          <div className="col-span-1 text-center">
                            {usageStats.accounts[accountId]?.percentage?.toFixed(1) || 0}%
                          </div>
                          <div className="col-span-1 text-center text-xs">
                            {data.lastHit ? new Date(data.lastHit).toLocaleTimeString() : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No account usage data available</p>
                  )}
                </div>
                
                {/* Proxy API Hits */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
                    Proxy API Usage
                  </h2>
                  
                  {usageStats && Object.keys(usageStats.proxies || {}).length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-2 font-medium text-gray-400 border-b border-gray-700 pb-2">
                        <div className="col-span-2">Proxy</div>
                        <div className="col-span-1 text-center">Hits</div>
                        <div className="col-span-1 text-center">%</div>
                        <div className="col-span-1 text-center">Last Hit</div>
                      </div>
                      
                      {Object.entries(usageStats.proxies || {}).map(([proxyHost, data]) => (
                        <div key={proxyHost} className="grid grid-cols-5 gap-2 py-2 border-b border-gray-700">
                          <div className="col-span-2 truncate text-sm">{proxyHost}</div>
                          <div className="col-span-1 text-center">{data.hits}</div>
                          <div className="col-span-1 text-center">
                            {usageStats.proxies[proxyHost]?.percentage?.toFixed(1) || 0}%
                          </div>
                          <div className="col-span-1 text-center text-xs">
                            {data.lastHit ? new Date(data.lastHit).toLocaleTimeString() : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No proxy usage data available</p>
                  )}
                </div>
                
                {/* Currency Pair Hits */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:col-span-2">
                  <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
                    Currency Pair Request Frequency
                  </h2>
                  
                  {usageStats && Object.keys(usageStats.pairs || {}).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-700 text-gray-300">
                            <th className="py-2 px-4 text-left">Currency Pair</th>
                            <th className="py-2 px-4 text-center">API Hits</th>
                            <th className="py-2 px-4 text-right">Last Requested</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {Object.entries(usageStats.pairs || {}).sort((a, b) => b[1].hits - a[1].hits).map(([pair, data]) => (
                            <tr key={pair} className="hover:bg-gray-700">
                              <td className="py-2 px-4 font-medium">{pair}</td>
                              <td className="py-2 px-4 text-center">{data.hits}</td>
                              <td className="py-2 px-4 text-right text-sm">
                                {data.lastHit ? formatDate(data.lastHit) : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400">No currency pair usage data available</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 