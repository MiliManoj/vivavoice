import { useState, useRef } from 'react'
import { questionBank } from './questions'
import './App.css'

function App() {
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const categories = [...new Set(questionBank.map(q => q.category))]

  const resetSession = () => {
    setAudioURL(null)
    setAudioBlob(null)
    setUploadStatus('')
    setTranscript('')
    setFeedback('')
  }

  const pickQuestion = (question) => {
    setSelectedQuestion(question)
    resetSession()
  }

  const pickRandomQuestion = () => {
    const random = questionBank[Math.floor(Math.random() * questionBank.length)]
    pickQuestion(random)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        setAudioBlob(blob)
        setTranscript('')
        setFeedback('')
        setUploadStatus('')
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Microphone access error:', err)
      alert('Could not access microphone. Please allow permission.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  const uploadRecording = async () => {
    if (!audioBlob) return
    setIsProcessing(true)
    setUploadStatus('Transcribing and analyzing... this may take a few seconds')

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('question', selectedQuestion?.text || '')

    try {
      const response = await fetch('https://vivavoice-backend.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.error) {
        setUploadStatus(`Error: ${data.error}`)
        setIsProcessing(false)
        return
      }

      setUploadStatus('Analysis complete')
      setTranscript(data.transcript || 'No transcript returned')
      setFeedback(data.feedback || '')
    } catch (err) {
      console.error('Upload error:', err)
      setUploadStatus('Upload failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>VivaVoice</h1>
        <p className="tagline">Your AI interview coach — practice, get feedback, improve.</p>
      </header>

      {!selectedQuestion && (
        <section className="question-picker">
          <div className="picker-header">
            <h2>Choose a question to practice</h2>
            <button className="btn-secondary" onClick={pickRandomQuestion}>
              🎲 Surprise me
            </button>
          </div>

          {categories.map((cat) => (
            <div key={cat} className="category-block">
              <h3>{cat}</h3>
              <div className="question-grid">
                {questionBank.filter(q => q.category === cat).map((q) => (
                  <button key={q.id} className="question-card" onClick={() => pickQuestion(q)}>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {selectedQuestion && (
        <section className="recording-panel">
          <button className="btn-back" onClick={() => setSelectedQuestion(null)}>
            ← Choose a different question
          </button>

          <div className="question-display">
            <span className="badge">{selectedQuestion.category}</span>
            <h2>{selectedQuestion.text}</h2>
          </div>

          <div className="record-controls">
            <button
              className={isRecording ? 'btn-record recording' : 'btn-record'}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? '⏹ Stop Recording' : '🎙 Start Recording'}
            </button>
          </div>

          {audioURL && (
            <div className="playback-card">
              <p className="section-label">Your recording</p>
              <audio controls src={audioURL}></audio>
              <button className="btn-primary" onClick={uploadRecording} disabled={isProcessing}>
                {isProcessing ? 'Analyzing...' : 'Analyze Recording'}
              </button>
              {uploadStatus && <p className="status-text">{uploadStatus}</p>}
            </div>
          )}

          {transcript && (
            <div className="result-card">
              <p className="section-label">Transcript</p>
              <p className="transcript-text">{transcript}</p>
            </div>
          )}

          {feedback && (
            <div className="result-card feedback-card">
              <p className="section-label">AI Feedback</p>
              <pre className="feedback-text">{feedback}</pre>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default App