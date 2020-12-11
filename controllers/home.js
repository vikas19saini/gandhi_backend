const route = require('express').Router();
const { Sliders, Products } = require("../models/index");

route.get("/", async (req, res) => {
    let sliders = await Sliders.findAll({
        where: {
            type: "main_slide",
            status: 1
        },
        include: ['media', 'mobileMedia'],
        order: [["sortOrder", "asc"]]
    })

    let products = await Products.findAll({
        where: {
            status: 1
        },
        order: [["id", "desc"]],
        include: ['featuredImage'],
        limit: 30
    })

    res.send({
        title: "Gandhi - Home",
        sliders: sliders,
        products: products
    }).json();
})

route.get("/login", (req, res) => {
    res.send("called").json();
})

module.exports = route;