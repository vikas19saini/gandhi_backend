const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

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
    paranoid: true
});

Products.getCurrentStockStatus = (product) => {
    if (product.stockStatus) {
        if (product.manageStock && product.quantity <= 0)
            product.stockStatus = 0
    }

    return product.stockStatus
}

Products.prototype.releaseQuantity = function (isCart = false) {
    if (this.manageStock) {
        Products.update({
            quantity: isCart ? this.quantity + this.cartProducts.quantity : this.quantity + this.ordersProducts.quantity
        }, {
            where: { id: this.id }
        })
    }
}

Products.prototype.lockQuantity = function () {
    if (this.manageStock) {
        if (this.quantity > this.cartProducts.quantity) {
            Products.update({
                quantity: this.quantity - this.cartProducts.quantity
            }, {
                where: { id: this.id }
            });
        } else {
            throw new Error("Stock allocation failed! Insufficient stock");
        }
    }
}

module.exports = Products;