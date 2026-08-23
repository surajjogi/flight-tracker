# AeroTrack: Live Flight Tracker
#images
<img width="1174" height="746" alt="Screenshot 2026-08-23 113648" src="https://github.com/user-attachments/assets/d828a05f-a0eb-470d-8c1b-41f1f7559833" />
<img width="1589" height="888" alt="Screenshot 2026-08-23 154403" src="https://github.com/user-attachments/assets/442ab6ff-3940-4229-99a9-95a63b580fe2" />
<img width="1557" height="775" alt="Screenshot 2026-08-23 154433" src="https://github.com/user-attachments/assets/74693454-dc4f-411d-a568-32db68d59338" />
<img width="1595" height="843" alt="Screenshot 2026-08-23 154450" src="https://github.com/user-attachments/assets/84354d7d-67f9-4beb-b666-02acf406f578" />
<img width="1613" height="839" alt="Screenshot 2026-08-23 154509" src="https://github.com/user-attachments/assets/b1f080f8-f676-40ea-843b-b7b1d2caa487" />



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




