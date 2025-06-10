// filepath: e:\Real-Estate-Website-main\backend\config\imagekit.js
import ImageKit from 'imagekit';
import dotenv from 'dotenv';

// Load environment variables from the correct file
dotenv.config();

// Debug log to verify environment variables

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
  throw new Error('Missing IMAGEKIT_PUBLIC_KEY');
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error('Missing IMAGEKIT_PRIVATE_KEY');
}

if (!process.env.IMAGEKIT_URL_ENDPOINT) {
  throw new Error('Missing IMAGEKIT_URL_ENDPOINT');
}

console.log("ImageKit connected successfully!");

export default imagekit;