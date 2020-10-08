const zone = require("express").Router();
const { Countries, Zones } = require("../../models/index");

zone.get("/", (req, res, next) => {
    let params = {
        include: Countries
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Zones.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

zone.post("/", (req, res, next) => {
    Zones.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

zone.patch("/:id", (req, res, next) => {
    Zones.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

zone.get("/:id", (req, res, next) => {
    Zones.findByPk(req.params.id, {
        include: Countries
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

zone.delete("/:id", (req, res, next) => {
    Zones.destroy({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

module.exports = zone;