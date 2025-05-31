// src/utils/generateThumbnails.js
import ffmpeg from 'fluent-ffmpeg';
import ffprobeStatic from 'ffprobe-static';
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const generateThumbnails = (inputPath, outputDir,filename) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        count: 1,
        folder: outputDir,
        filename: filename,
        size: '320x240',
      })
      .on('end', () => resolve(`${outputDir}/${filename}`))
      .on('error', reject);
  });
};
