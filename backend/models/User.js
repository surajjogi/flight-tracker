const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  savedFlights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedFlight'
  }]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
