const route = require('express').Router();
const { Sliders, Currencies, Filters, FilterValues, Countries } = require("../models/index");

route.get("/", async (req, res) => {
    let sliders = await Sliders.findAll({
        where: {
            type: "main_slider",
            status: 1
        },
        include: ['media', 'mobileMedia'],
        order: [["sortOrder", "asc"]]
    })

    return res.json({
        title: "Gandhi Fabrics: Buy complete range of Fabrics Online",
        metaDescription: "Get a complete range of Cotton, Lace, Linen, Silk, Wool, Lace, Traditional, Embroidery, Natural, Printed fabrics. Visit our official website to buy fabrics online from Gandhi Fabrics.",
        sliders: sliders
    })
})

route.get("/filters", (req, res) => {
    Filters.findAll({
        order: [['sortOrder', 'ASC']],
        attributes: ["id", [`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"]],
        include: [
            {
                model: FilterValues,
                as: "filterValues",
                required: true,
                attributes: ["id", [`${req.headers.lang ? req.headers.lang + "_" : ""}name`, "name"]],
                order: [['sortOrder', 'ASC']]
            }
        ],
        req
    }).then((data) => {
        return res.json(data)
    }).catch(err => {
        console.error(err)
        return res.status(400).json(err)
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
        return res.status(400).json(err)
    })
})

route.get("/countries", (req, res) => {
    Countries.findAll({
        attributes: ["id", "name"],
        include: ["zones"]
    }).then(data => {
        return res.json(data)
    }).catch(err => {
        return res.status(400).json(err);
    })
})

module.exports = route;