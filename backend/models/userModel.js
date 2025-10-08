import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastLoginTime: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('unverified', 'active', 'blocked'),
    defaultValue: 'unverified'
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  emailVerificationToken: {
    type: DataTypes.STRING
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'unique_email_index'
    },
    {
      fields: ['status'],
      name: 'user_status_index'
    },
    {
      fields: ['lastLoginTime'],
      name: 'last_login_index'
    }
  ]
});

export default User;