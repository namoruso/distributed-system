import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/bd.js';
import pagoRutas from './routes/pagoRutas.js';

dotenv.config();

const app = express();
const puerto = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

app.use('/api/pagos', pagoRutas);

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    servicio: 'Payments Service',
    puerto,
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ msg: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: 'Error interno del servidor', error: err.message });
});

// Inicia BD y servidor
const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conectado a BD correctamente');

    await sequelize.sync({ alter: false });
    console.log('✓ Modelos sincronizados');

    app.listen(puerto, () => {
      console.log(`✓ Payments Service ejecutándose en puerto ${puerto}`);
      console.log(`✓ Health: http://localhost:${puerto}/health`);
    });
  } catch (err) {
    console.error('✗ Error al iniciar:', err.message);
    process.exit(1);
  }
};

iniciar();
