import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });  // Configure multer to save uploaded files to the 'uploads' directory

export const uploadRouter = express.Router();  // Create a new router

// Handle POST requests to the upload endpoint for multiple files
uploadRouter.post('/', upload.array('images', 10), async (req, res) => {  // Adjust the limit as needed
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    console.error('No files uploaded');  // Log an error if no files are uploaded
    return res.status(400).send('No files uploaded.');  // Respond with a 400 status code if no files are uploaded
  }

  const fileInfos: { fileUrl: string, compressedSize: number }[] = [];

  try {
    for (const file of req.files as Express.Multer.File[]) {
      const inputPath = file.path;  // Get the path of the uploaded file
      const outputPath = path.join('uploads', `${file.filename}.webp`);  // Define the path for the compressed file

      console.log(`Processing file: ${inputPath}`);  // Log the start of the file processing
      await sharp(inputPath)  // Use sharp to process the image
        .toFormat('webp')  // Convert the image to WebP format
        .toFile(outputPath);  // Save the converted image to the output path

      const compressedSize = fs.statSync(outputPath).size;  // Get the size of the compressed file
      fs.unlinkSync(inputPath);  // Delete the original uploaded file

      console.log(`File processed successfully: ${outputPath}`);  // Log the successful file processing
      fileInfos.push({ fileUrl: `http://localhost:3000/uploads/${file.filename}.webp`, compressedSize });
    }

    res.json(fileInfos);  // Respond with the URLs and sizes of the compressed files
  } catch (error) {
    console.error(`Error processing image: ${error}`);  // Log any errors that occur during processing
    res.status(500).send('Error processing image.');  // Respond with a 500 status code if an error occurs
  }
});

// Serve the uploaded files statically
uploadRouter.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
