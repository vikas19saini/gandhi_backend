const route = require('express').Router();
const { Categories, Uploads, Products, FilterValues } = require("../models/index");
const Op = require("sequelize");
const { where } = require('sequelize');

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

        console.log(filters)

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
        res.send(products).json();
    } catch (err) {
        console.log(err)
        res.status(400).send(err).json();
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
                    as: "mobileMedia"
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
                            as: "mobileMedia"
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

        res.send(category).json()
    } catch (err) {
        console.log(err)
        res.status(404).send(err).json()
    }
})



module.exports = route;