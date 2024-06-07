import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `${req.file.filename}.webp`);

  try {
    await sharp(inputPath)
      .toFormat('webp')
      .toFile(outputPath);

    fs.unlinkSync(inputPath); // Optionally delete the original file

    res.json({ fileUrl: `http://localhost:3000/uploads/${req.file.filename}.webp` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing image.');
  }
});
