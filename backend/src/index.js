'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { sequelize } = require('./models');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/clientes',   require('./routes/clientes'));
app.use('/api/proyectos',  require('./routes/proyectos'));
app.use('/api/partidas',   require('./routes/partidas'));
app.use('/api/configuracion', require('./routes/configuracion'));
app.use('/api/cotizaciones',  require('./routes/cotizaciones'));
app.use('/api/oficios',       require('./routes/oficios'));
app.use('/api/registros',  require('./routes/registros'));
app.use('/api/stock',      require('./routes/stock'));
app.use('/api/dashboard',  require('./routes/dashboard'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

// ── Inicio ────────────────────────────────────────────────────────────────────
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL conectado');
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Error de conexión a la base de datos:', err.message);
    process.exit(1);
  });
