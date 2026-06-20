'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Partidas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      proyectoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Proyectos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      oficioId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Oficios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      nombre:               { type: Sequelize.STRING, allowNull: false },
      hhPresupuestadas:     { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      costoPresupuestado:   { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      orden:                { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt:            { type: Sequelize.DATE, allowNull: false },
      updatedAt:            { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Partidas');
  },
};
