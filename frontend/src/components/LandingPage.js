
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './LandingPage.css';

function LandingPage() {
  const videoRef = useRef(null);
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [retrieveMessage, setRetrieveMessage] = useState('');
  const [result, setResult] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  }, []);

  // Handle first form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage('');
    try {
      const res = await axios.post(`${API_BASE}/jobs`, { sourceUrl: link, email });
      setSubmitMessage('Your video for processing is submitted! Your token: ' + res.data.token);
    } catch (err) {
      setSubmitMessage('Error: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  // Handle second form submit
  const handleRetrieve = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRetrieveMessage('');
    setResult(null);
    try {
      const res = await axios.get(`${API_BASE}/jobs/token/${token}`);
      setResult(res.data);
        // If the backend returns only status (not completed), show a waiting message
    if (res.data.status && res.data.status !== 'completed') {
      setRetrieveMessage('Your task is still processing. Please check back later.');
    } else if (
      res.data.transcodedUrl ||
      res.data.thumbnailUrl ||
      res.data.subtitleUrl ||
      res.data.playlistUrl
    ) {
      setRetrieveMessage('Your task is completed successfully and ready to download.');
    } else {
      setRetrieveMessage('No downloadable files found for this token.');
    }
  } catch (err) {
    setRetrieveMessage('Error: ' + (err.response?.data?.error || err.message));
  }
  setLoading(false);
};

  return (
    
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <video
        ref={videoRef}
        src={process.env.PUBLIC_URL + '/originalvideo.mp4'}
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      />
      <div className="video-overlay"></div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark videomag-navbar">
  <div className="container-fluid">
    <a className="navbar-brand d-flex align-items-center" href="/">
      <img src={process.env.PUBLIC_URL + '/favicon.png'} alt="Logo" width="40" height="40" className="me-2" />
      <span className="videomag-title">
        VideoMag
        <span className="videomag-tagline d-none d-md-inline">
          Turn your videos into magic – fast, smart, and easy!
        </span>
      </span>
    </a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
      <button
        className="btn btn-outline-light ms-lg-3 mt-2 mt-lg-0"
        onClick={() => setShowAbout(true)}
        style={{ fontWeight: 500 }}
      >
        About
      </button>
    </div>
  </div>
</nav>

       <div className="d-flex flex-column align-items-center" style={{ minHeight: '100vh', gap: '2rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* First Tile */}
        <div className="card shadow-lg p-4 floating-tile mb-4">
          <h1 className="fw-bold text-white mb-0" style={{ marginTop: 0, fontFamily: "serif", fontSize: "5rem" }}>Welcome</h1>
          <p className="fw-bold text-secondary mb-2">
            Get Subtitles, transcoded videos hassle free on your tip.<br />
            Paste google drive video link and get a concise summary delivered in no time.
            Note:The drive link should be public, otherwise the video will not be processed.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mt-4 mb-3">
              <input
                type="email"
                className="form-control fw-bold"
                placeholder="Enter your Email ID"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <input
                type="text"
                className="form-control fw-bold"
                placeholder="Paste Google Drive Video Link"
                value={link}
                onChange={e => setLink(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          {submitMessage && <div className="mt-3 alert alert-info">{submitMessage}</div>}
        </div>

        {/* Second Tile */}
        <div className="card shadow-lg p-4 floating-tile">
          <h1 className="fw-bold text-white mb-0" style={{ marginTop: 0, fontFamily: "serif", fontSize: "5rem" }}>Retrieve Files</h1>
          <p className="fw-bold text-secondary mb-2">
            Enter the token received at the time of submitting the video.<br />
            You will also have the token sent to your email when the task is finished.
          </p>
          <form onSubmit={handleRetrieve}>
            <div className="mt-5 mb-3">
              <input
                type="text"
                className="form-control fw-bold"
                placeholder="Enter your Token"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Retrieving...' : 'Retrieve Files'}
            </button>
          </form>
          {retrieveMessage && <div className="mt-3 alert alert-info">{retrieveMessage}</div>}
          {result && (
  <div className="mt-3 d-flex flex-wrap justify-content-center gap-3">
    {result.transcodedUrl && (
      <a
        href={result.transcodedUrl}
        className="btn btn-success"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        Download Transcoded Video
      </a>
    )}
    {result.thumbnailUrl && (
      <a
        href={result.thumbnailUrl}
        className="btn btn-success"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        Download Thumbnail
      </a>
    )}
    {result.subtitleUrl && (
      <a
        href={result.subtitleUrl}
        className="btn btn-success"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        Download Subtitles
      </a>
    )}
    {result.playlistUrl && (
      <a
        href={result.playlistUrl}
        className="btn btn-success"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        Download Playlist
      </a>
    )}
  </div>
)}
        </div>
      </div>

      {showAbout && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center about-tile-modal"
  >
    <div className="card about-tile-card">
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 m-2"
        aria-label="Close"
        onClick={() => setShowAbout(false)}
        style={{ filter: 'invert(1)' }}
      ></button>
      <h2 className="mb-3">About VideoMag</h2>
      <ul>
        <li>
          <b>Submit</b> a <span>public Google Drive video link</span> and your email.
        </li>
        <li>
          <b>Automatic processing</b>: Get <span>subtitles</span>, a <span>transcoded video</span>, a <span>thumbnail</span>, and a <span>playlist file</span>.
        </li>
        <li>
          <b>Receive a token</b> (and an email) when your files are ready.
        </li>
        <li>
          <b>Retrieve &amp; download</b> your files securely using your token.
        </li>
        <li>
          <span style={{ color: '#ffeb3b' }}>Note:</span> The Google Drive link must be public for processing.
        </li>
      </ul>
    </div>
  </div>
)}
    </div>
  );
}

export default LandingPage;