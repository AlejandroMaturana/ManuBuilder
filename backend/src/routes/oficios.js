'use strict';
const router = require('express').Router();
const { Oficio } = require('../models');

router.get('/', async (_req, res, next) => {
  try {
    const oficios = await Oficio.findAll({ order: [['nombre', 'ASC']] });
    res.json(oficios);
  } catch (e) { next(e); }
});

module.exports = router;
