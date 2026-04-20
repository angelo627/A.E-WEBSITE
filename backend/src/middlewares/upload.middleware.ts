import { Request } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Storage for Team Member Photos
const teamStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ae-website/team",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  } as any
});

// Storage for Module Videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ae-website/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mkv", "mov", "avi"]
  } as any
});

export const uploadTeamPhoto = multer({
  storage: teamStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for photos
  }
});

export const uploadModuleVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});
