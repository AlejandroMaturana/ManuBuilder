'use strict';
const router = require('express').Router();
const { resumenGlobal } = require('../services/rentabilidad.service');

router.get('/', async (req, res, next) => {
  try {
    const data = await resumenGlobal();
    res.json(data);
  } catch (e) { next(e); }
});

module.exports = router;
