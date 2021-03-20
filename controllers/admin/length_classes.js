const route = require("express").Router();
const { LengthClasses } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {};

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    LengthClasses.findAndCountAll(params).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.post("/", (req, res, next) => {
    LengthClasses.create(req.body).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.patch("/:id", (req, res, next) => {
    LengthClasses.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.get("/:id", (req, res, next) => {
    LengthClasses.findByPk(req.params.id).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", (req, res, next) => {
    LengthClasses.destroy({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        return res.json({ message: "Successfully deleted" });
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

module.exports = route;