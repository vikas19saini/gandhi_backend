const { DataTypes, Model } = require("sequelize");
const passwordHash = require('password-hash');
const startConnection = require("./connection");
const { sendOtp } = require("../mailers/mailer");

class Users extends Model { }

Users.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    paranoid: true,
});

Users.afterCreate(async (user, options) => {
    if (!options.bypassEmail)
        sendOtp(user); // Sending Otp
});

Users.afterUpdate(async (user, option) => {
    if (option.sendOtp) sendOtp(user);
})

module.exports = Users;