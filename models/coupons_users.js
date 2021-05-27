const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class CouponsUsers extends Model { }

CouponsUsers.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    couponId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'couponsUsers',
    paranoid: true
});


module.exports = CouponsUsers;