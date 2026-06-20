'use strict';

const { Registro, Partida, Oficio, Proyecto } = require('../models');
const { Op } = require('sequelize');

/**
 * Calcula la rentabilidad completa de un proyecto.
 * Retorna todos los números que el dashboard necesita.
 */
async function calcularRentabilidad(proyectoId) {
  const proyecto = await Proyecto.findByPk(proyectoId, {
    include: [
      {
        model: Partida,
        as: 'partidas',
        include: [{ model: Oficio, as: 'oficio' }],
      },
    ],
  });

  if (!proyecto) throw new Error('Proyecto no encontrado');

  const registros = await Registro.findAll({
    where: { proyectoId },
    include: [
      { model: Partida, as: 'partida', include: [{ model: Oficio, as: 'oficio' }] },
    ],
  });

  // ── Costos reales ──────────────────────────────────────────────────────────

  let costoRealHH          = 0;
  let costoRealMateriales  = 0;
  let costoRealGastos      = 0;
  let hhReales             = 0;

  for (const reg of registros) {
    const costo = parseFloat(reg.costoTotal) || 0;

    if (reg.tipo === 'hh') {
      // Valorizar: usa el valorHora del oficio de la partida, o fallback al costoUnitario directo del registro
      const valorHora = reg.partida?.oficio?.valorHora
        ? parseFloat(reg.partida.oficio.valorHora)
        : parseFloat(reg.costoUnitario) || 0;
      costoRealHH += parseFloat(reg.cantidad) * valorHora;
      hhReales    += parseFloat(reg.cantidad);
    } else if (reg.tipo === 'material') {
      costoRealMateriales += costo;
    } else if (reg.tipo === 'gasto') {
      costoRealGastos += costo;
    }
  }

  const costoRealTotal = costoRealHH + costoRealMateriales + costoRealGastos;

  // ── Presupuesto ────────────────────────────────────────────────────────────

  const presupuesto = parseFloat(proyecto.presupuestoTotal) || 0;

  const hhPresupuestadas = proyecto.partidas.reduce(
    (sum, p) => sum + (parseFloat(p.hhPresupuestadas) || 0), 0
  );
  const costoPresupuestadoPartidas = proyecto.partidas.reduce(
    (sum, p) => sum + (parseFloat(p.costoPresupuestado) || 0), 0
  );

  // ── Indicadores ───────────────────────────────────────────────────────────

  const rentabilidad = presupuesto - costoRealTotal;
  const margenPct    = presupuesto > 0
    ? ((rentabilidad / presupuesto) * 100).toFixed(1)
    : 0;

  // Lo que deberías haber cobrado con un margen del 30%
  const MARGEN_SUGERIDO = 0.30;
  const valorSugerido   = costoRealTotal * (1 + MARGEN_SUGERIDO);

  // Avance HH
  const avanceHH = hhPresupuestadas > 0
    ? ((hhReales / hhPresupuestadas) * 100).toFixed(1)
    : 0;

  return {
    proyectoId,
    nombre: proyecto.nombre,
    estado: proyecto.estado,

    presupuesto: {
      total:     presupuesto,
      hh:        hhPresupuestadas,
      partidas:  costoPresupuestadoPartidas,
    },

    real: {
      hh:          costoRealHH,
      materiales:  costoRealMateriales,
      gastos:      costoRealGastos,
      total:       costoRealTotal,
      hhHoras:     hhReales,
    },

    indicadores: {
      rentabilidad,
      margenPct:      Number(margenPct),
      valorSugerido,
      avanceHHPct:    Number(avanceHH),
      estaEnRojo:     rentabilidad < 0,
    },
  };
}

/**
 * Resumen global de todos los proyectos (para dashboard home)
 */
async function resumenGlobal() {
  const proyectos = await Proyecto.findAll({
    where: { estado: { [Op.ne]: 'borrador' } },
    attributes: ['id', 'nombre', 'estado', 'presupuestoTotal'],
  });

  const resultados = await Promise.all(
    proyectos.map((p) => calcularRentabilidad(p.id))
  );

  const totalPresupuestado = resultados.reduce((s, r) => s + r.presupuesto.total, 0);
  const totalCostoReal     = resultados.reduce((s, r) => s + r.real.total, 0);
  const totalRentabilidad  = resultados.reduce((s, r) => s + r.indicadores.rentabilidad, 0);
  const enRojo             = resultados.filter((r) => r.indicadores.estaEnRojo).length;

  return {
    proyectos: resultados,
    totales: {
      presupuestado:  totalPresupuestado,
      costoReal:      totalCostoReal,
      rentabilidad:   totalRentabilidad,
      proyectosEnRojo: enRojo,
    },
  };
}

module.exports = { calcularRentabilidad, resumenGlobal };
