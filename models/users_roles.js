const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class UsersRoles extends Model { }

UsersRoles.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'usersRoles',
    paranoid: false
});

module.exports = UsersRoles;