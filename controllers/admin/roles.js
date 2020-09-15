const roles = require("express").Router();
const Roles = require("../../models/roles");

roles.get("/", (req, res, next) => {
    const roles = Roles.findAll();

    roles.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

roles.post("/", (req, res, next) => {
    const role = Roles.create(req.body);

    role.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

module.exports = roles;