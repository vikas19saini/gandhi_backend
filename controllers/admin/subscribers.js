const route = require("express").Router();
const { Subscribers } = require("../../models/index");

route.get("/", async (req, res) => {
    let params = {

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


    try {
        let subscribers = await Subscribers.findAndCountAll(params);
        return res.json(subscribers);
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/", (req, res, next) => {
    Subscribers.create(req.body).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.patch("/:id", async (req, res) => {
    try {
        Subscribers.update(req.body, {
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
    Subscribers.findOne({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res) => {
    try {
        await Subscribers.destroy({
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