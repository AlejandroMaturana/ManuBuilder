'use strict';
const router = require('express').Router();
const { Cliente, Proyecto } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });
    res.json(clientes);
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Cliente.create(req.body)); }
  catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const c = await Cliente.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'No encontrado' });
    res.json(c);
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const c = await Cliente.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'No encontrado' });
    await c.update(req.body); res.json(c);
  } catch (e) { next(e); }
});
router.get('/:id/proyectos', async (req, res, next) => {
  try {
    res.json(await Proyecto.findAll({ where: { clienteId: req.params.id }, order: [['createdAt', 'DESC']] }));
  } catch (e) { next(e); }
});
module.exports = router;
