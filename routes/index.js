var router = require('express').Router();
var admin = require("./admin");
const user = require("../controllers/user")
const { isLoggedIn } = require("../middleware/auth");
const customers = require("../controllers/customers")
const products = require("../controllers/products")
const categories = require("../controllers/categories")




router.use("/", (req, res, next) => {
  if (req.originalUrl.includes("admin")) {
    /*if (!isLoggedIn(req.headers['authorization'])) {
      res.status(401).send({ message: "Please login to access" }).json();
    }*/
  }

  router.use('/user', user);
  router.use('/admin', admin);
  router.use("/customers", customers);
  router.use("/products", products);
  router.use("/categories", categories);



  next();
})

module.exports = router;
