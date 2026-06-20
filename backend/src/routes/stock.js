'use strict';
const router = require('express').Router();
const { Stock } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    res.json(await Stock.findAll({ order: [['nombre', 'ASC']] }));
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Stock.create(req.body)); }
  catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const s = await Stock.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'No encontrado' });
    await s.update(req.body); res.json(s);
  } catch (e) { next(e); }
});
// POST /api/stock/:id/consumir  — descuenta sin crear un Registro
router.post('/:id/consumir', async (req, res, next) => {
  try {
    const s = await Stock.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'No encontrado' });
    const nueva = parseFloat(s.cantidadDisponible) - parseFloat(req.body.cantidad || 0);
    await s.update({ cantidadDisponible: Math.max(0, nueva) });
    res.json(s);
  } catch (e) { next(e); }
});
module.exports = router;
