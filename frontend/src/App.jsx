import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

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
    setUploadStatus('Uploading...')

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setUploadStatus(`Uploaded successfully: ${data.filename}`)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadStatus('Upload failed. Check backend is running.')
    }
  }

  return (
    <div className="app-container">
      <h1>VivaVoice</h1>
      <p>Record your interview answer</p>

      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {audioURL && (
        <div className="playback">
          <p>Your recording:</p>
          <audio controls src={audioURL}></audio>
          <br />
          <button onClick={uploadRecording}>Analyze Recording</button>
          {uploadStatus && <p>{uploadStatus}</p>}
        </div>
      )}
    </div>
  )
}

export default App