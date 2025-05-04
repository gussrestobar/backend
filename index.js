require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configurar CORS correctamente para que acepte peticiones desde tu frontend en Netlify
const corsOptions = {
  origin: 'https://gussrestobar.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
const exampleRoutes = require('./routes/example');
app.use('/api', exampleRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend en funcionamiento');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});