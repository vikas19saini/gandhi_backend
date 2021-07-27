const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Manifests extends Model { };

Manifests.init({
    manifest: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    manifestId: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(225),
        allowNull: true,
        validate: {
            isIn: {
                args: [["manifested", "closed"]],
                msg: "Invalid status"
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "manifests",
    paranoid: true
});

module.exports = Manifests;