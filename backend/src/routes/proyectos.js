'use strict';

const router     = require('express').Router();
const { Proyecto, Cliente, Partida, Oficio, Registro } = require('../models');
const { calcularRentabilidad } = require('../services/rentabilidad.service');

// GET /api/proyectos
router.get('/', async (req, res, next) => {
  try {
    const proyectos = await Proyecto.findAll({
      include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(proyectos);
  } catch (e) { next(e); }
});

// POST /api/proyectos
router.post('/', async (req, res, next) => {
  try {
    const proyecto = await Proyecto.create(req.body);
    res.status(201).json(proyecto);
  } catch (e) { next(e); }
});

// GET /api/proyectos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Partida, as: 'partidas', include: [{ model: Oficio, as: 'oficio' }] },
      ],
    });
    if (!proyecto) return res.status(404).json({ error: 'No encontrado' });
    res.json(proyecto);
  } catch (e) { next(e); }
});

// PUT /api/proyectos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'No encontrado' });
    await proyecto.update(req.body);
    res.json(proyecto);
  } catch (e) { next(e); }
});

// GET /api/proyectos/:id/rentabilidad  ← endpoint estrella
router.get('/:id/rentabilidad', async (req, res, next) => {
  try {
    const resultado = await calcularRentabilidad(req.params.id);
    res.json(resultado);
  } catch (e) { next(e); }
});

// GET /api/proyectos/:id/registros
router.get('/:id/registros', async (req, res, next) => {
  try {
    const { tipo, fecha } = req.query;
    const where = { proyectoId: req.params.id };
    if (tipo)  where.tipo  = tipo;
    if (fecha) where.fecha = fecha;

    const registros = await Registro.findAll({
      where,
      include: [{ model: Partida, as: 'partida' }],
      order: [['fecha', 'DESC']],
    });
    res.json(registros);
  } catch (e) { next(e); }
});

// GET /api/proyectos/:id/partidas
router.get('/:id/partidas', async (req, res, next) => {
  try {
    const partidas = await Partida.findAll({
      where: { proyectoId: req.params.id },
      include: [{ model: Oficio, as: 'oficio' }],
      order: [['orden', 'ASC']],
    });
    res.json(partidas);
  } catch (e) { next(e); }
});

// POST /api/proyectos/:id/partidas
router.post('/:id/partidas', async (req, res, next) => {
  try {
    const partida = await Partida.create({ ...req.body, proyectoId: req.params.id });
    res.status(201).json(partida);
  } catch (e) { next(e); }
});

module.exports = router;
