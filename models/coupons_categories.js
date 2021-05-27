const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class CouponsCategories extends Model { }

CouponsCategories.init({
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
    categoryId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'couponsCategories',
    paranoid: true,
});


module.exports = CouponsCategories;