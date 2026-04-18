const mongoose = require('mongoose');

const savedFlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  airline: {
    type: String,
  },
  departureAirport: {
    type: String,
  },
  arrivalAirport: {
    type: String,
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true,
});

const SavedFlight = mongoose.model('SavedFlight', savedFlightSchema);
module.exports = SavedFlight;
