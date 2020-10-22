const route = require("express").Router();
const { Coupons } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {
        order: [
            ['id', 'desc']
        ]
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Coupons.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", (req, res, next) => {
    Coupons.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", (req, res, next) => {
    Coupons.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.get("/:id", (req, res, next) => {
    Coupons.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", (req, res, next) => {
    Coupons.destroy({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

module.exports = route;