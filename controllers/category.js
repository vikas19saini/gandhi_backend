const route = require('express').Router();
const { Op } = require('sequelize');
const { Categories, Uploads, Products, FilterValues } = require("../models/index");

route.get("/products/:slug", async (req, res) => {
    try {

        let assosiations = [{
            model: Uploads,
            as: "featuredImage",
            attributes: {
                exclude: ["deletedAt", "createdAt", "updatedAt", "name"]
            },
        }, {
            model: FilterValues,
            as: "filters",
            through: { attributes: ["filterValueId", "productId"] },
            attributes: ["id"]
        }];

        let whereConditions = {
            status: 1,
        };

        if (req.params.slug !== "search") {
            assosiations.push({
                model: Categories,
                as: "categories",
                where: { slug: req.params.slug },
                required: true,
                through: { attributes: ["categoryId", "productId"] },
                attributes: ["id"]
            });
        } else {
            whereConditions = {
                [Op.and]: [
                    {
                        status: 1
                    },
                    {
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
                ],
            }
        }

        let queryParams = {
            where: whereConditions,
            order: [["id", "desc"]],
            distinct: true,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            include: assosiations,
            attributes: ["id", "name", "slug", "sku", "ragularPrice", "salePrice", "uploadId", "manageStock", "stockStatus", "currentStockStatus", "minOrderQuantity"]
        };

        if (req.query.start && req.query.end) {
            queryParams.where = { ...queryParams.where, ...{ ragularPrice: { [Op.between]: [parseInt(req.query.start), parseInt(req.query.end)] } } };
        }

        if (req.query.filters) {
            let filters = req.query.filters.split("|");
            filters = filters.map(filter => parseInt(filter));
            queryParams.include[1].where = { id: filters };
        }

        let products = await Products.findAndCountAll(queryParams);
        return res.json(products);
    } catch (err) {
        console.log(err)
        return res.status(400).json(err);
    }
})

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