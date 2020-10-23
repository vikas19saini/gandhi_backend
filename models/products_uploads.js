const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class ProductsUploads extends Model { }

ProductsUploads.init({
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
    uploadId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: 'productsUploads',
    timestamps: false,
});

module.exports = ProductsUploads;