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
                as: "subCategory"
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

        return res.json(categories);
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/", (req, res, next) => {
    Categories.create(req.body).then((data) => {
        Categories.rebuildHierarchy();
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
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
        return res.json({ message: "Updated Successfully" });
    } catch (err) {
        return res.status(500).json(err);
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
            as: "icon"
        },
        {
            model: Uploads,
            as: "subCategory"
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
        return res.json(data);
    }).catch((err) => {
        console.log(err)
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res, next) => {
    try {
        await Categories.destroy({
            where: {
                id: req.params.id
            }
        })
        return res.json({ message: "Successfully deleted" });
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = route;