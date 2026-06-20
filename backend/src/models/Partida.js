'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Partida extends Model {
    static associate(models) {
      Partida.belongsTo(models.Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });
      Partida.belongsTo(models.Oficio,   { foreignKey: 'oficioId',   as: 'oficio' });
      Partida.hasMany(models.Registro,   { foreignKey: 'partidaId',  as: 'registros' });
    }
  }

  Partida.init({
    id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    proyectoId:         { type: DataTypes.UUID, allowNull: false },
    oficioId:           { type: DataTypes.UUID, allowNull: true },
    nombre:             { type: DataTypes.STRING, allowNull: false },
    hhPresupuestadas:   { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
    costoPresupuestado: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    orden:              { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'Partida',
  });

  return Partida;
};
