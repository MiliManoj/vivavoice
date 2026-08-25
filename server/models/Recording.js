const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recording', recordingSchema);