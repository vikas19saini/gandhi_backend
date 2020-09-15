const roles = require("express").Router();
const Menus = require("../../models/menus");
const Roles = require("../../models/roles");

roles.get("/", (req, res, next) => {
    const roles = Roles.findAll({ include: Menus });

    roles.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

roles.post("/", (req, res, next) => {
    const role = Roles.create(req.body, { include: Menus });

    role.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

roles.delete("/:id", (req, res, next) => {
    const role = Roles.destroy({
        where: {
            id: req.params.id
        }
    });

    role.then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

module.exports = roles;