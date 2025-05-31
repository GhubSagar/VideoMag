import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: './src/.env' });


export const connectToDatabase = async () => {
  try {
    //console.log('MONGODB_URI:', process.env.MONGODB_URI);
    //await mongoose.connect('mongodb://localhost:27017/videomag');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};
