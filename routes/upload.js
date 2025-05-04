const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const uploadsDir = 'uploads';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

// Almacenamiento en carpeta local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // crea carpeta "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nombre único
  },
});

const upload = multer({ storage });

router.post('/', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió archivo' });
  res.json({ url: `http://localhost:3000/uploads/${req.file.filename}` });
});

module.exports = router;
