import express from 'express';
import cors from 'cors';
import { uploadRouter } from './upload';
import path from 'path';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve a simple response for the root URL
app.get('/', (_req, res) => {
  res.send('Welcome to the Image Converter API');
});

app.use('/api/upload', uploadRouter);

// Serve the uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
