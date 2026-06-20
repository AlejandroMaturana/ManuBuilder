'use strict';

const router = require('express').Router();
const { Registro, Stock } = require('../models');

// GET /api/registros?proyectoId=&tipo=&fecha=
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.proyectoId) where.proyectoId = req.query.proyectoId;
    if (req.query.tipo)       where.tipo        = req.query.tipo;
    if (req.query.fecha)      where.fecha        = req.query.fecha;

    const registros = await Registro.findAll({
      where,
      order: [['fecha', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(registros);
  } catch (e) { next(e); }
});

// POST /api/registros  ← captura rápida
router.post('/', async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      fecha: req.body.fecha || new Date().toISOString().split('T')[0], // hoy si no viene
    };

    const registro = await Registro.create(data);

    // Si viene de stock propio, descontar automáticamente
    if (data.esStockPropio && data.stockId) {
      const item = await Stock.findByPk(data.stockId);
      if (item) {
        const nueva = parseFloat(item.cantidadDisponible) - parseFloat(data.cantidad);
        await item.update({ cantidadDisponible: Math.max(0, nueva) });
      }
    }

    res.status(201).json(registro);
  } catch (e) { next(e); }
});

// PUT /api/registros/:id
router.put('/:id', async (req, res, next) => {
  try {
    const registro = await Registro.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ error: 'No encontrado' });
    await registro.update(req.body);
    res.json(registro);
  } catch (e) { next(e); }
});

// DELETE /api/registros/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const registro = await Registro.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ error: 'No encontrado' });
    await registro.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
