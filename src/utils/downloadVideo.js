//Running code :
import fs from 'fs';
import path from 'path';
//import ytdl from 'ytdl-core'; // For YouTube downloads
//import { google } from 'googleapis'; // For Google Drive API
import axios from 'axios';
import { getSourceType } from './sourceType.js';

export const downloadVideo = async (sourceUrl) => {
  const sourceType = getSourceType(sourceUrl);
  const tempDir = './temp';
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  switch (sourceType) {

    case 'google-drive':

      const drivePath = path.join(tempDir, `drive_${Date.now()}.mp4`);
  const fileId = sourceUrl.split('/d/')[1]?.split('/')[0]; // Extract file ID from the URL
  if (!fileId) {
    console.error('Invalid Google Drive URL:', sourceUrl);
    throw new Error('Invalid Google Drive URL');
  }
  console.log('Extracted File ID:', fileId);

  // Construct the direct download URL for public files
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  console.log('Constructed Download URL:', downloadUrl);

  // Download the file using Axios
  const driveResponse = await axios.get(downloadUrl, { responseType: 'stream' });
  const driveFile = fs.createWriteStream(drivePath);
  await new Promise((resolve, reject) => {
    driveResponse.data.pipe(driveFile);
    driveResponse.data.on('end', resolve);
    driveResponse.data.on('error', reject);
  });
  console.log('Downloaded file to:', drivePath);
      return drivePath;

    case 'local':
      if (!fs.existsSync(sourceUrl)) {
        throw new Error(`Local file not found: ${sourceUrl}`);
      }
      return sourceUrl;

    default:
      throw new Error('Unsupported source type');
  }
};
