const { DataTypes, Model } = require("sequelize");
const startConnection = require("./connection");

class Roles extends Model { }

Roles.init({
    name: {
        type: DataTypes.STRING
    }
}, {
    sequelize: startConnection,
    underscored: true,
})

module.exports = Roles;