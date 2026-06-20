'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Stock extends Model {
    static associate(models) {
      Stock.hasMany(models.Registro, { foreignKey: 'stockId', as: 'movimientos' });
    }
  }

  Stock.init({
    id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:             { type: DataTypes.STRING, allowNull: false },
    unidad:             { type: DataTypes.STRING, defaultValue: 'und' },
    cantidadDisponible: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
    costoReferencial:   { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    ubicacion:          { type: DataTypes.STRING },
    notas:              { type: DataTypes.TEXT },
  }, {
    sequelize,
    modelName: 'Stock',
  });

  return Stock;
};
