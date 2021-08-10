const roles = require("express").Router();
const { Menus, Roles } = require("../../models/index");

roles.get("/", (req, res, next) => {
    let params = {};

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    const roles = Roles.findAndCountAll(params);

    roles.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

roles.get("/:id", (req, res, next) => {
    const user = Roles.findByPk(req.params.id, {
        include: Menus
    });
    user.then((data) => {
        return res.json(data);
    }).catch(error => {
        return res.status(400).json(error);
    });
});

roles.post("/", (req, res, next) => {
    const role = Roles.create(req.body);

    role.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

roles.patch("/:id", (req, res, next) => {
    const role = Roles.update(req.body, {
        where: {
            id: req.params.id
        }
    });

    role.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

roles.patch("/menu/:id", (req, res, next) => {
    const updateMenu = async () => {
        const role = await Roles.findByPk(req.params.id);
        role.addMenus(req.body.menu_id, { through: req.body.permissions });
        return role;
    }

    updateMenu().then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});


roles.delete("/:id", (req, res, next) => {
    const deleteRole = async () => {
        const role = await Roles.findByPk(req.params.id);
        if (role.dataValues.name === 'Admin') {
            return res.json({ status: 404, message: "Do not deleted" });
        } else {
            // Deleting relationship from roles_menus table
            role.setMenus([]);
            role.setUsers([]);
            // Deleting roles from role table
            Roles.destroy({
                where: {
                    id: req.params.id
                }
            });
        }
    }

    deleteRole().then((data) => {
        return res.json({ message: "Successfully deleted" });
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

module.exports = roles;