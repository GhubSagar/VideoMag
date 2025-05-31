// src/server.js
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' }); // Load environment variables from .env file
import { app } from './app.js';
//import { config } from './config/config.js';
import { connectToDatabase } from './config/mongodb.js';

(async () => {
  await connectToDatabase(); // Connect to MongoDB
  app.listen(process.env.PORT,() => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
})();


