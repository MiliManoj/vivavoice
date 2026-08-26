require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Recording = require('./models/Recording');
const { AssemblyAI } = require('assemblyai');

const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'recording-' + Date.now() + '.webm'),
});
const upload = multer({ storage });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});



const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

app.post('/api/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

  try {
    const filePath = path.join(uploadDir, req.file.filename);

    // Send to AssemblyAI for transcription
    const transcript = await client.transcripts.transcribe({
      audio: filePath,
    });

    if (transcript.status === 'error') {
      return res.status(500).json({ error: 'Transcription failed: ' + transcript.error });
    }

    // Save to MongoDB
    const newRecording = new Recording({
      filename: req.file.filename,
      transcript: transcript.text,
    });
    await newRecording.save();

    res.json({
      message: 'File uploaded and transcribed successfully',
      filename: req.file.filename,
      transcript: transcript.text,
    });
  } catch (err) {
    console.error('Upload/transcription error:', err);
    res.status(500).json({ error: 'Failed to process recording' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));