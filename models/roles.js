const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");
const RolesMenus = require("./roles_menus");
const Menus = require("./menus");

class Roles extends Model { }

Roles.init({
    name: {
        type: DataTypes.STRING
    }
}, {
    sequelize: seqConnection,
    underscored: true,
})

Roles.belongsToMany(Menus, { through: RolesMenus });

module.exports = Roles;