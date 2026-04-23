import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LiveTrackerPage from './pages/LiveTrackerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import FlightDetailsPage from './pages/FlightDetailsPage';
import TravelPlannerPage from './pages/TravelPlannerPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/live" element={<LiveTrackerPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/travel-planner" element={<TravelPlannerPage />} />
              <Route path="/flight/:id" element={<FlightDetailsPage />} />
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
