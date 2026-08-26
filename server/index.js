require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Recording = require('./models/Recording');
const { AssemblyAI } = require('assemblyai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

  try {
    const filePath = path.join(uploadDir, req.file.filename);

    // Step 1: Transcribe with AssemblyAI
    const transcriptResult = await client.transcripts.transcribe({
      audio: filePath,
    });

    if (transcriptResult.status === 'error') {
      return res.status(500).json({ error: 'Transcription failed: ' + transcriptResult.error });
    }

    const transcriptText = transcriptResult.text;

    // Step 2: Get AI feedback from Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are an interview coach. Analyze this interview answer transcript and provide structured feedback in this exact format:

**STAR Structure:** (Does it follow Situation, Task, Action, Result? What's missing?)
**Filler Words:** (Count and list any filler words like "um", "like", "so", "basically")
**Clarity:** (Is the answer clear and well-organized? 1-2 sentences)
**Suggested Improvement:** (A brief, improved version of a key part of the answer)

Transcript: "${transcriptText}"`;

    const result = await model.generateContent(prompt);
    const feedbackText = result.response.text();

    // Step 3: Save everything to MongoDB
    const newRecording = new Recording({
      filename: req.file.filename,
      transcript: transcriptText,
      feedback: feedbackText,
    });
    await newRecording.save();

    res.json({
      message: 'File uploaded, transcribed, and analyzed successfully',
      filename: req.file.filename,
      transcript: transcriptText,
      feedback: feedbackText,
    });
  } catch (err) {
    console.error('Upload/analysis error:', err);
    res.status(500).json({ error: 'Failed to process recording' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));