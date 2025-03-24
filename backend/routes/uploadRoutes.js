import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinaryConfig.js';

const router = express.Router();
const upload = multer(); // In-memory storage

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Wrap Cloudinary upload in a Promise
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    };

    // Upload file to Cloudinary
    const cloudinaryResult = await uploadToCloudinary();

    // Return the Cloudinary result
    return res.status(200).json({
      message: 'File uploaded successfully',
      cloudinaryResult: {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

export default router;