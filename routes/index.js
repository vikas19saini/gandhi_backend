var router = require('express').Router();
var admin = require("./admin");
const user = require("../controllers/user")
const { isAuthenticated } = require("../middleware/auth");
const customers = require("../controllers/customers");
const static = require("../controllers/static");
const products = require("../controllers/products")
const categories = require("../controllers/category")
const addresses = require("./../controllers/addresses")
const carts = require("../controllers/carts")
const wishlist = require("../controllers/wishlist")
const orders = require("../controllers/orders")
const payments = require("../controllers/payments");

router.use('/admin', [isAuthenticated], admin);

router.use("/static", static);
router.use('/user', user);
router.use("/customer", customers);
router.use("/products", products);
router.use("/category", categories);
router.use("/address", [isAuthenticated], addresses);
router.use("/wishlist", [isAuthenticated], wishlist);
router.use("/cart", carts);
router.use("/orders", orders);
router.use("/payments", payments);

module.exports = router;
