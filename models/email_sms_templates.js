const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class EmailSmsTemplates extends Model { }

EmailSmsTemplates.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notificationStatus: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Invalid notification status 0 or 1 allowed"
            }
        }
    },
    type: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Invalid types 0 or 1 allowed"
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'emailSmsTemplates',
    timestamps: false
});

module.exports = EmailSmsTemplates;