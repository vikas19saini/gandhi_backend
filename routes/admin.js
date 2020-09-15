var admin = require('express').Router();
const users = require("../controllers/admin/users");
const roles = require("../controllers/admin/roles")

admin.use('/users', users);
admin.use("/roles", roles);

module.exports = admin;