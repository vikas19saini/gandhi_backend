const route = require('express').Router();
const { Categories, Uploads, Products } = require("../models/index");

route.get("/products/:slug", async (req, res) => {

    try {

        let filters = [], price = {}

        for (const [key, val] of Object.entries(req.query)) {
            if (key === "startPrice" || key === "endPrice") {
                price[key] = val
            } else if (key === "limit" || key === "offset") {
            } else {
                filters.push({
                    id: parseInt(val)
                })
            }
        }

        let products = await Products.findAndCountAll({
            where: {
                status: 1,
            },
            order: [["id", "desc"]],
            distinct: true,
            limit: parseInt(req.query.limit),
            offset: parseInt(req.query.offset),
            include: [{
                model: Categories,
                as: "categories",
                where: { slug: req.params.slug },
                required: true,
                attributes: ["id"]
            }, {
                model: Uploads,
                as: "featuredImage"
            }, /* {
                model: FilterValues,
                as: "filters",
                required: true,
                attributes: ["id"],
                where: {
                    [Op.and]: filters
                }
            } */]
        });
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
        console.log(err);
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