import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function testCloudinary() {
  console.log("Testing Cloudinary connection...");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("API Key:", process.env.CLOUDINARY_API_KEY);
  
  try {
    const result = await cloudinary.api.ping();
    console.log("Ping Result:", result);
  } catch (error) {
    console.error("Cloudinary Ping Failed:");
    console.error(error);
  }
}

testCloudinary();
