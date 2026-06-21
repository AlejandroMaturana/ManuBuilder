'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Configuracions', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, defaultValue: 1 },
      nombre:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      especialidad:     { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      telefono:         { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      email:            { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      ciudad:           { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      logoUrl:          { type: Sequelize.STRING, allowNull: true },
      margenSugerido:   { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 30 },
      validezDias:       { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      moneda:           { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'CLP' },
      formaPagoDefault: { type: Sequelize.TEXT, allowNull: false, defaultValue: '50% anticipo — 50% al término' },
      exclusionesDefault:  { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      observacionesDefault: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      pieCotizacion:    { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      createdAt:        { type: Sequelize.DATE, allowNull: false },
      updatedAt:        { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Configuracions');
  },
};
