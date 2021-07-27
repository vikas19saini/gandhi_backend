const route = require('express').Router();
const { login } = require("./components/auth");

route.post("/login", (req, res) => {
    const auth = login(req.body.email, req.body.password);
    auth.then((data) => {
        if (data.status) {
            return res.json(data)
        } else {
            return res.status(401).json({ ...data })
        }

    })
})

module.exports = route;