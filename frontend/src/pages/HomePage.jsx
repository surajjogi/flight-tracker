import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Plane, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
          </span>
          Live Global Coverage
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Track Any Flight,<br />Anywhere in Real-Time
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Experience the most advanced live flight tracking platform. Search by flight number, airline, or airport and watch planes move across the globe instantly.
        </p>

        {/* Smart Search Bar */}
        <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-500 group-focus-within:text-accent-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-32 py-5 bg-dark-800/80 border-2 border-slate-700/50 rounded-2xl text-lg text-white placeholder-slate-500 focus:ring-0 focus:border-accent-500 backdrop-blur-xl shadow-2xl transition-all"
              placeholder="e.g. AI101, Emirates, LHR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2.5 bottom-2.5 top-2.5 bg-accent-600 hover:bg-accent-500 text-white font-semibold px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-accent-500/25"
            >
              Search
            </button>
          </form>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"><Plane size={16} /> Flight No.</span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"><MapPin size={16} /> Airport Code</span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">Airline Name</span>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mt-24 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="glass-panel p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <MapPin className="text-blue-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Map View</h3>
          <p className="text-slate-400">Watch thousands of aircraft moving in real-time across our interactive global map.</p>
        </div>
        
        <div className="glass-panel p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <Plane className="text-purple-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Detailed Analytics</h3>
          <p className="text-slate-400">Access in-depth metrics including altitude, speed, heading, and aircraft type instantly.</p>
        </div>
        
        <div className="glass-panel p-6 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer" onClick={() => navigate('/live')}>
          <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-500/20 transition-colors">
            <ArrowRight className="text-accent-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Explore Live Now</h3>
          <p className="text-slate-400">Jump straight into the radar and see what's flying above you right this second.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
