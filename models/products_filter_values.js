const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class ProductsFilterValues extends Model { }

ProductsFilterValues.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    filterValueId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'productsFilterValues',
    paranoid: true
});

module.exports = ProductsFilterValues;