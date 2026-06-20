'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Oficio extends Model {
    static associate(models) {
      Oficio.hasMany(models.Partida, { foreignKey: 'oficioId', as: 'partidas' });
    }
  }

  Oficio.init({
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:     { type: DataTypes.STRING, allowNull: false },
    valorHora:  { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    color:      { type: DataTypes.STRING(7), defaultValue: '#6B7280' },
  }, {
    sequelize,
    modelName: 'Oficio',
  });

  return Oficio;
};
