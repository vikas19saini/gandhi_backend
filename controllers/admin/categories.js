const route = require("express").Router();
const { Categories, Uploads, Products } = require("../../models/index");

route.get("/", async (req, res) => {
    let params = {
        include: [
            {
                model: Uploads,
                as: "media"
            },
            {
                model: Uploads,
                as: "mobileMedia"
            },
            {
                model: Categories,
                as: "ancestors"
            }
        ],
        order: [
            [
                {
                    model: Categories,
                    as: 'ancestors',
                },
                'hierarchy_level'
            ]
        ],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    try {
        let categories = await Categories.findAndCountAll(params);

        res.send(categories).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", (req, res, next) => {
    Categories.create(req.body).then((data) => {
        Categories.rebuildHierarchy();
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", async (req, res) => {
    try {
        Categories.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        await Categories.rebuildHierarchy();
        res.send({ message: "Updated Successfully" }).json();
    } catch (err) {
        res.status(500).send(err).json();
    }
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
            model: Categories,
            as: 'parent',
        },
        {
            model: Uploads,
            as: "media"
        },
        {
            model: Uploads,
            as: "mobileMedia"
        },
        {
            model: Categories,
            as: "ancestors"
        }],
        order: [
            [
                {
                    model: Categories,
                    as: 'ancestors',
                },
                'hierarchy_level'
            ]
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
        res.send({ message: "Successfully deleted" }).json();
    } catch (err) {
        res.status(404).send(err).json();
    }
});

module.exports = route;