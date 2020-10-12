var router = require('express').Router();
var admin = require("./admin");
const user = require("../controllers/user")
const { isLoggedIn } = require("../middleware/auth");


router.use("/", (req, res, next) => {
  if (req.originalUrl.includes("admin")) {
    if (!isLoggedIn(req.headers['authorization'])) {
      res.status(401).send({ message: "Please login to access" }).json();
    }
  }

  router.use('/user', user);
  router.use('/admin', admin);
  next();
})

module.exports = router;
