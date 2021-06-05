const route = require("express").Router();
const { Products, ProductsAttributeValues, ProductsCategories, ProductsUploads, ProductsFilterValues } = require("../../models/index");
const seqConnection = require("../../models/connection");
const { Op } = require("sequelize");
const { writeFileSync } = require("fs");

route.get("/", async (req, res) => {
    let params = {
        order: [["id", "desc"]],
        distinct: true,
        attributes: {
            exclude: ["longDescription", "metaDescription", "metaTitle", "minOrderQuantity", "maxOrderQuantity", "shippingHeight", "shippingLength", "shippingWeight",
                "shortDescription", "step", "tags", "updatedAt", "lengthClassId", "taxClassId", "weightClassId"]
        }
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

    if (req.query.searchBy) {
        params.where = {
            [Op.or]: [
                {
                    sku: {
                        [Op.substring]: req.query.searchBy
                    }
                },
                {
                    name: {
                        [Op.substring]: req.query.searchBy
                    }
                },
                {
                    tags: {
                        [Op.substring]: req.query.searchBy
                    }
                }
            ]
        }
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

route.get("/download/all", async (req, res) => {
    Products.findAll(
        {
            include: ["featuredImage", "thumbnails", "filters", "attributes", "categories"],
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset)
        }
    ).then((products) => {
        let rows = [];
        for (let product of products) {
            let row = {
                name: product.name,
                sku: product.sku,
                shortDescription: product.shortDescription,
                longDescription: product.longDescription,
                tags: product.tags,
                ragularPrice: product.ragularPrice,
                manageStock: product.manageStock,
                quantity: product.quantity,
                shippingWeight: product.shippingWeight,
                status: product.status,
                stockStatus: product.stockStatus,
                image: product.featuredImage ? product.featuredImage.fullUrl : "NULL",
                thumbnails: product.thumbnails.map(th => th.fullUrl).join("||"),
                categories: product.categories.map(cat => cat.slug).join("||"),
                filters: product.filters.map(fil => fil.name).join("||"),
                attributes: product.attributes.map(att => att.name).join("||"),
                attributeValues: product.attributes.map(att => att.productsAttributeValues.attributeDescription).join("||"),
            }

            rows.push(row);
        }

        /* let xlsx = require('json-as-xlsx');

        var buffer = xlsx([
            { label: 'sku', value: 'sku' },
            { label: 'name', value: 'name' },
            { label: 'shortDescription', value: 'shortDescription' },
            { label: 'longDescription', value: 'longDescription' },
            { label: 'tags', value: 'tags' },
            { label: 'categories', value: 'categories' },
            { label: 'attributes', value: 'attributes' },
            { label: 'attributeValues', value: 'attributeValues' },
            { label: 'filters', value: 'filters' },
            { label: 'ragularPrice', value: 'ragularPrice' },
            { label: 'manageStock', value: 'manageStock' },
            { label: 'quantity', value: 'quantity' },
            { label: 'shippingWeight', value: 'shippingWeight' },
            { label: 'thumbnails', value: 'thumbnails' },
            { label: 'image', value: 'image' },
            { label: 'status', value: 'status' },
            { label: 'stockStatus', value: 'stockStatus' },
        ], rows, {
            sheetName: 'Sheet1',
            fileName: 'AllProducts',
            extraLength: 10
        }, false);

        writeFileSync(`${process.env.IMPORT_DIR}/${new Date().getTime()}-AllProducts.xlsx`, buffer); */
        return res.json(rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ status: "fail" });
    })
})

module.exports = route;