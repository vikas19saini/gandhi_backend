const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class ProductsCategories extends Model { }

ProductsCategories.init({
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
    categoryId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'productsCategories',
    paranoid: true
});


module.exports = ProductsCategories;