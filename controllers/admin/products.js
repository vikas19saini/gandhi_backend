const route = require("express").Router();
const { Products, ProductsAttributeValues, ProductsCategories, ProductsUploads, ProductsFilterValues } = require("../../models/index");
const seqConnection = require("../../models/connection");

route.get("/", async (req, res) => {
    let params = {
        order: [["id", "desc"]],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    if (req.query.include) {
        params.include = req.query.include.split(",");
    }
    params.where = {}
    if (req.query.category_id) {
        params.where.category_id = req.query.category_id;
    }
    if (req.query.sku) {
        params.where.sku = req.query.sku;
    }
    if (req.query.name) {
        params.where.name = req.query.name;
    }
    if (req.query.stock_status) {
        params.where.stock_status = req.query.stock_status;
    }
    if (req.query.status) {
        params.where.status = req.query.status;
    }
    try {
        let products = await Products.findAndCountAll(params);

        return res.json(products);
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/", async (req, res) => {
    try {
        const createProduct = await seqConnection.transaction(async (t) => {
            let product = await Products.create(req.body, { transaction: t });
            await product.addCategories(req.body.categories, { transaction: t });
            await product.addFilters(req.body.filters, { transaction: t });
            await product.addThumbnails(req.body.thumbnails, { transaction: t });
            for (attr of req.body.attributes) {
                await product.addAttributes([attr.attributeValueId], { through: { attributeDescription: attr.attributeDescription } }, { transaction: t });
            }
            return product;
        });
        return res.json(createProduct);
    } catch (error) {
        return res.status(400).json(error);
    }
});

route.patch("/:id", async (req, res) => {
    try {
        const productTransaction = await seqConnection.transaction(async (t) => {
            let product = await Products.findByPk(req.params.id);
            await Products.update(req.body, {
                where: {
                    id: req.params.id
                }
            });
            req.body.categories ? await product.setCategories(req.body.categories, { transaction: t }) : await product.setCategories([], { transaction: t });
            req.body.filters ? await product.setFilters(req.body.filters, { transaction: t }) : await product.setFilters([], { transaction: t });
            req.body.thumbnails ? await product.setThumbnails(req.body.thumbnails, { transaction: t }) : await product.setThumbnails([], { transaction: t });

            const productsAttributes = await ProductsAttributeValues.findAll({
                where: {
                    productId: req.params.id
                }
            }, { transaction: t });
            const productsAttributesIds = productsAttributes.map(val => val.id);
            for (const productAttrId of productsAttributesIds) {
                let reqAttributeValue = req.body.attributes.filter(a => a.id === productAttrId);
                if (reqAttributeValue.length > 0) {
                    await ProductsAttributeValues.update(reqAttributeValue[0], {
                        where: {
                            id: productAttrId
                        }
                    }, { transaction: t });
                } else {
                    await ProductsAttributeValues.destroy({
                        where: {
                            id: productAttrId
                        }
                    }, { transaction: t });
                }
            }

            const newAttributeValues = req.body.attributes.filter(val => !val.id);
            for (const saveNewAttr of newAttributeValues) {
                await ProductsAttributeValues.create({ ...saveNewAttr, ...{ productId: req.params.id } }, { transaction: t });
            }

            return product;
        })
        return res.json(productTransaction);
    } catch (err) {
        return res.status(500).json(err);
    }
});

route.patch("/status/:id", (req, res) => {
    Products.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then((data) => {
        return res.json({ message: "Updated" });
    }).catch(error => {
        return res.status(500).json(error);
    });
});

route.get("/:id", (req, res) => {
    Products.findByPk(req.params.id, {
        include: ["categories", "filters", "thumbnails", "attributes", "featuredImage", "taxClass", "lengthClass", "weightClass"]
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res) => {
    try {
        const productTransaction = await seqConnection.transaction(async (t) => {
            await Products.destroy({
                where: {
                    id: req.params.id
                }, transaction: t
            });
            await ProductsAttributeValues.destroy({
                where: {
                    productId: req.params.id
                }, transaction: t
            });
            await ProductsCategories.destroy({
                where: {
                    productId: req.params.id
                }, transaction: t
            });
            await ProductsUploads.destroy({
                where: {
                    productId: req.params.id
                }, transaction: t
            });
            await ProductsFilterValues.destroy({
                where: {
                    productId: req.params.id
                }, transaction: t
            });
            return { message: "Successfully deleted" };
        });
        return res.json(productTransaction);
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = route;