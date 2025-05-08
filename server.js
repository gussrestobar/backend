const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menu');
const uploadRoutes = require('./routes/upload');
const categoriaRoutes = require('./routes/categorias');
const path = require('path');
const reservasRoutes = require('./routes/reservas');
const tenantsRoutes = require('./routes/tenants');
const mesasRoutes = require('./routes/mesas');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();
const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://gussrestobar.netlify.app',
        'https://admi-gussrestobar.netlify.app',
        'https://backend-swqp.onrender.com'
      ]
    : ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Forzar modo producción si estamos en render.com
if (process.env.RENDER) {
  process.env.NODE_ENV = 'production';
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    error: 'Algo salió mal en el servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('CORS configurado para los dominios:', corsOptions.origin);
});