const route = require("express").Router();
const { Sliders, Uploads } = require("../../models/index");

route.get("/", async (req, res) => {
    console.log(req.query.type, "req")
    let params = {
        include: [
            {
                model: Uploads,
                as: "media"
            },
            {
                model: Uploads,
                as: "mobileMedia"
            }
        ],
        order: [
            ['id', 'desc']
        ],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    if (req.query.type) {
        params.where = { 'type': req.query.type };
        params.order = [['sort_order', 'desc']]

    }
    try {
        let sliders = await Sliders.findAndCountAll(params);
        return res.json(sliders);
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/", (req, res, next) => {
    Sliders.create(req.body).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.patch("/:id", async (req, res) => {
    try {
        Sliders.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        return res.json({ message: "Updated Successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

route.get("/:id", (req, res) => {
    Sliders.findOne({
        where: {
            id: req.params.id
        },
        include: [

            {
                model: Uploads,
                as: "media"
            },
            {
                model: Uploads,
                as: "mobileMedia"
            }]
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res) => {
    try {
        await Sliders.destroy({
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