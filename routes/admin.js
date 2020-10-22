var admin = require('express').Router();
const users = require("../controllers/admin/users");
const roles = require("../controllers/admin/roles")
const menus = require('../controllers/admin/menus');
const countries = require("../controllers/admin/countries");
const zones = require("../controllers/admin/zones");
const currencies = require("../controllers/admin/currencies");
const geozones = require("../controllers/admin/geozones");
const taxes = require("../controllers/admin/taxes");
const taxClasses = require("../controllers/admin/tax_classes");
const lengthClasses = require("../controllers/admin/length_classes");
const weightClasses = require("../controllers/admin/weight_classes");
const uploads = require("../controllers/admin/uploads");
const categories = require("../controllers/admin/categories");
const filters = require("../controllers/admin/filters");
const attributes = require("../controllers/admin/attributes");

const coupons = require("../controllers/admin/coupons");

admin.use('/users', users);
admin.use("/roles", roles);
admin.use("/menus", menus);
admin.use("/countries", countries);
admin.use("/zones", zones);
admin.use("/currencies", currencies);
admin.use("/geozones", geozones);
admin.use("/taxes", taxes);
admin.use("/tax-classes", taxClasses);
admin.use("/length-classes", lengthClasses);
admin.use("/weight-classes", weightClasses);
admin.use("/uploads", uploads);
admin.use("/categories", categories);
admin.use("/filters", filters);
admin.use("/attributes", attributes);

admin.use("/coupons", coupons);


module.exports = admin;