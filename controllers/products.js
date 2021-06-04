const route = require('express').Router();
const { Sequelize } = require('sequelize');
const { Products, Categories, Uploads, Attributes, AttributeValues } = require("../models/index");

route.get("/new", async (req, res) => {
    try {
        let products = await Products.findAll({
            where: {
                status: 1
            },
            order: Sequelize.literal('rand()'),
            attributes: ["id", "name", "slug", "sku", "ragularPrice", "salePrice", "uploadId", "minOrderQuantity"],
            include: [{
                model: Uploads,
                as: "featuredImage",
                attributes: {
                    exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
                },
            }],
            limit: 30
        })

        return res.json(products);
    } catch (err) {
        return res.status(500).json(err)
    }
})

route.get("/relative/:pid", async (req, res) => {
    try {
        let product = await Products.findByPk(req.params.pid, {
            include: ["categories"],
            attributes: ['id']
        })

        let productCategories = product.categories.map(c => {
            return c.id
        })

        let products = await Products.findAll({
            include: [{
                model: Categories,
                as: "categories",
                where: {
                    id: productCategories
                },
                required: true,
                through: { attributes: ["categoryId", "productId"] },
                attributes: ['id']
            }, {
                model: Uploads,
                as: "featuredImage",
                attributes: {
                    exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
                },
            }],
            distinct: true,
            limit: 21,
            order: Sequelize.literal('rand()'),
            attributes: ["id", "name", "slug", "sku", "ragularPrice", "salePrice", "uploadId", "minOrderQuantity"]
        })

        return res.json(products);
    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }
})

route.get("/:slug", async (req, res) => {
    let product = await Products.findOne({
        where: {
            slug: req.params.slug
        },
        include: [{
            model: Uploads,
            as: "thumbnails",
            through: { attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] } },
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
            },
        }, {
            model: AttributeValues,
            as: "attributes",
            through: { attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] } },
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "attributeId", "sortOrder"]
            },
        }, {
            model: Uploads,
            as: "featuredImage",
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
            },
        }],
        order: [["attributes", "sortOrder", "asc"]],
        attributes: {
            exclude: ["shippingWidth", "shippingWeight", "shippingLength", "shippingHeight", "lengthClassId", "createdAt", "deletedAt", "updatedAt",
                "status", "tags", "taxClassId", "weightClassId"]
        }
    });

    if (product) {
        return res.json(product);
    } else {
        return res.status(404).json({ message: "No Data Found" });
    }
})

module.exports = route;