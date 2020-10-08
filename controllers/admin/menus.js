const menus = require("express").Router();
const { Menus } = require("../../models/index");

menus.get("/", (req, res, next) => {
    const menus = Menus.findAll();

    menus.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

module.exports = menus;