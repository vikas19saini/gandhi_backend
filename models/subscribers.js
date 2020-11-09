const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Subscribers extends Model { }

Subscribers.init({
    name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "subscribers"
});

module.exports = Subscribers;