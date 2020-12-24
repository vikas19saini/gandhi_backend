const route = require('express').Router();
const { Sliders, Currencies, Filters, FilterValues } = require("../models/index");

route.get("/", async (req, res) => {
    let sliders = await Sliders.findAll({
        where: {
            type: "main_slide",
            status: 1
        },
        include: ['media', 'mobileMedia'],
        order: [["sortOrder", "asc"]]
    })

    res.send({
        title: "Gandhi - Home",
        metaDescription: "Gandhi meta desription",
        sliders: sliders
    }).json();
})

route.get("/filters", (req, res) => {
    Filters.findAll({
        order: [['sortOrder', 'ASC']],
        include: [
            {
                model: FilterValues,
                as: "filterValues",
                required: true,
                order: [['sortOrder', 'ASC']]
            }
        ]
    }).then((data) => {
        res.send(data).json()
    }).catch(err => {
        res.status(500).send(err).json()
    })
})

route.get("/config", (req, res) => {
    Currencies.findAll({
        where: {
            status: 1
        }
    }).then((data) => {
        res.send(data).json()
    }).catch(err => {
        res.status(500).send(err).json()
    })
})

/* route.get("/login", (req, res) => {
    res.send("called").json();
}) */

module.exports = route;