const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Countries extends Model { }

Countries.init({
    name: {
        type: DataTypes.STRING
    },
    code_2: {
        type: DataTypes.STRING
    },
    code_3: {
        type: DataTypes.STRING
    }
}, {
    underscored: true,
    paranoid: true,
    sequelize: seqConnection,
    modelName: 'countries'
});

module.exports = Countries;