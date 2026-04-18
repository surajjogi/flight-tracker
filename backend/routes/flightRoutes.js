const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Cache flights for 15 seconds to avoid OpenSky rate limits
// OpenSky unauthenticated rate limit: 400 requests/day, 1 req/10sec
const flightCache = new NodeCache({ stdTTL: 15 });

// @desc    Get live flights within a bounding box
// @route   GET /api/flights/live
router.get('/live', async (req, res) => {
  try {
    const { lamin, lomin, lamax, lomax } = req.query;
    
    let cacheKey = 'flights_global';
    let url = 'https://opensky-network.org/api/states/all';

    if (lamin && lomin && lamax && lomax) {
      cacheKey = `flights_${lamin}_${lomin}_${lamax}_${lomax}`;
      url += `?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    }

    // Check cache first
    if (flightCache.has(cacheKey)) {
      return res.json(flightCache.get(cacheKey));
    }

    
    // In a real production app, you would pass credentials here to get better limits
    const response = await axios.get(url, { timeout: 8000 });
    
    // Format the data to be easier for frontend
    const flights = response.data.states ? response.data.states.map(state => ({
      icao24: state[0],
      callsign: state[1] ? state[1].trim() : 'Unknown',
      originCountry: state[2],
      longitude: state[5],
      latitude: state[6],
      altitude: state[13] || state[7], // geometric or barometric altitude
      onGround: state[8],
      velocity: state[9], // m/s
      trueTrack: state[10], // heading
      verticalRate: state[11],
    })) : [];

    flightCache.set(cacheKey, flights);
    res.json(flights);
  } catch (error) {
    console.error('OpenSky API Error:', error.message);
    res.status(500).json({ message: 'Error fetching live flights data' });
  }
});

// @desc    Track a specific flight by icao24
// @route   GET /api/flights/track/:icao24
router.get('/track/:icao24', async (req, res) => {
  try {
    const icao24 = req.params.icao24.toLowerCase();
    const cacheKey = `flight_${icao24}`;

    if (flightCache.has(cacheKey)) {
      return res.json(flightCache.get(cacheKey));
    }

    const url = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
    const response = await axios.get(url, { timeout: 8000 });
    
    if (!response.data.states || response.data.states.length === 0) {
      return res.status(404).json({ message: 'Flight not found or currently inactive' });
    }

    const state = response.data.states[0];
    const flightData = {
      icao24: state[0],
      callsign: state[1] ? state[1].trim() : 'Unknown',
      originCountry: state[2],
      timePosition: state[3],
      lastContact: state[4],
      longitude: state[5],
      latitude: state[6],
      baroAltitude: state[7],
      onGround: state[8],
      velocity: state[9],
      trueTrack: state[10],
      verticalRate: state[11],
      sensors: state[12],
      geoAltitude: state[13],
      squawk: state[14],
      spi: state[15],
      positionSource: state[16]
    };

    // Cache specific flight for 15s
    flightCache.set(cacheKey, flightData);
    res.json(flightData);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Flight data not available' });
    }
    console.error('Track API Error:', error.message);
    res.status(500).json({ message: 'Error fetching flight tracking data' });
  }
});

module.exports = router;
