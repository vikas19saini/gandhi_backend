var users = require('express').Router();
const { Users, Roles, Menus } = require("../../models/index");
const jwt = require("jsonwebtoken");
const config = require("config");

users.get('/', (req, res, next) => {
    let params = {
        include: Roles
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }
    const users = Users.findAndCountAll(params);
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

    const saveUser = async () => {
        const user = await Users.create(req.body);
        await user.addRoles(req.body.roles);
        return user;
    }

    saveUser().then((response) => {
        res.send(response).json();
    }).catch(error => {
        res.status(400).send(error).json();
    });
})

users.get("/:id", (req, res, next) => {
    const user = Users.findByPk(req.params.id, {
        include: [
            {
                model: Roles,
                include: Menus
            }
        ]
    });
    user.then((data) => {
        res.send(data).json();
    }).catch(error => {
        res.status(400).send(error).json();
    });
});

users.delete("/:id", (req, res, next) => {

    const deleteUser = async () => {
        const user = await Users.findByPk(req.params.id);
        await user.setRoles([]);

        return await Users.destroy({
            where: {
                id: req.params.id
            }
        });
    }

    deleteUser().then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.send(error).json();
    })
});

users.patch("/:id", (req, res, next) => {

    const saveUser = async () => {
        await Users.update(req.body, {
            where: {
                id: req.params.id
            }
        });

        const user = await Users.findByPk(req.params.id);
        await user.setRoles(req.body.roles);
        return user;
    }

    saveUser().then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

module.exports = users;