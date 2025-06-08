# VideoMag

VideoMag is a full-stack automated video processing platform. Users can submit public Google Drive video links and receive processed outputs including transcoded videos (multiple resolutions), subtitles, thumbnails, and HLS playlists. All processed files are securely stored and organized in Cloudflare R2, and users retrieve their files using a unique token.

---

## Features

- **Automated Video Processing:** Download, transcode, generate subtitles, thumbnails, and HLS segments from public Google Drive links.
- **Multi-Resolution Transcoding:** Outputs in 1080p, 720p, and 480p using ffmpeg with quality-preserving settings.
- **Subtitle Generation:** Uses Whisper AI for accurate subtitle extraction and VTT file creation.
- **Thumbnail Generation:** Extracts a representative thumbnail from the video.
- **HLS Playlist & Segments:** Generates `.m3u8` playlists and video segments for adaptive streaming.
- **Cloud Storage:** All processed files are uploaded to Cloudflare R2, organized by unique job tokens.
- **Token-Based Retrieval:** Users receive a token to securely retrieve their files.
- **Email Notifications:** Users are notified when processing is complete; developers are notified on new job creation.
- **Parallel Processing:** Backend uses BullMQ for scalable, parallel job handling.
- **Modern Frontend:** React-based UI for job submission and file retrieval.
- **Robust Error Handling:** Graceful error reporting and resource cleanup.

---

## Tech Stack /Project Structure

- **Frontend:** React.js (with Tailwind CSS / responsive UI)
- **Backend:** Node.js, Express
- **Worker System:**
-    BullMQ (Redis-based job queue)
-    FFmpeg (video processing, transcoding, thumbnails, subtitles)
- **Database:** MongoDB Atlas (for storing job metadata and user tokens)
- **Cloud Storage:** Cloudflare R2 (S3-compatible object storage for videos and assets)
- **Queue Infrastructure:** Redis (for BullMQ)
- **Authentication**: Token-based job access (NanoID or UUID-based)
- **Deployment:**
-   Render.com (Static Site for frontend, Web Service for backend)
-   Upstash (Redis)
- **Optional Add-ons:**
-   Nodemailer (for email notifications)
-   Subtitle generation via Whisper / Cloudflare ASR


---
