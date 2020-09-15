var users = require('express').Router();
const Users = require("../../models/users");
const jwt = require("jsonwebtoken");
const config = require("config");

users.get('/', (req, res, next) => {
    const users = Users.findAll();
    users.then((response) => {
        res.send(response).json();
    }).catch(error => {
        res.status(400).send(error).json();
    });
});

users.post("/", (req, res, next) => {

    if (req.body.password !== req.body.confirmPassword) {
        res.status(400).send({ message: "Passwords doesn't match, please try again!" }).json();
    }

    // Generating access token
    var token = jwt.sign({ username: req.body.email }, config.get("token_secret"), { expiresIn: "7200s" });
    req.body.token = token;

    const user = Users.create(req.body);
    user.then((response) => {
        res.send(response).json();
    }).catch(error => {
        res.status(400).send(error).json();
    });
})

users.get("/:id", (req, res, next) => {
    const user = Users.findByPk(req.params.id);
    user.then((data) => {
        res.send(data).json();
    }).catch(error => {
        res.status(400).send(error).json();
    });
});

users.delete("/:id", (req, res, next) => {
    const user = Users.destroy({
        where: {
            id: req.params.id
        }
    });

    user.then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.send(error).json();
    })
});

users.patch("/:id", (req, res, next) => {
    const user = Users.update(req.body, {
        where: {
            id: req.params.id
        }
    });

    user.then((data) => {
        res.send({ message: "Successfully updated" }).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

module.exports = users;