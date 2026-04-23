import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plane, Loader2, Navigation, ArrowLeft, Filter, Hash, Globe, Radio } from 'lucide-react';

const SEARCH_FILTERS = [
  { key: 'all', label: 'All Fields', icon: Search },
  { key: 'callsign', label: 'Flight No / Callsign', icon: Hash },
  { key: 'icao24', label: 'ICAO24 Code', icon: Radio },
  { key: 'country', label: 'Country', icon: Globe },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const filterParam = searchParams.get('filter') || 'all';
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filterParam);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  // Case-insensitive local filter based on selected filter tab
  const applyLocalFilter = (flights, searchQuery, filter) => {
    if (!searchQuery.trim()) return flights;
    
    const queryLower = searchQuery.trim().toLowerCase();
    
    return flights.filter(flight => {
      switch (filter) {
        case 'callsign':
          return (flight.callsign || '').toLowerCase().includes(queryLower);
        case 'icao24':
          return (flight.icao24 || '').toLowerCase().includes(queryLower);
        case 'country':
          return (flight.originCountry || '').toLowerCase().includes(queryLower);
        case 'all':
        default:
          return (
            (flight.callsign || '').toLowerCase().includes(queryLower) ||
            (flight.icao24 || '').toLowerCase().includes(queryLower) ||
            (flight.originCountry || '').toLowerCase().includes(queryLower)
          );
      }
    });
  };

  const performSearch = async (searchQuery, filter = activeFilter) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    setErrorMsg('');
    
    try {
      // Use the new backend search endpoint
      const { data } = await axios.get('http://localhost:5000/api/flights/search', {
        params: { q: searchQuery.trim() }
      });
      
      // Apply additional local filter if a specific field is selected
      const allResults = data.results || [];
      const filtered = filter === 'all' ? allResults : applyLocalFilter(allResults, searchQuery, filter);
      
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      
      // Fallback: if backend search fails, try fetching all flights and filtering locally
      try {
        const { data } = await axios.get('http://localhost:5000/api/flights/live');
        const filtered = applyLocalFilter(data, searchQuery, filter);
        setResults(filtered);
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        setErrorMsg('Unable to connect to flight data. Please check if the server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setSearchInput(query);
      performSearch(query, filterParam);
    }
  }, [query, filterParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), filter: activeFilter });
    }
  };

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
    if (query) {
      setSearchParams({ q: query, filter: filterKey });
    }
  };

  // Highlight matching text in results
  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery || !text) return text;
    
    const queryLower = searchQuery.toLowerCase();
    const textStr = String(text);
    const idx = textStr.toLowerCase().indexOf(queryLower);
    
    if (idx === -1) return textStr;
    
    const before = textStr.substring(0, idx);
    const match = textStr.substring(idx, idx + queryLower.length);
    const after = textStr.substring(idx + queryLower.length);
    
    return (
      <span>
        {before}
        <span className="bg-accent-500/30 text-accent-300 rounded px-0.5">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-8 max-w-5xl mx-auto w-full">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Search Panel */}
      <div className="glass-panel p-6 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-accent-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-32 py-4 bg-dark-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-all"
            placeholder="Search by flight number, callsign, ICAO code, or country..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 bottom-2 top-2 bg-accent-600 hover:bg-accent-500 text-white font-medium px-6 rounded-lg transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-3">
          Search is case-insensitive — type in uppercase or lowercase, it doesn't matter!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SEARCH_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? 'bg-accent-600/20 border-accent-500/50 text-accent-400 shadow-lg shadow-accent-500/10'
                  : 'bg-dark-800/40 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <Icon size={14} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Results Section */}
      <div>
        {hasSearched && (
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            Results for "{query}" 
            <span className="text-slate-500 text-base font-normal">({results.length} found)</span>
            {activeFilter !== 'all' && (
              <span className="text-xs bg-accent-600/20 text-accent-400 border border-accent-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Filter size={10} />
                {SEARCH_FILTERS.find(f => f.key === activeFilter)?.label}
              </span>
            )}
          </h2>
        )}

        {errorMsg && (
          <div className="glass-panel py-10 text-center border-dashed border-2 border-red-500/30 mb-6">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Connection Error</h3>
            <p className="text-slate-400 max-w-md mx-auto">{errorMsg}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={40} className="animate-spin text-accent-500 mb-4" />
            <p>Scanning global airspace...</p>
          </div>
        ) : hasSearched && results.length === 0 && !errorMsg ? (
          <div className="glass-panel py-16 text-center border-dashed border-2 border-slate-700/50">
            <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No flights found</h3>
            <p className="text-slate-400 mb-4">We couldn't find any active flights matching "{query}".</p>
            <div className="text-sm text-slate-500 max-w-md mx-auto space-y-1">
              <p>💡 Tips: Try searching with different terms</p>
              <p>• Flight number (e.g., <span className="text-accent-400">AI101</span>, <span className="text-accent-400">UAL123</span>)</p>
              <p>• ICAO24 code (e.g., <span className="text-accent-400">a0b1c2</span>)</p>
              <p>• Country name (e.g., <span className="text-accent-400">India</span>, <span className="text-accent-400">United States</span>)</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((flight) => (
              <div 
                key={flight.icao24} 
                onClick={() => navigate(`/flight/${flight.icao24}`)}
                className="glass-panel p-5 hover:border-accent-500/50 hover:bg-dark-800/80 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white leading-none mb-1 group-hover:text-accent-400 transition-colors">
                      {highlightMatch(flight.callsign || 'N/A', query)}
                    </h3>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      {highlightMatch(flight.originCountry, query)}
                    </span>
                  </div>
                  <div className="bg-dark-900 border border-slate-700 px-2.5 py-1 rounded-md text-xs font-mono text-accent-400">
                    {highlightMatch(flight.icao24, query)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Altitude</span>
                    <span className="text-slate-200 font-medium">{flight.altitude ? `${Math.round(flight.altitude * 3.28084)} ft` : 'Ground'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Speed</span>
                    <span className="text-slate-200 font-medium">{flight.velocity ? `${Math.round(flight.velocity * 1.94384)} kts` : '0 kts'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Heading</span>
                    <span className="text-slate-200 font-medium flex items-center gap-1">
                      {flight.trueTrack ? `${Math.round(flight.trueTrack)}°` : 'N/A'}
                      {flight.trueTrack && <Navigation size={12} className="text-accent-500" style={{ transform: `rotate(${flight.trueTrack}deg)` }} />}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs mb-1">Status</span>
                    <span className={`font-medium flex items-center gap-1 ${flight.onGround ? 'text-amber-400' : 'text-emerald-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${flight.onGround ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                      {flight.onGround ? 'On Ground' : 'Airborne'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
