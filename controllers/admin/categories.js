const route = require("express").Router();
const { Op } = require("sequelize");
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
            },
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
        distinct: true,
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    if (req.query.searchBy) {
        params.where = {
            name: {
                [Op.substring]: req.query.searchBy
            }
        }
    }

    try {
        let totalRecords = await Categories.count(params);
        let categories = await Categories.findAll(params);
        let finalCategories = [];

        for (let category of categories) {
            let catProducts = await category.countProducts({
                distinct: true
            });

            category = category.toJSON();
            finalCategories.push({
                ...category, ...{ totalProducts: catProducts }
            })
        }

        return res.json({
            count: totalRecords,
            rows: finalCategories
        });
    } catch (err) {
        console.log(err);
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
        await Categories.update(req.body, {
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