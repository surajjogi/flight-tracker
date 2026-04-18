import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Plane, Navigation, Activity, Clock, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Create a highly optimized custom plane icon
const createPlaneIcon = (heading) => {
  return L.divIcon({
    className: 'custom-plane-icon',
    // Removed expensive CSS filters (drop-shadow) for huge performance gain
    html: `<div style="transform: rotate(${heading || 0}deg); width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
               <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
             </svg>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const LiveTrackerPage = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchFlights = async () => {
    try {
      // Fetch global data without bounding box
      const { data } = await axios.get('http://localhost:5000/api/flights/live');
      setFlights(data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching live flights:', err);
      // We don't overwrite flights on error so the map doesn't clear if rate limited
      setError('Could not update live data. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    // Poll every 15 seconds to respect rate limits
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-76px)]">
      {/* Top Status Bar */}
      <div className="bg-dark-800 border-b border-slate-700 px-6 py-3 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity size={20} className="text-accent-500" />
            Live Radar
          </h2>
          <span className="text-sm text-slate-400 bg-dark-900 px-3 py-1 rounded-full border border-slate-700 hidden md:inline-block">
            {flights.length} Aircraft Tracked
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {error && <span className="text-amber-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> {error}</span>}
          {loading && flights.length === 0 ? (
            <span className="text-accent-400 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Fetching radar...
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-2">
              <Clock size={16} /> Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-grow relative z-0">
        <MapContainer 
          center={[39.8283, -98.5795]} // Center of US
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          preferCanvas={true}
        >
          {/* Dark Mode Map Tiles (CartoDB Dark Matter) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {flights.map((flight) => {
            // Some flights might not have lat/lng if on ground or incomplete data
            if (!flight.latitude || !flight.longitude) return null;

            return (
              <Marker
                key={flight.icao24}
                position={[flight.latitude, flight.longitude]}
                icon={createPlaneIcon(flight.trueTrack)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="flex justify-between items-center mb-3 border-b border-slate-600 pb-2">
                      <h3 className="font-bold text-lg text-white m-0 leading-none">
                        {flight.callsign || 'Unknown'}
                      </h3>
                      <span className="bg-accent-500/20 text-accent-400 text-xs px-2 py-1 rounded font-medium">
                        {flight.icao24}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Altitude</span>
                        <span className="text-slate-100 font-medium">
                          {flight.altitude ? `${Math.round(flight.altitude * 3.28084)} ft` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Speed</span>
                        <span className="text-slate-100 font-medium">
                          {flight.velocity ? `${Math.round(flight.velocity * 1.94384)} kts` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Heading</span>
                        <span className="text-slate-100 font-medium flex items-center gap-1">
                          {flight.trueTrack ? Math.round(flight.trueTrack) + '°' : 'N/A'}
                          {flight.trueTrack && <Navigation size={12} style={{ transform: `rotate(${flight.trueTrack}deg)` }} />}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Origin Country</span>
                        <span className="text-slate-100 font-medium truncate block" title={flight.originCountry}>
                          {flight.originCountry}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/flight/${flight.icao24}`)}
                      className="w-full mt-4 bg-accent-600 hover:bg-accent-500 text-white text-xs font-medium py-2 rounded transition-colors"
                    >
                      View Full Flight Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackerPage;
