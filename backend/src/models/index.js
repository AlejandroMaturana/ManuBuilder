'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const db = {};

// Carga de modelos
db.Oficio   = require('./Oficio')(sequelize);
db.Cliente  = require('./Cliente')(sequelize);
db.Proyecto = require('./Proyecto')(sequelize);
db.Partida  = require('./Partida')(sequelize);
db.Stock    = require('./Stock')(sequelize);
db.Registro = require('./Registro')(sequelize);

// Asociaciones
Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
