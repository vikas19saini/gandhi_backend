const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Uploads extends Model { }

Uploads.init({
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullUrl: {
        type: DataTypes.VIRTUAL,
        get() {
            return `${process.env.WEB_URL + this.url}`;
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "uploads"
})

module.exports = Uploads;