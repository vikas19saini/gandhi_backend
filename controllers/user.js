const route = require('express').Router();
const { login } = require("./components/auth");

route.get("/", (req, res) => {
    res.send("eelo").json();
})

route.post("/login", (req, res) => {
    const auth = login(req.body.email, req.body.password);
    auth.then((data) => {
        res.send(data).json();
    })
})

module.exports = route;