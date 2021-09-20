const route = require('express').Router();
const { Op } = require('sequelize');
const { Categories, Uploads, Products } = require("../models/index");
const { count } = require('../models/users');

route.get("/products/:slug", async (req, res) => {
    try {

        let scopes = ["active", "withImage", { method: ["sortBy", req] }];

        if (req.query.filters) {
            scopes.push({ method: ["withFilters", req] });
        }

        if (req.query.start && req.query.end) {
            scopes.push({ method: ["priceFilter", req] });
        }

        let queryParams = {
            distinct: true,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            attributes: ["id", "createdAt", "name", "slug", "sku", "ragularPrice", "salePrice", "uploadId", "manageStock", "stockStatus", "currentStockStatus", "minOrderQuantity"]
        };

        let category = null;
        let count = null;
        let products = null;

        if (req.params.slug === "search") {
            scopes.push({ method: ["withSearch", req] });
            count = await Products.scope(scopes).count();
            products = await Products.scope(scopes).findAll(queryParams);
        } else if (req.params.slug === "sale") {
            scopes.push("discounted");
            count = await Products.scope(scopes).count();
            products = await Products.scope(scopes).findAll(queryParams);
        } else {
            category = await Categories.findOne({
                where: {
                    slug: req.params.slug
                },
                rejectOnEmpty: true
            });

            count = await category.countProducts({
                scopes: scopes,
            });

            queryParams.scope = scopes;
            products = await category.getProducts(queryParams);
        }

        return res.json({
            count: count,
            rows: products,
            category: category
        });
    } catch (err) {
        console.log(err)
        return res.status(400).json(err);
    }
});

route.get("/:slug", async (req, res) => {
    try {
        let category = await Categories.findOne({
            where: {
                slug: req.params.slug
            },
            include: [
                {
                    model: Uploads,
                    as: "media"
                },
                {
                    model: Uploads,
                    as: "subCategory"
                },
                {
                    model: Categories,
                    as: "descendents",
                    include: [
                        {
                            model: Uploads,
                            as: "media"
                        },
                        {
                            model: Uploads,
                            as: "subCategory"
                        },
                        {
                            model: Products,
                            as: "products",
                            required: false,
                            where: { status: 1 },
                            attributes: ["id"],
                        }
                    ]
                }
            ]
        });

        return res.json(category);
    } catch (err) {
        return res.status(404).json(err);
    }
});

route.get("/", async (req, res) => {
    let params = {
        include: [
            {
                model: Uploads,
                as: "subCategory"
            },
            {
                model: Uploads,
                as: "icon"
            }
        ],
        distinct: true,
        hierarchy: true
    };

    try {
        let categories = await Categories.findAndCountAll(params);
        return res.json(categories);
    } catch (err) {
        return res.status(400).json(err);
    }
})

module.exports = route;