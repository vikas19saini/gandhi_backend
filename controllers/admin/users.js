var users = require('express').Router();
const { Users, Roles, Menus } = require("../../models/index");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');
const passwordHash = require("password-hash");

users.get('/', (req, res) => {
    let params = {
        //include: Roles
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    if (req.query.search) {
        params.where = {
            [Op.or]: [
                {
                    email: {
                        [Op.like]: `%${req.query.search}%`
                    }
                },
                {
                    phone: {
                        [Op.like]: `%${req.query.search}%`
                    }
                },
                {
                    name: {
                        [Op.like]: `%${req.query.search}%`
                    }
                }
            ]
        }
    }

    params.order = [["id", "desc"]];

    const users = Users.findAndCountAll(params);
    users.then((response) => {
        return res.json(response);
    }).catch(error => {
        return res.status(400).json(error);
    });
});

users.post("/", (req, res) => {

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: "Passwords doesn't match, please try again!" });
    }

    // Generating access token
    var token = jwt.sign({ username: req.body.email }, process.env.TOKEN, { expiresIn: "7200s" });
    req.body.token = token;

    const saveUser = async () => {
        const user = await Users.create(req.body);
        await user.addRoles(req.body.roles);
        return user;
    }

    saveUser().then((response) => {
        return res.json(response);
    }).catch(error => {
        return res.status(400).json(error);
    });
})

users.patch("/reset-pasword", async (req, res) => {
    try {
        const user = await Users.findByPk(req.body.userId, { raw: true })

        if (!user) return res.status(404).json({ message: "User not found!" });

        if (!passwordHash.verify(req.body.password, user.password)) {
            return res.status(500).json({ message: "Incorrect current password!" });
        }

        await Users.update({ password: req.body.newPassword }, { where: { id: req.body.userId } })
        return res.json({ message: "Successfully deleted" });
    } catch (err) {
        return res.status(500).json(err);
    }
})

users.get("/:id", (req, res) => {
    const user = Users.findByPk(req.params.id, {
        include: [
            {
                model: Roles,
                include: Menus
            }
        ]
    });
    user.then((data) => {
        return res.json(data);
    }).catch(error => {
        return res.status(400).json(error);
    });
});

users.delete("/:id", (req, res) => {

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
        return res.json({ message: "Successfully deleted" });
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

users.patch("/:id", (req, res) => {

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
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

module.exports = users;