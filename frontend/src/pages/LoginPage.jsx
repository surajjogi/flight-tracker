import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard'); // or home
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex bg-accent-500/20 p-3 rounded-2xl mb-4">
            <Plane className="text-accent-500 w-8 h-8 rotate-45" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Log in to track your favorite flights.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link to="#" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
