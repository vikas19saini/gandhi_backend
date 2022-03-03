const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Categories extends Model { }

Categories.init({
    name: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    thName: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    viName: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    metaTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaDesceiption: {
        type: DataTypes.STRING,
        allowNull: true
    },
    layout: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    thDescription: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    viDescription: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    parentId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    uploadId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    subCategoryId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    iconId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "categories",
    paranoid: true
});

Categories.findBySlug = async (slug) => {
    try {
        const category = await Categories.findOne({
            where: {
                slug: slug
            }
        });

        if (category) {
            return category.toJSON();
        } else {
            return false;
        }

    } catch (error) {
        return false;
    }
}

Categories.isHierarchy();
module.exports = Categories;