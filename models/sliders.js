const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Sliders extends Model { }

Sliders.init({
    type: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    uri: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    heading: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    uploadId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    mobileUploadId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    sortOrder: {
        type: DataTypes.SMALLINT,
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: {
            isIn: [[0, 1]]
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "sliders"
});

module.exports = Sliders;