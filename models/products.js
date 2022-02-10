const { DataTypes, Model, Op, Sequelize } = require("sequelize");
const Categories = require("./categories");
const seqConnection = require("./connection");
const Uploads = require("./uploads");

class Products extends Model { }

Products.init({
    sku: {
        type: DataTypes.STRING(225),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    thName: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    viName: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    longDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    thShortDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    thLongDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    viShortDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    viLongDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metaTitle: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    tags: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ragularPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        set(value) {
            this.setDataValue('ragularPrice', parseFloat(value));
        },
        validate: {
            min: {
                args: 1,
                msg: "Invalid ragular price"
            },
        }
    },
    salePrice: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        allowNull: false
    },
    taxClassId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    quantity: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    manageStock: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Invalid status for manage stock 0 or 1 allowed"
            }
        }
    },
    minOrderQuantity: {
        type: DataTypes.BIGINT,
        defaultValue: 1
    },
    maxOrderQuantity: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    step: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.1
    },
    shippingLength: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shippingWidth: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shippingHeight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shippingWeight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    lengthClassId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    weightClassId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    uploadId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Invalid status 0 or 1 allowed"
            }
        }
    },
    stockStatus: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Invalid stock status 0 or 1 allowed"
            }
        }
    },
    currentStockStatus: {
        type: new DataTypes.VIRTUAL(DataTypes.TINYINT, ['stockStatus', 'manageStock', 'quantity']),
        get: function () {
            let status = this.get('stockStatus');
            if (this.get('stockStatus')) {
                if (this.get('manageStock') && this.get('quantity') <= 0)
                    status = 0
            }

            return status;
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "products",
    paranoid: true,
    scopes: {
        active: {
            where: {
                status: 1
            }
        },
        withImage: {
            include: [{
                model: Uploads,
                as: "featuredImage",
                attributes: {
                    exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
                },
            }]
        },
        sortBy(req) {
            let ob = ["id", "desc"];
            if (req && req.query.sort) {
                if (req.query.sort === "ragularPriceAsc") {
                    ob = ["ragularPrice", "asc"];
                } else if (req.query.sort === "ragularPriceDesc") {
                    ob = ["ragularPrice", "desc"];
                } else if (req.query.sort === "createdAtDesc") {
                    ob = ["createdAt", "desc"];
                }
            }
            return {
                order: [ob]
            }
        },
        withFilters(req) {
            let filters = req.query.filters.split("|");
            let filtersArray = [];
            for (let f of filters) {
                filtersArray.push({
                    tags: {
                        [Op.substring]: decodeURI(f)
                    }
                })
            }

            return {
                where: {
                    [Op.or]: filtersArray
                }
            }
        },
        priceFilter(req) {
            return {
                where: {
                    ragularPrice: {
                        [Op.between]: [parseInt(req.query.start), parseInt(req.query.end)]
                    }
                }
            }
        },
        withSearch(req) {
            return {
                where: {
                    [Op.or]: [
                        {
                            name: {
                                [Op.substring]: req.query.query
                            }
                        },
                        {
                            sku: {
                                [Op.substring]: req.query.query
                            }
                        },
                        {
                            tags: {
                                [Op.substring]: req.query.query
                            }
                        },
                        {
                            shortDescription: {
                                [Op.substring]: req.query.query
                            }
                        },
                        {
                            longDescription: {
                                [Op.substring]: req.query.query
                            }
                        }
                    ]
                }
            }
        },
        discounted: {
            where: {
                salePrice: {
                    [Op.gt]: 0
                }
            }
        },
        inCategory(catId) {
            return {
                include: {
                    model: Categories,
                    where: {
                        [Op.or]: [
                            {
                                id: catId,
                            },
                            {
                                parentId: catId
                            }
                        ]
                    },
                    as: "categories",
                    required: true,
                }
            }
        }
    }
});

Products.getCurrentStockStatus = (product) => {
    if (product.stockStatus) {
        if (product.manageStock && product.quantity <= 0)
            product.stockStatus = 0
    }

    return product.stockStatus
}

Products.prototype.releaseQuantity = async function (isCart = false) {
    try {
        if (this.manageStock) {
            this.quantity = isCart ? this.quantity + this.cartProducts.quantity : this.quantity + this.ordersProducts.quantity;
            await this.save();
        }
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

Products.prototype.releaseCartQuantity = async function (qtyToAdd = 0) {
    try {
        if (this.manageStock) {
            this.quantity = this.quantity + qtyToAdd;
            await this.save();
        }
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

Products.prototype.allocateStock = async function (qty = 0) {
    try {
        let status = 0;
        if (!this.currentStockStatus) {
            status = 2;
        } else if (this.manageStock && this.quantity < qty) {
            status = 2;
        } else {
            status = 1;
        }

        if (status === 1 && this.manageStock) {
            this.quantity = this.quantity - qty;
            await this.save();
        }

        return status;
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
}

module.exports = Products;