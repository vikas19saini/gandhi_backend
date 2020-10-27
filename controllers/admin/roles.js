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
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

roles.get("/:id", (req, res, next) => {
    const user = Roles.findByPk(req.params.id, {
        include: Menus
    });
    user.then((data) => {
        res.send(data).json();
    }).catch(error => {
        res.status(400).send(error).json();
    });
});

roles.post("/", (req, res, next) => {
    const role = Roles.create(req.body);

    role.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

roles.patch("/:id", (req, res, next) => {
    const role = Roles.update(req.body, {
        where: {
            id: req.params.id
        }
    });

    role.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

roles.patch("/menu/:id", (req, res, next) => {
    const updateMenu = async () => {
        const role = await Roles.findByPk(req.params.id);
        role.addMenus(req.body.menu_id, { through: req.body.permissions });
        return role;
    }

    updateMenu().then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

/*roles.delete("/:id", (req, res, next) => {
   const deleteRole = async () => {

        const role = await Roles.findByPk(req.params.id);
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

   deleteRole().then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});
*/


roles.delete("/:id", (req, res, next) => {
    const deleteRole = async () => {
        const role = await Roles.findByPk(req.params.id);
        if(role.dataValues.name === 'Admin'){
            res.send({ status:404,message: "Do not deleted" }).json();
        }else{
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
         res.send({ message: "Successfully deleted" }).json();
     }).catch((error) => {
         res.status(400).send(error).json();
     })
 });

module.exports = roles;