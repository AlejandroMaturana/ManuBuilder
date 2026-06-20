'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Oficios', [
      { id: uuidv4(), nombre: 'Construcción general', valorHora: 8000,  color: '#F59E0B', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), nombre: 'Carpintería',           valorHora: 9000,  color: '#8B5CF6', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), nombre: 'Soldadura',             valorHora: 10000, color: '#EF4444', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), nombre: 'Electricidad',          valorHora: 9500,  color: '#3B82F6', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), nombre: 'Gasfitería',            valorHora: 9000,  color: '#06B6D4', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), nombre: 'Pintura',               valorHora: 7500,  color: '#10B981', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), nombre: 'Demolición',            valorHora: 7000,  color: '#6B7280', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Oficios', null, {});
  },
};
