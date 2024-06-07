import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });  // Configure multer to save uploaded files to the 'uploads' directory

export const uploadRouter = express.Router();  // Create a new router

// Handle POST requests to the upload endpoint
uploadRouter.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');  // Log an error if no file is uploaded
    return res.status(400).send('No file uploaded.');  // Respond with a 400 status code if no file is uploaded
  }

  const inputPath = req.file.path;  // Get the path of the uploaded file
  const outputPath = path.join('uploads', `${req.file.filename}.webp`);  // Define the path for the compressed file

  try {
    console.log(`Processing file: ${inputPath}`);  // Log the start of the file processing
    await sharp(inputPath)  // Use sharp to process the image
      .toFormat('webp')  // Convert the image to WebP format
      .toFile(outputPath);  // Save the converted image to the output path

    const compressedSize = fs.statSync(outputPath).size;  // Get the size of the compressed file
    fs.unlinkSync(inputPath);  // Delete the original uploaded file

    console.log(`File processed successfully: ${outputPath}`);  // Log the successful file processing
    res.json({ fileUrl: `http://localhost:3000/uploads/${req.file.filename}.webp`, compressedSize });  // Respond with the URL and size of the compressed file
  } catch (error) {
    console.error(`Error processing image: ${error}`);  // Log any errors that occur during processing
    res.status(500).send('Error processing image.');  // Respond with a 500 status code if an error occurs
  }
});

// Serve the uploaded files statically
uploadRouter.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
