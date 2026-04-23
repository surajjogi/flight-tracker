import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Sparkles, MapPin, Navigation, Loader2, Clock, DollarSign,
  Plane, Train, Bus, Car, Footprints, ArrowRight, Star, Zap, Wallet,
  ChevronDown, ChevronUp, Lightbulb, Calendar, Shield, Leaf
} from 'lucide-react';

const MODE_ICONS = {
  flight: Plane,
  train: Train,
  bus: Bus,
  drive: Car,
  car: Car,
  taxi: Car,
  walk: Footprints,
  walking: Footprints,
  metro: Train,
  subway: Train,
  mixed: Navigation,
};

const PREFERENCE_OPTIONS = [
  { key: 'balanced', label: 'Best Overall', icon: Star, color: 'accent' },
  { key: 'cost', label: 'Cheapest', icon: Wallet, color: 'emerald' },
  { key: 'time', label: 'Fastest', icon: Zap, color: 'amber' },
];

const RatingDots = ({ rating, max = 5, color = 'accent' }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-all ${
          i < rating
            ? color === 'emerald' ? 'bg-emerald-400' :
              color === 'amber' ? 'bg-amber-400' :
              color === 'blue' ? 'bg-blue-400' : 'bg-accent-500'
            : 'bg-slate-700'
        }`}
      />
    ))}
  </div>
);

const TravelPlannerPage = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preference, setPreference] = useState('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [travelPlan, setTravelPlan] = useState(null);
  const [error, setError] = useState('');
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [rawResponse, setRawResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setIsLoading(true);
    setError('');
    setTravelPlan(null);
    setRawResponse('');
    setExpandedRoute(null);

    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/travel-plan', {
        origin: origin.trim(),
        destination: destination.trim(),
        preference,
      });

      if (data.parseError) {
        setRawResponse(data.rawResponse || 'AI returned an unparseable response.');
        setError('AI response could not be structured. Showing raw text below.');
      } else {
        setTravelPlan(data);
        // Auto-expand the recommended route
        const recommended = data.routes?.findIndex(r => r.recommended);
        setExpandedRoute(recommended >= 0 ? recommended : 0);
      }
    } catch (err) {
      console.error('Travel plan error:', err);
      setError(err.response?.data?.message || 'Failed to generate travel plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const getModeIcon = (mode) => {
    const key = (mode || 'mixed').toLowerCase();
    return MODE_ICONS[key] || Navigation;
  };

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-8 max-w-5xl mx-auto w-full">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold mb-4">
          <Sparkles size={14} />
          AI-Powered Travel Planner
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Find the <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-accent-500">Best Route</span> Anywhere
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          AI analyzes thousands of routes to find you the cheapest, fastest, or most comfortable way to travel between any two places.
        </p>
      </div>

      {/* Search Form */}
      <div className="glass-panel p-6 md:p-8 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Origin & Destination */}
          <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-dark-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                placeholder="From — city, airport, or address"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={swapLocations}
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 self-center bg-dark-900/80 border border-slate-700 rounded-full hover:bg-slate-700 hover:border-purple-500/50 transition-all group shrink-0"
              title="Swap origin and destination"
            >
              <ArrowRight size={18} className="text-slate-400 group-hover:text-purple-400 transition-colors md:rotate-0 rotate-90" />
            </button>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20"></div>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-dark-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                placeholder="To — city, airport, or address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Preference Selector */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-slate-400 text-sm self-center mr-2">Optimize for:</span>
            {PREFERENCE_OPTIONS.map((pref) => {
              const Icon = pref.icon;
              const isActive = preference === pref.key;
              return (
                <button
                  key={pref.key}
                  type="button"
                  onClick={() => setPreference(pref.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? pref.color === 'emerald'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : pref.color === 'amber'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-accent-500/15 border-accent-500/40 text-accent-400'
                      : 'bg-dark-900/40 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  {pref.label}
                </button>
              );
            })}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !origin.trim() || !destination.trim()}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-accent-600 hover:from-purple-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-10 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                AI is analyzing routes...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Find Best Routes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-panel p-6 mb-8 border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-medium">{error}</p>
          {rawResponse && (
            <pre className="mt-4 text-sm text-slate-300 bg-dark-900/80 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
              {rawResponse}
            </pre>
          )}
        </div>
      )}

      {/* Loading Animation */}
      {isLoading && (
        <div className="glass-panel p-12 text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={32} className="text-purple-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI Analyzing Routes</h3>
          <p className="text-slate-400">Comparing costs, travel times, and comfort levels...</p>
          <div className="flex justify-center gap-6 mt-6 text-sm text-slate-500">
            <span className="flex items-center gap-2"><Clock size={14} /> Checking times</span>
            <span className="flex items-center gap-2"><DollarSign size={14} /> Comparing costs</span>
            <span className="flex items-center gap-2"><MapPin size={14} /> Finding routes</span>
          </div>
        </div>
      )}

      {/* Results */}
      {travelPlan && travelPlan.routes && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Route Cards */}
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Navigation size={22} className="text-purple-400" />
            {origin} → {destination}
            <span className="text-sm text-slate-500 font-normal">({travelPlan.routes.length} options)</span>
          </h2>

          {travelPlan.routes.map((route, idx) => {
            const ModeIcon = getModeIcon(route.type);
            const isExpanded = expandedRoute === idx;

            return (
              <div
                key={route.id || idx}
                className={`glass-panel overflow-hidden transition-all duration-300 ${
                  route.recommended
                    ? 'border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'hover:border-slate-600'
                }`}
              >
                {/* Route Header */}
                <div
                  className="p-5 md:p-6 cursor-pointer group"
                  onClick={() => setExpandedRoute(isExpanded ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        route.recommended
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <ModeIcon size={24} />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                            {route.title}
                          </h3>
                          {route.recommended && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <Star size={10} /> Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm capitalize">{route.type} route • {route.bestFor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                          <Clock size={16} className="text-amber-400" />
                          {route.totalDuration}
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <DollarSign size={14} />
                          {route.totalCost}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Mobile cost/time */}
                  <div className="flex gap-4 mt-3 sm:hidden">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Clock size={14} className="text-amber-400" /> {route.totalDuration}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <DollarSign size={14} /> {route.totalCost}
                    </span>
                  </div>

                  {/* Ratings Bar */}
                  <div className="flex flex-wrap gap-6 mt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Cost</span>
                      <RatingDots rating={6 - (route.costRating || 3)} color="emerald" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Speed</span>
                      <RatingDots rating={6 - (route.timeRating || 3)} color="amber" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Comfort</span>
                      <RatingDots rating={route.comfortRating || 3} color="blue" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 px-5 md:px-6 pb-6 pt-4 space-y-6 animate-fade-in-up">
                    {/* Journey Segments */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Journey Segments</h4>
                      <div className="space-y-0">
                        {route.segments?.map((segment, sIdx) => {
                          const SegIcon = getModeIcon(segment.mode);
                          return (
                            <div key={sIdx} className="flex gap-4">
                              {/* Timeline Line */}
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-dark-900 border-2 border-slate-600 flex items-center justify-center shrink-0 z-10">
                                  <SegIcon size={14} className="text-accent-400" />
                                </div>
                                {sIdx < route.segments.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-slate-700 min-h-[24px]"></div>
                                )}
                              </div>

                              {/* Segment Details */}
                              <div className="pb-5 flex-1">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <span className="text-white font-medium">
                                    {segment.from} → {segment.to}
                                  </span>
                                  <span className="text-xs text-slate-400 bg-dark-900 px-2 py-0.5 rounded-md shrink-0 capitalize">
                                    {segment.mode}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-400">{segment.details}</p>
                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                  {segment.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock size={10} /> {segment.duration}
                                    </span>
                                  )}
                                  {segment.cost && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign size={10} /> {segment.cost}
                                    </span>
                                  )}
                                </div>
                                {segment.tips && (
                                  <p className="text-xs text-purple-400/70 mt-1 flex items-start gap-1">
                                    <Lightbulb size={10} className="mt-0.5 shrink-0" />
                                    {segment.tips}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {route.pros && route.pros.length > 0 && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                          <h5 className="text-sm font-semibold text-emerald-400 mb-2">✓ Advantages</h5>
                          <ul className="space-y-1.5">
                            {route.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {route.cons && route.cons.length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                          <h5 className="text-sm font-semibold text-red-400 mb-2">✗ Disadvantages</h5>
                          <ul className="space-y-1.5">
                            {route.cons.map((con, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Travel Tips & Best Time */}
          {(travelPlan.travelTips || travelPlan.bestTimeToTravel) && (
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {travelPlan.travelTips && travelPlan.travelTips.length > 0 && (
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-400" />
                    Travel Tips
                  </h3>
                  <ul className="space-y-3">
                    {travelPlan.travelTips.map((tip, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {travelPlan.bestTimeToTravel && (
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-purple-400" />
                    Best Time to Travel
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{travelPlan.bestTimeToTravel}</p>

                  <div className="mt-6 flex gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-dark-900/50 px-3 py-2 rounded-lg border border-slate-700/50">
                      <Shield size={12} className="text-emerald-400" />
                      AI-Generated Estimates
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-dark-900/50 px-3 py-2 rounded-lg border border-slate-700/50">
                      <Leaf size={12} className="text-emerald-400" />
                      Eco Options Included
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !travelPlan && !error && (
        <div className="text-center py-12">
          <div className="glass-panel inline-block p-8 max-w-lg">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">How it works</h3>
            <p className="text-slate-400 mb-6 text-sm">Enter your origin and destination above, and our AI will find you the best travel routes.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <DollarSign size={18} className="text-emerald-400" />
                </div>
                <span className="text-xs text-slate-400">Cost Comparison</span>
              </div>
              <div>
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock size={18} className="text-amber-400" />
                </div>
                <span className="text-xs text-slate-400">Time Analysis</span>
              </div>
              <div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star size={18} className="text-blue-400" />
                </div>
                <span className="text-xs text-slate-400">AI Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPlannerPage;
