import React, { useState } from 'react';
import axios from 'axios';

export default function Transcribe() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranscript('');
    setStatus('');
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatus('Uploading and transcribing...');
    setProgress(0);

    // Simulated progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 1;
      });
    }, 150);

    try {
      const response = await axios.post('http://localhost:8000/transcribe', formData);
      setTranscript(response.data.text);
      setStatus('Transcription completed!');
      setProgress(100);
    } catch (error) {
      console.error(error);
      setStatus('Transcription failed.');
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = "transcript.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="page">
      <h1>Transcribe Audio</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Transcribing...' : 'Upload & Transcribe'}
      </button>
      <p className={status.includes('failed') ? 'error-text' : ''}>{status}</p>

      {loading && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {transcript && (
        <div className="transcript-box">
          <h2>Transcript:</h2>
          <p>{transcript}</p>
          <button onClick={handleDownload}>Download Transcript (.txt)</button>
        </div>
      )}
    </div>
  );
}