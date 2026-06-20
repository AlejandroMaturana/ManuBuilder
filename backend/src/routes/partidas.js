'use strict';
const router = require('express').Router();
const { Partida, Oficio } = require('../models');

router.put('/:id', async (req, res, next) => {
  try {
    const p = await Partida.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    await p.update(req.body); res.json(p);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const p = await Partida.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    await p.destroy(); res.json({ ok: true });
  } catch (e) { next(e); }
});
module.exports = router;
