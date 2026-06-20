'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Clientes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombre:    { type: Sequelize.STRING, allowNull: false },
      rut:       { type: Sequelize.STRING, unique: true },
      telefono:  { type: Sequelize.STRING },
      email:     { type: Sequelize.STRING },
      direccion: { type: Sequelize.STRING },
      notas:     { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Clientes');
  },
};
