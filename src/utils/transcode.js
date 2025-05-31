// src/utils/transcode.js
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const transcodeVideo = (inputPath, outputPath, resolution= '1280x720') => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        `-vf scale=${resolution}`,
        '-preset medium',    // or 'slow' for better quality
        '-crf 20',           // lower = better quality, higher = smaller file
        '-b:a 128k',         // audio bitrate
        '-movflags +faststart',
        '-pix_fmt yuv420p'
      ])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
};


