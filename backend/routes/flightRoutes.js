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

// @desc    Track a specific flight by icao24 or callsign (case-insensitive)
// @route   GET /api/flights/track/:identifier
router.get('/track/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier.toLowerCase().trim();
    const cacheKey = `flight_${identifier}`;

    if (flightCache.has(cacheKey)) {
      return res.json(flightCache.get(cacheKey));
    }

    // First, try to find by icao24 directly via OpenSky API
    const url = `https://opensky-network.org/api/states/all?icao24=${identifier}`;
    let flightData = null;

    try {
      const response = await axios.get(url, { timeout: 8000 });

      if (response.data.states && response.data.states.length > 0) {
        const state = response.data.states[0];
        flightData = {
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
      }
    } catch (apiError) {
      // icao24 lookup failed, will try callsign fallback below
    }

    // If icao24 lookup failed, try to find by callsign from cached global flights
    if (!flightData && flightCache.has('flights_global')) {
      const allFlights = flightCache.get('flights_global');
      const match = allFlights.find(f =>
        (f.callsign || '').toLowerCase().trim() === identifier ||
        (f.icao24 || '').toLowerCase().trim() === identifier
      );

      if (match) {
        // Now fetch detailed data using the matched icao24
        try {
          const detailUrl = `https://opensky-network.org/api/states/all?icao24=${match.icao24}`;
          const detailResponse = await axios.get(detailUrl, { timeout: 8000 });

          if (detailResponse.data.states && detailResponse.data.states.length > 0) {
            const state = detailResponse.data.states[0];
            flightData = {
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
          }
        } catch (detailError) {
          // Use the cached summary data as fallback
          flightData = {
            icao24: match.icao24,
            callsign: match.callsign,
            originCountry: match.originCountry,
            longitude: match.longitude,
            latitude: match.latitude,
            baroAltitude: match.altitude,
            onGround: match.onGround,
            velocity: match.velocity,
            trueTrack: match.trueTrack,
            verticalRate: match.verticalRate,
          };
        }
      }
    }

    if (!flightData) {
      return res.status(404).json({ message: 'Flight not found or currently inactive. Try searching by flight number or ICAO24 code.' });
    }

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

// @desc    Search flights by callsign, ICAO24 code, or country (case-insensitive)
// @route   GET /api/flights/search?q=searchTerm
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const cacheKey = 'flights_global';
    let flights;

    // Use cached global data if available, otherwise fetch fresh
    if (flightCache.has(cacheKey)) {
      flights = flightCache.get(cacheKey);
    } else {
      const url = 'https://opensky-network.org/api/states/all';
      const response = await axios.get(url, { timeout: 8000 });

      flights = response.data.states ? response.data.states.map(state => ({
        icao24: state[0],
        callsign: state[1] ? state[1].trim() : 'Unknown',
        originCountry: state[2],
        longitude: state[5],
        latitude: state[6],
        altitude: state[13] || state[7],
        onGround: state[8],
        velocity: state[9],
        trueTrack: state[10],
        verticalRate: state[11],
      })) : [];

      flightCache.set(cacheKey, flights);
    }

    // Case-insensitive search across multiple fields
    const queryLower = q.trim().toLowerCase();

    const results = flights.filter(flight => {
      const callsign = (flight.callsign || '').toLowerCase();
      const icao24 = (flight.icao24 || '').toLowerCase();
      const country = (flight.originCountry || '').toLowerCase();

      return callsign.includes(queryLower) ||
        icao24.includes(queryLower) ||
        country.includes(queryLower);
    });

    res.json({
      query: q,
      count: results.length,
      results: results,
    });
  } catch (error) {
    console.error('Search API Error:', error.message);
    res.status(500).json({ message: 'Error searching flights' });
  }
});

module.exports = router;
