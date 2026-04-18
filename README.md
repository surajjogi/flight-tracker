# AeroTrack: Live Flight Tracker

AeroTrack is a premium, startup-level SaaS full-stack application built on the MERN stack that provides real-time global flight tracking.

## Features Built So Far
- **Backend Infrastructure**: Scalable Node.js + Express setup with JWT authentication, MongoDB connection, rate limiting, and Helmet security.
- **OpenSky API Integration**: Live flight data fetched globally, with an aggressive 15-second caching layer using `node-cache` to prevent API rate limiting.
- **Frontend Infrastructure**: React + Vite with TailwindCSS v3 setup.
- **Premium UI**: Glassmorphism design, custom scrollbars, dark mode defaults, and fluid animations.
- **Live Radar Map**: Integrated Leaflet map with custom airplane SVG markers that automatically rotate to match the flight heading (`trueTrack`). Data polls securely from the backend cache.
- **Interactive Home Page**: Smart search bar designed for flight numbers, airlines, and airport codes.

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure you have your MongoDB server running locally or update the .env
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
The `backend/.env` file is already created for you with the following defaults:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/flighttracker
JWT_SECRET=supersecretflighttrackerkey123
```

## Next Steps to Build
- Implement the Auth pages (Login / Register) with the AuthContext.
- Build the specific `/search` route results page.
- Build the User Dashboard for saved flights.
- Setup Admin Panel.
