'use strict';
const router = require('express').Router();
const { Configuracion } = require('../models');

const DEFAULTS = {
  id: 1,
  nombre: '', especialidad: '', telefono: '', email: '', ciudad: '', logoUrl: null,
  margenSugerido: 30, validezDias: 30, moneda: 'CLP',
  formaPagoDefault: '50% anticipo — 50% al término',
  exclusionesDefault: '', observacionesDefault: '', pieCotizacion: '',
};

async function getOrCreate() {
  let cfg = await Configuracion.findByPk(1);
  if (!cfg) cfg = await Configuracion.create(DEFAULTS);
  return cfg;
}

router.get('/', async (_req, res, next) => {
  try {
    const cfg = await getOrCreate();
    res.json(cfg);
  } catch (e) { next(e); }
});

router.put('/', async (req, res, next) => {
  try {
    let cfg = await Configuracion.findByPk(1);
    if (!cfg) cfg = await Configuracion.create({ ...DEFAULTS, ...req.body });
    else await cfg.update(req.body);
    res.json(cfg);
  } catch (e) { next(e); }
});

module.exports = router;
