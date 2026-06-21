'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cotizacion extends Model {
    static associate(models) {
      Cotizacion.belongsTo(models.Cliente,   { foreignKey: 'clienteId',  as: 'cliente' });
      Cotizacion.belongsTo(models.Proyecto,  { foreignKey: 'proyectoId', as: 'proyecto' });
      Cotizacion.hasMany(models.CotizacionItem, { foreignKey: 'cotizacionId', as: 'items' });
    }
  }

  Cotizacion.init({
    id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    correlativo:      { type: DataTypes.STRING(20), allowNull: false, unique: true },
    clienteId:        { type: DataTypes.UUID, allowNull: true },
    clienteNombre:    { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    clienteTelefono:  { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    clienteEmail:     { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    clienteDireccion: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    descripcionObra:  { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    estado:           { type: DataTypes.ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'), defaultValue: 'borrador' },
    condicionesPago:  { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    exclusiones:      { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    observaciones:    { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    validezDias:      { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
    fechaEmision:     { type: DataTypes.DATEONLY, allowNull: false },
    fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: false },
    subtotalMO:       { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    subtotalMateriales: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    total:            { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    proyectoId:       { type: DataTypes.UUID, allowNull: true },
  }, {
    sequelize,
    modelName: 'Cotizacion',
  });

  return Cotizacion;
};
