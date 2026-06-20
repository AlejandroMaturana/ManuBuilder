'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Proyecto extends Model {
    static associate(models) {
      Proyecto.belongsTo(models.Cliente,  { foreignKey: 'clienteId', as: 'cliente' });
      Proyecto.hasMany(models.Partida,    { foreignKey: 'proyectoId', as: 'partidas' });
      Proyecto.hasMany(models.Registro,   { foreignKey: 'proyectoId', as: 'registros' });
    }
  }

  Proyecto.init({
    id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    clienteId:        { type: DataTypes.UUID, allowNull: false },
    nombre:           { type: DataTypes.STRING, allowNull: false },
    descripcion:      { type: DataTypes.TEXT },
    estado: {
      type: DataTypes.ENUM('borrador', 'activo', 'pausado', 'cerrado'),
      defaultValue: 'borrador',
    },
    presupuestoTotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    fechaInicio:      { type: DataTypes.DATEONLY },
    fechaTermino:     { type: DataTypes.DATEONLY },
    notas:            { type: DataTypes.TEXT },
  }, {
    sequelize,
    modelName: 'Proyecto',
  });

  return Proyecto;
};
