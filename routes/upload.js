const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'menu', // Puedes cambiar el nombre de la carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage: storage });

// Ruta para subir una imagen con logs detallados
router.post('/', upload.single('imagen'), (req, res) => {
  console.log('Archivo recibido:', req.file);
  if (!req.file) {
    console.error('No se subió archivo');
    return res.status(400).json({ error: 'No se subió archivo' });
  }
  res.json({ url: req.file.path });
});

module.exports = router;
