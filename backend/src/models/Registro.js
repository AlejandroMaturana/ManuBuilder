'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Registro extends Model {
    static associate(models) {
      Registro.belongsTo(models.Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });
      Registro.belongsTo(models.Partida,  { foreignKey: 'partidaId',  as: 'partida' });
      Registro.belongsTo(models.Stock,    { foreignKey: 'stockId',    as: 'stock' });
    }
  }

  Registro.init({
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    proyectoId:   { type: DataTypes.UUID, allowNull: false },
    partidaId:    { type: DataTypes.UUID, allowNull: true },
    stockId:      { type: DataTypes.UUID, allowNull: true },
    tipo: {
      type: DataTypes.ENUM('hh', 'material', 'gasto'),
      allowNull: false,
    },
    descripcion:   { type: DataTypes.STRING, allowNull: false },
    cantidad:      { type: DataTypes.DECIMAL(10, 3), allowNull: false },
    unidad:        { type: DataTypes.STRING, defaultValue: 'und' },
    costoUnitario: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    costoTotal:    { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    fecha:         { type: DataTypes.DATEONLY, allowNull: false },
    esStockPropio: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    sequelize,
    modelName: 'Registro',
    hooks: {
      // Calcula costoTotal automáticamente antes de guardar
      beforeSave(registro) {
        registro.costoTotal = parseFloat(registro.cantidad) * parseFloat(registro.costoUnitario);
      },
    },
  });

  return Registro;
};
