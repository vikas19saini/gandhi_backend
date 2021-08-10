const route = require("express").Router();
const { Currencies } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {};

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    const curr = Currencies.findAndCountAll(params);

    curr.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

route.post("/", (req, res, next) => {
    const curr = Currencies.create(req.body);
    curr.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

route.patch("/:id", (req, res, next) => {
    const curr = Currencies.update(req.body, {
        where: {
            id: req.params.id
        }
    });
    curr.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

route.delete("/:id", (req, res, next) => {
    const curr = Currencies.destroy({
        where: {
            id: req.params.id
        }
    });
    curr.then((d) => {
        return res.json({ message: "Successfully deleted" });
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

route.get("/:id", (req, res, next) => {
    const curr = Currencies.findByPk(req.params.id);
    curr.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(404).json(error);
    })
});

module.exports = route;