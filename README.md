# VivaVoice 🎙️

**Nail your next interview before it happens.**

VivaVoice is an AI-powered interview coaching platform that lets you practice answering real interview questions out loud, then gives you structured, actionable feedback on your delivery — not just what you said, but how you said it.

🔗 **Live app:** [https://vivavoice-rho.vercel.app](https://vivavoice-rho.vercel.app)
🔗 **Backend API:** [https://vivavoice-backend.onrender.com](https://vivavoice-backend.onrender.com)

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–60 seconds to respond while the server wakes up.

---

## What it does

1. **Pick a question** — choose from a bank of behavioral, technical, and general interview questions (or hit "Surprise me" for a random one)
2. **Record your answer** — speak naturally, just like a real interview
3. **Get instant AI feedback** — your answer is transcribed and analyzed for:
   - STAR structure (Situation, Task, Action, Result)
   - Filler word usage ("um", "like", "so", etc.)
   - Clarity and professionalism
   - A concrete, rewritten example of how to improve your answer
4. **Review your transcript** alongside the feedback to see exactly what was said

---

## Tech stack

This is a MERN stack application with two integrated AI/ML services:

- **Frontend:** React (Vite), deployed on Vercel
- **Backend:** Node.js + Express, deployed on Render
- **Database:** MongoDB Atlas (cloud-hosted)
- **Speech-to-text:** AssemblyAI
- **AI feedback:** Google Gemini API

### Why this stack
The project started as a Flask + React prototype and was migrated mid-build to a full MERN stack to align with a specific job application's requirements — a deliberate decision that also tested adaptability across backend ecosystems (Python → Node.js) without needing to rebuild the frontend or core product logic.

---

## Architecture

- Browser (MediaRecorder API) captures audio
- React frontend (Vercel) sends the recording to the backend
- Express backend (Render) receives the file, then:
  - Sends it to AssemblyAI for speech-to-text transcription
  - Sends the transcript to Gemini API for structured feedback
  - Saves the transcript, feedback, and metadata to MongoDB Atlas


---

## Known limitations

- **Speech-to-text accuracy**: AssemblyAI handles natural, normal-paced speech well, but like all STT engines, it can occasionally misinterpret uncommon proper nouns or technical jargon.
- **Free-tier hosting**: Render's free tier has an ephemeral filesystem — uploaded audio files may not persist across service restarts. Transcripts and feedback (the core data) are always safely stored in MongoDB regardless.
- **Cold starts**: the backend may take up to a minute to respond on the first request after a period of inactivity (free-tier behavior).

---

## Running locally

**Backend:**
```bash
cd server
npm install
# create a .env file with MONGO_URI, ASSEMBLYAI_API_KEY, GEMINI_API_KEY
node index.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Roadmap / possible next steps

- User accounts and login, so practice history is tied to a person, not just a device
- History dashboard to track improvement across multiple practice sessions over time
- Support for custom, user-submitted interview questions
- Higher-accuracy transcription options for technical vocabulary

---

## Author

Built by [Mili Manoj](https://github.com/MiliManoj) — [LinkedIn](https://www.linkedin.com/in/mili-manoj-527ba6312)
