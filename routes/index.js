var router = require('express').Router();
var admin = require("./admin");

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Admin router
router.use('/admin', admin);

module.exports = router;
