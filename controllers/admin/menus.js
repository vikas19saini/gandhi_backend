const menus = require("express").Router();
const Menus = require("../../models/menus");

menus.get("/", (req, res, next) => {
    const menus = Menus.findAll();

    menus.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

menus.post("/", (req, res, next) => {
    const menu = Menus.create(req.body);

    menu.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

menus.delete("/:id", (req, res, next) => {
    const menu = Menus.destroy({
        where: {
            id: req.params.id
        }
    });

    menu.then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

module.exports = menus;