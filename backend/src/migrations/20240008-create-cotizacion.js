'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cotizacions', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      correlativo:      { type: Sequelize.STRING(20), allowNull: false, unique: true },
      clienteId:        { type: Sequelize.UUID, allowNull: true, references: { model: 'Clientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      clienteNombre:    { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      clienteTelefono:  { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      clienteEmail:     { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      clienteDireccion: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
      descripcionObra:  { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      estado:           { type: Sequelize.ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'), defaultValue: 'borrador' },
      condicionesPago:  { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      exclusiones:      { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      observaciones:    { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      validezDias:      { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      fechaEmision:     { type: Sequelize.DATEONLY, allowNull: false },
      fechaVencimiento: { type: Sequelize.DATEONLY, allowNull: false },
      subtotalMO:       { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      subtotalMateriales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total:            { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      proyectoId:       { type: Sequelize.UUID, allowNull: true, references: { model: 'Proyectos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      createdAt:        { type: Sequelize.DATE, allowNull: false },
      updatedAt:        { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('CotizacionItems', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      cotizacionId:  { type: Sequelize.UUID, allowNull: false, references: { model: 'Cotizacions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      tipo:          { type: Sequelize.ENUM('mo', 'material'), allowNull: false },
      orden:         { type: Sequelize.INTEGER, defaultValue: 0 },
      descripcion:   { type: Sequelize.STRING, allowNull: false },
      detalle:       { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      unidad:        { type: Sequelize.STRING, defaultValue: 'gl' },
      cantidad:      { type: Sequelize.DECIMAL(10, 3), defaultValue: 1 },
      precioUnitario: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total:         { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CotizacionItems');
    await queryInterface.dropTable('Cotizacions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Cotizacions_estado";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CotizacionItems_tipo";');
  },
};
