'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Proyectos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      clienteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Clientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nombre:           { type: Sequelize.STRING, allowNull: false },
      descripcion:      { type: Sequelize.TEXT },
      estado: {
        type: Sequelize.ENUM('borrador', 'activo', 'pausado', 'cerrado'),
        defaultValue: 'borrador',
      },
      presupuestoTotal: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      fechaInicio:      { type: Sequelize.DATEONLY },
      fechaTermino:     { type: Sequelize.DATEONLY },
      notas:            { type: Sequelize.TEXT },
      createdAt:        { type: Sequelize.DATE, allowNull: false },
      updatedAt:        { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Proyectos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Proyectos_estado";');
  },
};
