import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Navigation, Activity, Loader2, Plane, Clock, Globe } from 'lucide-react';

const createPlaneIcon = (heading) => {
  return L.divIcon({
    className: 'custom-plane-icon',
    html: `<div style="transform: rotate(${heading || 0}deg); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
               <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
             </svg>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const FlightDetailsPage = () => {
  const { id } = useParams(); // icao24
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/flights/track/${id}`);
        setFlight(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching flight details:', err);
        setError(err.response?.data?.message || 'Failed to locate this flight. It may have landed or lost signal.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
    
    // Poll every 10 seconds to update live position
    const interval = setInterval(fetchFlightDetails, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !flight) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-accent-500 mb-4" />
        <h2 className="text-xl font-medium text-white">Tracking Aircraft...</h2>
        <p className="text-slate-400">Connecting to global radar networks</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex flex-col items-center justify-center px-4">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-md text-center">
          <Plane size={40} className="mx-auto text-red-500 opacity-50 mb-4 rotate-180" />
          <h2 className="text-2xl font-bold text-white mb-2">Signal Lost</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button onClick={() => navigate('/search')} className="btn-secondary">
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-8 max-w-6xl mx-auto w-full">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* 3D Hero Section */}
      <div className="glass-panel p-8 mb-8 overflow-hidden relative perspective-1000">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Tracking
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
              {flight.callsign || 'Unknown Flight'}
            </h1>
            <p className="text-slate-300 flex items-center gap-2 text-lg">
              <Globe size={18} className="text-accent-500" />
              {flight.originCountry} • Registration: {flight.icao24.toUpperCase()}
            </p>
          </div>
          
          <div className="w-48 h-48 flex items-center justify-center animate-float-3d">
            {/* 3D Airplane Representation */}
            <div className="relative w-32 h-32 bg-accent-600/20 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center border border-accent-500/30">
              <Plane size={80} className="text-accent-500 -rotate-45 drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Telemetry */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-accent-500" /> Live Telemetry
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider block mb-1">Altitude</span>
                <span className="text-2xl font-bold text-white">
                  {flight.baroAltitude ? Math.round(flight.baroAltitude * 3.28084).toLocaleString() : '0'} <span className="text-sm font-normal text-slate-400">ft</span>
                </span>
              </div>
              
              <div className="bg-dark-900/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider block mb-1">Ground Speed</span>
                <span className="text-2xl font-bold text-white">
                  {flight.velocity ? Math.round(flight.velocity * 1.94384) : '0'} <span className="text-sm font-normal text-slate-400">kts</span>
                </span>
              </div>
              
              <div className="bg-dark-900/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider block mb-1">Heading</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {flight.trueTrack ? Math.round(flight.trueTrack) : 'N/A'}°
                  </span>
                  {flight.trueTrack && (
                    <Navigation size={20} className="text-accent-500" style={{ transform: `rotate(${flight.trueTrack}deg)` }} />
                  )}
                </div>
              </div>
              
              <div className="bg-dark-900/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider block mb-1">Vertical Rate</span>
                <span className={`text-xl font-bold ${flight.verticalRate > 0 ? 'text-emerald-400' : flight.verticalRate < 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {flight.verticalRate ? `${Math.round(flight.verticalRate * 196.85)} ft/m` : 'Level'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-accent-500" /> Last Contact
            </h3>
            <p className="text-slate-300 text-sm">
              Signal received {Math.floor(Date.now() / 1000) - flight.lastContact} seconds ago from ground stations.
            </p>
          </div>
        </div>

        {/* Right Column: Mini Map */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-2 h-full min-h-[400px] relative overflow-hidden">
            {(!flight.latitude || !flight.longitude) ? (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 z-10">
                <p className="text-slate-400 font-medium">Position data temporarily unavailable</p>
              </div>
            ) : null}
            
            <MapContainer 
              center={[flight.latitude || 0, flight.longitude || 0]} 
              zoom={8} 
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              preferCanvas={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {flight.latitude && flight.longitude && (
                <Marker
                  position={[flight.latitude, flight.longitude]}
                  icon={createPlaneIcon(flight.trueTrack)}
                >
                  <Popup className="custom-popup">
                    <div className="font-bold">{flight.callsign || 'Target'}</div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsPage;
