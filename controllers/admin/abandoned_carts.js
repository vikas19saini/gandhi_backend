const { Carts } = require("../../models");
const route = require("express").Router();

route.get("/", (req, res) => {
    let params = {
        order: [
            ['updatedAt', 'desc']
        ],
        rejectOnEmpty: true,
        include: ["user"]
    };
    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Carts.scope('abandoned').findAndCountAll(params).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        console.log(err);
        return res.status(404).json({ message: err.message });
    });
});

module.exports = route;