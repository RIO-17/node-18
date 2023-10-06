const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
    default: 100,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  customers: {
    type: [String],
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    type: String,
  },
});

module.exports = mongoose.model("Launch", launchesSchema);

// Target can be referrenced too
// target: {
// type: mongoose.ObjectId,
// ref: Planets
// }
