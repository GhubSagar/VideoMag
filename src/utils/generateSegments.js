import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import ffprobeStatic from 'ffprobe-static';
ffmpeg.setFfprobePath(ffprobeStatic.path);
ffmpeg.setFfmpegPath(ffmpegStatic);

export const generateSegments = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const playlistPath = path.join(outputDir, 'playlist.m3u8');
    ffmpeg(inputPath)
      .outputOptions([
        '-hls_time 10', // Segment duration in seconds
        '-hls_playlist_type vod',
      ])
      .output(playlistPath)
      .on('end', () => resolve(playlistPath))
      .on('error', reject)
      .run();
  });
};