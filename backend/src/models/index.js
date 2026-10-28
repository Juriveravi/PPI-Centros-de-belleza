const { DataTypes } = require('sequelize');
const { requireSequelize } = require('../config/database');

let models = null;

function getModels() {
  if (models) return models;

  const sequelize = requireSequelize();

  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      label: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
    },
    { tableName: 'roles' }
  );

  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
        references: {
          model: Role,
          key: 'id',
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    { tableName: 'users' }
  );

  Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

  models = { sequelize, Role, User };
  return models;
}

module.exports = { getModels };
