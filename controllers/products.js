const route = require('express').Router();
const { Products, Categories } = require("../models/index");

route.get("/new", async (req, res) => {
    try {
        let products = await Products.findAll({
            where: {
                status: 1
            },
            order: [["id", "desc"]],
            include: ['featuredImage'],
            limit: 30
        })

        res.send(products).json()
    } catch (err) {
        res.status(500).send(err).json()
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
                attributes: ['id']
            }, "featuredImage"],
            distinct: true,
            limit: 21
        })

        res.send(products).json()
    } catch (err) {
        res.status(500).send(err).json()
    }
})

route.get("/:slug", async (req, res) => {
    let product = await Products.findOne({
        where: {
            slug: req.params.slug
        },
        include: ["categories", "filters", "thumbnails", "attributes", "featuredImage", "taxClass", "lengthClass", "weightClass"]
    });

    if (product) {
        res.send(product).json();
    } else {
        res.status(404).send({ message: "No Data Found" }).json()
    }
})

module.exports = route;