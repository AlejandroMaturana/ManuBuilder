'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Stocks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombre:              { type: Sequelize.STRING, allowNull: false },
      unidad:              { type: Sequelize.STRING, defaultValue: 'und' },
      cantidadDisponible:  { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      costoReferencial:    { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      ubicacion:           { type: Sequelize.STRING },
      notas:               { type: Sequelize.TEXT },
      createdAt:           { type: Sequelize.DATE, allowNull: false },
      updatedAt:           { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Stocks');
  },
};
