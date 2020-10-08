const route = require("express").Router();
const { WeightClasses } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {};

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    WeightClasses.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", (req, res, next) => {
    WeightClasses.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", (req, res, next) => {
    WeightClasses.update(req.body, {
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
    WeightClasses.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", (req, res, next) => {
    WeightClasses.destroy({
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