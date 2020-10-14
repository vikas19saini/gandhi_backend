const route = require("express").Router();
const { Categories, Uploads } = require("../../models/index");

route.get("/", (req, res) => {
    let params = {
        hierarchy: true,
        include: [
            {
                model: Uploads,
                as: "media"
            },
            {
                model: Uploads,
                as: "mobileMedia"
            }
        ]
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Categories.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", (req, res, next) => {
    Categories.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", (req, res, next) => {
    Categories.update(req.body, {
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
    Categories.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Categories,
            as: 'descendents',
            hierarchy: true
        },
        {
            model: Uploads,
            as: "media"
        },
        {
            model: Uploads,
            as: "mobileMedia"
        }
        ]
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res, next) => {
    try {
        await Categories.destroy({
            where: {
                id: req.params.id
            }
        })
        await Categories.rebuildHierarchy();
    } catch (err) {
        res.status(404).send(err).json();
    }
});

module.exports = route;