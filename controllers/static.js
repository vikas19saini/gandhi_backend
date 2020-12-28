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

    return res.json({
        title: "Gandhi - Home",
        metaDescription: "Gandhi meta desription",
        sliders: sliders
    })
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
        return res.json(data)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

route.get("/config", (req, res) => {
    Currencies.findAll({
        where: {
            status: 1
        }
    }).then((data) => {
        return res.json(data)
    }).catch(err => {
        return res.status(500).json(err)
    })
})

module.exports = route;