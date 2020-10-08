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
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

route.post("/", (req, res, next) => {
    const curr = Currencies.create(req.body);
    curr.then((data) => {
        res.send(data), json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

route.patch("/:id", (req, res, next) => {
    const curr = Currencies.update(req.body, {
        where: {
            id: req.params.id
        }
    });
    curr.then((data) => {
        res.send(data), json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

route.delete("/:id", (req, res, next) => {
    const curr = Currencies.destroy({
        where: {
            id: req.params.id
        }
    });
    curr.then((d) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

route.get("/:id", (req, res, next) => {
    const curr = Currencies.findByPk(req.params.id);
    curr.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(404).send(error).json();
    })
});

module.exports = route;