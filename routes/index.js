var router = require('express').Router();
var admin = require("./admin");
const user = require("../controllers/user")
const { isLoggedIn } = require("../middleware/auth");
const customers = require("../controllers/customers");
const static = require("../controllers/static");
const products = require("../controllers/products")
const categories = require("../controllers/category")

router.use("/", (req, res, next) => {
  if (req.originalUrl.includes("admin")) {
    if (!isLoggedIn(req.headers['authorization'])) {
      res.status(401).send({ message: "Please login to access" }).json();
    }
  }

  router.use("/static", static);
  router.use('/user', user);
  router.use("/customer", customers);
  router.use("/products", products);
  router.use("/category", categories);
  router.use('/admin', admin);

  next();
})

module.exports = router;
