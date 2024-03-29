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
const products = require("../controllers/admin/products");
const sliders = require("../controllers/admin/sliders");
const imports = require("../controllers/admin/imports");
const subscribers = require("../controllers/admin/subscribers");
const enquiries = require("../controllers/admin/enquiries");
const emailSmsTemplates = require("../controllers/admin/email_sms_templates");
const settings = require("../controllers/admin/settings");
const orders = require("../controllers/admin/orders");
const shipments = require("../controllers/admin/shipments");
const dashboard = require("../controllers/admin/dashboards");
const abondedCarts = require("../controllers/admin/abandoned_carts");

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
admin.use("/products", products);
admin.use("/filters", filters);
admin.use("/attributes", attributes);
admin.use("/coupons", coupons);
admin.use("/sliders", sliders);
admin.use("/imports", imports);
admin.use("/subscribers", subscribers);
admin.use("/enquiries", enquiries);
admin.use("/email-sms-templates", emailSmsTemplates);
admin.use("/settings", settings);
admin.use("/orders", orders);
admin.use("/shipments", shipments);
admin.use("/dashboards", dashboard);
admin.use("/abondedCarts", abondedCarts);

module.exports = admin;