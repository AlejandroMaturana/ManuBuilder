'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Registros', {
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
      partidaId: {
        type: Sequelize.UUID,
        allowNull: true,          // gastos generales van sin partida
        references: { model: 'Partidas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      stockId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Stocks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      tipo: {
        type: Sequelize.ENUM('hh', 'material', 'gasto'),
        allowNull: false,
      },
      descripcion:   { type: Sequelize.STRING, allowNull: false },
      cantidad:      { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      unidad:        { type: Sequelize.STRING, defaultValue: 'und' },
      costoUnitario: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      costoTotal:    { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      fecha:         { type: Sequelize.DATEONLY, allowNull: false },
      esStockPropio: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Registros');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Registros_tipo";');
  },
};
