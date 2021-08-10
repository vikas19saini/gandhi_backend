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
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

zone.post("/", (req, res, next) => {
    Zones.create(req.body).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

zone.patch("/:id", (req, res, next) => {
    Zones.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

zone.get("/:id", (req, res, next) => {
    Zones.findByPk(req.params.id, {
        include: Countries
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

zone.delete("/:id", (req, res, next) => {
    Zones.destroy({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        return res.json({ message: "Successfully deleted" });
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

module.exports = zone;