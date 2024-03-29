const route = require('express').Router();
const { Sequelize } = require('sequelize');
const { Products, Categories, Uploads } = require("../models/index");

route.get("/new", async (req, res) => {
    try {
        let op = {
            attributes: ["id", "slug", "sku", "ragularPrice", "salePrice", "uploadId", "minOrderQuantity", [`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"]],
            include: [{
                model: Uploads,
                as: "featuredImage",
                attributes: {
                    exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
                },
            }],
            limit: 30
        };

        let scopes = ["active"];
        if (req.query.filterBy === "discounted") {
            op['order'] = Sequelize.literal('(ragular_price - sale_price) desc');
            scopes.push(req.query.filterBy);
        } else if (req.query.sort) {
            scopes.push({ method: ["sortBy", req] })
        } else {
            scopes.push("sortBy")
        }

        let products = await Products.scope(scopes).findAll(op);

        return res.json(products);
    } catch (err) {
        console.log(err.message)
        return res.status(500).json(err)
    }
})

route.get("/relative/:pid", async (req, res) => {
    Products.findByPk(req.params.pid, {
        include: ["categories"],
        attributes: ['id']
    }).then((product) => {
        let productCategories = product.categories.map(c => {
            return c.id
        });

        return Products.findAll({
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
            order: [["id", "asc"]],
            attributes: ["id", [`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"], "slug", "sku", "ragularPrice", "salePrice", "uploadId", "minOrderQuantity"]
        })
    }).then((products) => {
        return res.json(products);
    }).catch((err) => {
        return res.status(500).json(err);
    });
})

route.get("/:slug", async (req, res) => {
    let product = await Products.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ["id", "sku", "slug",
            [`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"],
            [`${req.headers.lang ? req.headers.lang + "_" : ""}short_description`, "shortDescription"],
            [`${req.headers.lang ? req.headers.lang + "_" : ""}long_description`, "longDescription"],
            "metaTitle", "metaDescription", "ragularPrice", "salePrice", "quantity", "manageStock", "minOrderQuantity",
            "maxOrderQuantity", "step", "uploadId", "stockStatus", "currentStockStatus"
        ]
    });

    if (product) {
        let attributes = await product.getAttributes({
            attributes: [[`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"]],
            joinTableAttributes: [[`${req.headers.lang ? req.headers.lang + "_" : ""}attribute_description`, "attributeDescription"]],
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