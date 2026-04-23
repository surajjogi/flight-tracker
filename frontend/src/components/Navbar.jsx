import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Search, User, Menu, X, LogOut, Map, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-4 mx-4 z-50 px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-accent-500/20 p-2 rounded-xl group-hover:bg-accent-500/30 transition-colors">
            <Plane className="text-accent-500 w-6 h-6 rotate-45" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AeroTrack
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/live" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Map size={18} />
            <span>Live Map</span>
          </Link>
          <Link to="/search" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Search size={18} />
            <span>Search</span>
          </Link>
          <Link to="/travel-planner" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Sparkles size={18} />
            <span>AI Planner</span>
          </Link>
          
          <div className="h-6 w-px bg-slate-700"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <User size={18} />
                <span>{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
                Log In
              </Link>
              <Link to="/register" className="btn-primary py-1.5 px-4">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-4">
          <Link to="/live" className="text-slate-300 hover:text-white px-2 py-1" onClick={() => setIsMenuOpen(false)}>Live Map</Link>
          <Link to="/search" className="text-slate-300 hover:text-white px-2 py-1" onClick={() => setIsMenuOpen(false)}>Search Flights</Link>
          <Link to="/travel-planner" className="text-slate-300 hover:text-white px-2 py-1 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <Sparkles size={14} /> AI Travel Planner
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-white px-2 py-1" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-accent-500 hover:text-accent-400 px-2 py-1 font-medium">Logout</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" className="btn-secondary text-center" onClick={() => setIsMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
