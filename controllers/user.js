const route = require('express').Router();
const { login } = require("./components/auth");

route.post("/login", (req, res) => {
    const auth = login(req.body.email, req.body.password);
    auth.then((data) => {
        if (data.status) {
            res.send(data).json();
        } else {
            res.status(401).send({ ...data, ...{ statusCode: 1100 } }).json();
        }

    })
})

route.get("/login", (req, res) => {
    res.send("called").json();
})

module.exports = route;