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

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/mesas', mesasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en http://localhost:${PORT}`));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));