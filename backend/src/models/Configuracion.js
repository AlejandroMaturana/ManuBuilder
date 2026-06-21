'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Configuracion extends Model {
    static associate() {}
  }

  Configuracion.init({
    id:               { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    nombre:           { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    especialidad:     { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    telefono:         { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    email:            { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    ciudad:           { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    logoUrl:          { type: DataTypes.STRING, allowNull: true },
    margenSugerido:   { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 30 },
    validezDias:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
    moneda:           { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'CLP' },
    formaPagoDefault: { type: DataTypes.TEXT, allowNull: false, defaultValue: '50% anticipo — 50% al término' },
    exclusionesDefault:  { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    observacionesDefault: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    pieCotizacion:    { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  }, {
    sequelize,
    modelName: 'Configuracion',
  });

  return Configuracion;
};
