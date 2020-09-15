var admin = require('express').Router();
const users = require("../controllers/admin/users");
const roles = require("../controllers/admin/roles")
const menus = require('../controllers/admin/menus');

admin.use('/users', users);
admin.use("/roles", roles);
admin.use("/menus", menus);

module.exports = admin;