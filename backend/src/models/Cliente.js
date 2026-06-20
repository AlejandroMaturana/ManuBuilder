'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cliente extends Model {
    static associate(models) {
      Cliente.hasMany(models.Proyecto, { foreignKey: 'clienteId', as: 'proyectos' });
    }
  }

  Cliente.init({
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:    { type: DataTypes.STRING, allowNull: false },
    rut:       { type: DataTypes.STRING, unique: true },
    telefono:  { type: DataTypes.STRING },
    email:     { type: DataTypes.STRING },
    direccion: { type: DataTypes.STRING },
    notas:     { type: DataTypes.TEXT },
  }, {
    sequelize,
    modelName: 'Cliente',
  });

  return Cliente;
};
