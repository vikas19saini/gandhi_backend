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
        attributes: {
            exclude: ["shippingWidth", "shippingWeight", "shippingLength", "shippingHeight", "lengthClassId", "createdAt", "deletedAt", "updatedAt",
                "status", "tags", "taxClassId", "weightClassId"]
        }
    });

    if (product) {
        let attributes = await product.getAttributes({
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "attributeId", "sortOrder"]
            },
            joinTableAttributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] },
            order: [["sortOrder", "asc"]]
        });

        let featuredImage = await product.getFeaturedImage({
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
            },
        });

        let thumbnails = await product.getThumbnails({
            joinTableAttributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] },
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
            },
        });

        product = {
            ...product.toJSON(), ...{
                attributes: attributes,
                featuredImage: featuredImage,
                thumbnails: thumbnails
            }
        }

        return res.json(product);
    } else {
        return res.status(404).json({ message: "No Data Found" });
    }
})

module.exports = route;