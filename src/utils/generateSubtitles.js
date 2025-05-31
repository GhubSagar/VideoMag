import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import ffprobeStatic from 'ffprobe-static';
import { runWorkersAI } from './workersAI.js';

// Configure ffmpeg paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

// Helper function to extract audio
const extractAudio = (videoPath, audioPath) => new Promise((resolve, reject) => {
  try{
  ffmpeg(videoPath)
    .output(audioPath)
    .audioCodec('pcm_s16le') // WAV format
    .audioFrequency(16000) // Match ASR sample rate
    .audioChannels(1) // Mono audio
    .on('end', () =>{
      console.log(`Audio file created: ${audioPath}`); 
      resolve(audioPath)})
    .on('error', (err) => {
        console.error('Error extracting audio:', err.message);
        reject(err);
      })
    .run();
    } catch (error) {
    console.error('Unexpected error during audio extraction:', error.message);
    reject(error);
  }
});

// Helper to format seconds as HH:MM:SS.mmm
function formatTimestamp(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

const convertToWebVTT = (transcription) => {
  let vtt = 'WEBVTT\n\n';

 transcription.segments?.forEach((segment) => {
    const start = formatTimestamp(segment.start);
    const end = formatTimestamp(segment.end);
    vtt += `${start} --> ${end}\n${segment.text.trim()}\n\n`;
  });

  return vtt;  
};

export const generateSubtitles = async (inputPath, outputPath) => {
  const tempDir = path.dirname(outputPath);
  const audioPath = path.join(tempDir, `audio_${Date.now()}.wav`);

  // Ensure the temporary directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created directory: ${tempDir}`);
  }

  try {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input video not found: ${inputPath}`);
    }
    // 1. Extract audio from video
    await extractAudio(inputPath, audioPath);

    if (!fs.existsSync(audioPath)) {
      throw new Error('Audio extraction failed - no output file');
    }
    console.log(`Audio extracted to: ${audioPath}`);

    // // 2. Send audio buffer to Workers AI
     const audioBuffer = fs.readFileSync(audioPath);
     const response = await runWorkersAI(audioBuffer);
     console.log('Whisper API raw response:', JSON.stringify(response, null, 2)); 

    // Fix: extract transcription from the correct place
    const transcription = response?.result;

    // 3. Process ASR results
    if (!transcription || !transcription.segments) {
      console.warn('No transcription results found.');
      fs.writeFileSync(outputPath, 'WEBVTT\n\n'); // Write an empty VTT file
      return outputPath;
    }

    const vttContent = convertToWebVTT(transcription);
    fs.writeFileSync(outputPath, vttContent);

    return outputPath;
  } catch (error) {
    console.error('Subtitle generation failed:', error.message);
    throw error; // Propagate error to BullMQ
  } finally {
    // Clean up audio file even if errors occur
    try {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    } catch (error) {
      console.error('Error cleaning up audio file:', error);
    }
  }
};
