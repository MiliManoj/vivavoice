const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  question: { type: String, default: '' },
  transcript: { type: String, default: '' },
  feedback: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recording', recordingSchema);