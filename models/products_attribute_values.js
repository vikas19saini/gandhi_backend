const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class ProductsAttributeValues extends Model { }

ProductsAttributeValues.init({
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
    attributeValueId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    attributeDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'productsAttributeValues',
    paranoid: true
});

module.exports = ProductsAttributeValues;