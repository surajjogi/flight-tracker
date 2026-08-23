import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LiveTrackerPage from './pages/LiveTrackerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import FlightDetailsPage from './pages/FlightDetailsPage';
import TravelPlannerPage from './pages/TravelPlannerPage';
import { AuthContext } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading...</div>;
  }

  return user ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute><LiveTrackerPage /></ProtectedRoute>} />
              <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/travel-planner" element={<ProtectedRoute><TravelPlannerPage /></ProtectedRoute>} />
              <Route path="/flight/:id" element={<ProtectedRoute><FlightDetailsPage /></ProtectedRoute>} />
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-slate-400">Page not found</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
