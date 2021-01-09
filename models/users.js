const { DataTypes, Model } = require("sequelize");
const passwordHash = require('password-hash');
const startConnection = require("./connection");

class Users extends Model { }

Users.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "UniqueEmailAndPhone"
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "UniqueEmailAndPhone"
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', passwordHash.generate(value))
        }
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    token: {
        type: DataTypes.STRING,
    },
    additionalInfo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: startConnection,
    underscored: true,
    modelName: 'users',
});

module.exports = Users;