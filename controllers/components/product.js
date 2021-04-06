const { Products } = require("../../models")

const stockIncDec = async (product, action, quantity) => {
    try {
        if (action === "plus") {
            await Products.update({ quantity: product.quantity + quantity }, { where: { id: product.id } });
            return true;
        } else if (action === "minus") {
            if (product.currentStockStatus && product.manageStock) {
                if ((product.quantity < quantity)) {
                    return false;
                } else {
                    await Products.update({ quantity: product.quantity - quantity }, { where: { id: product.id } });
                    return true
                }
            }
        }
    } catch (err) {
        return false;
    }
}

module.exports = { stockIncDec }