'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CotizacionItem extends Model {
    static associate(models) {
      CotizacionItem.belongsTo(models.Cotizacion, { foreignKey: 'cotizacionId', as: 'cotizacion' });
    }
  }

  CotizacionItem.init({
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cotizacionId:  { type: DataTypes.UUID, allowNull: false },
    tipo:          { type: DataTypes.ENUM('mo', 'material'), allowNull: false },
    orden:         { type: DataTypes.INTEGER, defaultValue: 0 },
    descripcion:   { type: DataTypes.STRING, allowNull: false },
    detalle:       { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    unidad:        { type: DataTypes.STRING, defaultValue: 'gl' },
    cantidad:      { type: DataTypes.DECIMAL(10, 3), defaultValue: 1 },
    precioUnitario: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    total:         { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'CotizacionItem',
  });

  return CotizacionItem;
};
