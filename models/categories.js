const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Categories extends Model { }

Categories.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    meta_title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    meta_desceiption: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    parentId: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "categories"
});

Categories.isHierarchy({
    labels: true
});
module.exports = Categories;