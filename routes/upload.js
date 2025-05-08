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

// Ruta para subir una imagen
router.post('/', upload.single('imagen'), (req, res) => {
  // La URL de la imagen subida está en req.file.path
  res.json({ url: req.file.path });
});

module.exports = router;
