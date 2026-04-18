import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plane, Loader2, Navigation, ArrowLeft } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const navigate = useNavigate();

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    
    try {
      // In a real app, we'd hit /api/flights/search/:callsign
      // For this MVP with OpenSky, we'll fetch the live bounding box and filter it locally,
      // or if it was a real SaaS, we'd have a database of flight schedules.
      
      // We will simulate hitting the backend search API
      const { data } = await axios.get('http://localhost:5000/api/flights/live');
      
      // Filter results locally for demo purposes
      const queryUpper = searchQuery.toUpperCase();
      const filtered = data.filter(flight => 
        (flight.callsign && flight.callsign.toUpperCase().includes(queryUpper)) ||
        (flight.icao24 && flight.icao24.toUpperCase().includes(queryUpper)) ||
        (flight.originCountry && flight.originCountry.toUpperCase().includes(queryUpper))
      );
      
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-8 max-w-5xl mx-auto w-full">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="glass-panel p-6 mb-10">
        <form onSubmit={handleSearchSubmit} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-accent-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-32 py-4 bg-dark-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-all"
            placeholder="Search flight number, airline, or country..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 bottom-2 top-2 bg-accent-600 hover:bg-accent-500 text-white font-medium px-6 rounded-lg transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      <div>
        {hasSearched && (
          <h2 className="text-xl font-semibold text-white mb-6">
            Results for "{query}" <span className="text-slate-500 text-base font-normal">({results.length} found)</span>
          </h2>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={40} className="animate-spin text-accent-500 mb-4" />
            <p>Scanning global airspace...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="glass-panel py-16 text-center border-dashed border-2 border-slate-700/50">
            <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No flights found</h3>
            <p className="text-slate-400">We couldn't find any active flights matching "{query}".</p>
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
                      {flight.callsign || 'N/A'}
                    </h3>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{flight.originCountry}</span>
                  </div>
                  <div className="bg-dark-900 border border-slate-700 px-2.5 py-1 rounded-md text-xs font-mono text-accent-400">
                    {flight.icao24}
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
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Airborne
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
