import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' }); 
import { fetch } from 'undici';

export const runWorkersAI = async (audioBuffer) => {
  try {

     // Encode audio buffer to base64
      const audioBase64 = audioBuffer.toString('base64');


    const response = await fetch(
      `https://gateway.ai.cloudflare.com/v1/${process.env.R2_ACCOUNT_ID}/${process.env.GATEWAY_ID}/workers-ai/@cf/openai/whisper-large-v3-turbo`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WORKERS_AI_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({ audio: audioBase64 }),
      }
    );

    // Handle specific error cases
    if (response.status === 413) {
      throw new Error('Audio duration exceeds 30-second limit');
    }
    if (response.status === 429) {
      throw new Error('Workers AI rate limit exceeded');
    }
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Workers AI Error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
};


