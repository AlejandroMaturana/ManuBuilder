'use strict';
const router = require('express').Router();
const { Op, fn, col, literal } = require('sequelize');
const { Cotizacion, CotizacionItem, Proyecto, Partida, Cliente, sequelize } = require('../models');

// ── Generar correlativo ─────────────────────────────────────────
async function generarCorrelativo() {
  const year = new Date().getFullYear();
  const ultimo = await Cotizacion.findOne({
    where: { correlativo: { [Op.like]: `COT-${year}-%` } },
    order: [['correlativo', 'DESC']],
    attributes: ['correlativo'],
  });
  let num = 1;
  if (ultimo) {
    const partes = ultimo.correlativo.split('-');
    num = parseInt(partes[2], 10) + 1;
  }
  return `COT-${year}-${String(num).padStart(4, '0')}`;
}

// ── GET /api/cotizaciones ────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const cotizaciones = await Cotizacion.findAll({
      include: [{ model: CotizacionItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(cotizaciones);
  } catch (e) { next(e); }
});

// ── POST /api/cotizaciones ───────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const correlativo = await generarCorrelativo();
    const hoy = new Date().toISOString().split('T')[0];
    const validezDias = parseInt(req.body.validezDias, 10) || 30;
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + validezDias);
    const vencStr = fechaVencimiento.toISOString().split('T')[0];

    const cotizacion = await Cotizacion.create({
      ...req.body,
      correlativo,
      fechaEmision: hoy,
      fechaVencimiento: vencStr,
    });

    if (req.body.items) {
      const items = req.body.items.map((it, i) => ({
        ...it,
        cotizacionId: cotizacion.id,
        orden: it.orden ?? i + 1,
      }));
      await CotizacionItem.bulkCreate(items);

      const savedItems = await CotizacionItem.findAll({ where: { cotizacionId: cotizacion.id } });
      const totalMO = savedItems.filter(i => i.tipo === 'mo').reduce((s, i) => s + parseFloat(i.total || 0), 0);
      const totalMat = savedItems.filter(i => i.tipo === 'material').reduce((s, i) => s + parseFloat(i.total || 0), 0);
      await cotizacion.update({ subtotalMO: totalMO, subtotalMateriales: totalMat, total: totalMO + totalMat });
    }

    const result = await Cotizacion.findByPk(cotizacion.id, {
      include: [{ model: CotizacionItem, as: 'items', order: [['orden', 'ASC']] }],
    });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

// ── GET /api/cotizaciones/:id ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id, {
      include: [{ model: CotizacionItem, as: 'items', order: [['orden', 'ASC']] }],
    });
    if (!cotizacion) return res.status(404).json({ error: 'No encontrada' });
    res.json(cotizacion);
  } catch (e) { next(e); }
});

// ── PUT /api/cotizaciones/:id ────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'No encontrada' });
    if (cotizacion.estado !== 'borrador') return res.status(400).json({ error: 'Solo se puede editar cotizaciones en borrador' });

    await cotizacion.update(req.body);

    if (req.body.items) {
      await CotizacionItem.destroy({ where: { cotizacionId: cotizacion.id } });
      const items = req.body.items.map((it, i) => ({
        ...it,
        cotizacionId: cotizacion.id,
        orden: it.orden ?? i + 1,
      }));
      await CotizacionItem.bulkCreate(items);

      const savedItems = await CotizacionItem.findAll({ where: { cotizacionId: cotizacion.id } });
      const totalMO = savedItems.filter(i => i.tipo === 'mo').reduce((s, i) => s + parseFloat(i.total || 0), 0);
      const totalMat = savedItems.filter(i => i.tipo === 'material').reduce((s, i) => s + parseFloat(i.total || 0), 0);
      await cotizacion.update({ subtotalMO: totalMO, subtotalMateriales: totalMat, total: totalMO + totalMat });
    }

    const result = await Cotizacion.findByPk(cotizacion.id, {
      include: [{ model: CotizacionItem, as: 'items', order: [['orden', 'ASC']] }],
    });
    res.json(result);
  } catch (e) { next(e); }
});

// ── DELETE /api/cotizaciones/:id ─────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'No encontrada' });
    await cotizacion.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── POST /api/cotizaciones/:id/aprobar ───────────────────────────
// Cambia estado a 'aprobada' y genera Proyecto + Partidas
router.post('/:id/aprobar', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id, {
      include: [{ model: CotizacionItem, as: 'items' }],
      transaction: t,
    });
    if (!cotizacion) { await t.rollback(); return res.status(404).json({ error: 'No encontrada' }); }
    if (cotizacion.estado !== 'borrador' && cotizacion.estado !== 'enviada') {
      await t.rollback(); return res.status(400).json({ error: 'Estado no válido para aprobar' });
    }

    // Buscar o crear cliente si no tiene ID
    let clienteId = cotizacion.clienteId;
    if (!clienteId && cotizacion.clienteNombre) {
      const [cliente] = await Cliente.findOrCreate({
        where: { nombre: cotizacion.clienteNombre },
        defaults: {
          nombre: cotizacion.clienteNombre,
          telefono: cotizacion.clienteTelefono,
          email: cotizacion.clienteEmail,
        },
        transaction: t,
      });
      clienteId = cliente.id;
    }

    // Crear proyecto
    const proyecto = await Proyecto.create({
      nombre: cotizacion.descripcionObra?.substring(0, 80) || `Proyecto ${cotizacion.correlativo}`,
      descripcion: cotizacion.descripcionObra || '',
      clienteId,
      estado: 'activo',
      presupuestoTotal: cotizacion.total,
      notas: `Generado desde cotización ${cotizacion.correlativo}`,
    }, { transaction: t });

    // Crear partidas desde items MO
    let orden = 1;
    const itemsMO = cotizacion.items?.filter(i => i.tipo === 'mo') || [];
    for (const item of itemsMO) {
      await Partida.create({
        proyectoId: proyecto.id,
        nombre: item.descripcion,
        hhPresupuestadas: 0,
        costoPresupuestado: item.total,
        orden: orden++,
      }, { transaction: t });
    }

    // Vincular cotización con proyecto
    await cotizacion.update({ estado: 'aprobada', proyectoId: proyecto.id }, { transaction: t });
    await t.commit();

    const result = await Cotizacion.findByPk(cotizacion.id, {
      include: [
        { model: CotizacionItem, as: 'items' },
        { model: Proyecto, as: 'proyecto' },
      ],
    });
    res.json(result);
  } catch (e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /api/cotizaciones/:id/estado ────────────────────────────
router.put('/:id/estado', async (req, res, next) => {
  try {
    const { estado } = req.body;
    if (!['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    const cotizacion = await Cotizacion.findByPk(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'No encontrada' });
    await cotizacion.update({ estado });
    res.json(cotizacion);
  } catch (e) { next(e); }
});

module.exports = router;
