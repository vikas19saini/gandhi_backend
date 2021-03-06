const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Roles extends Model { }

Roles.init({
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'roles'
})

module.exports = Roles;