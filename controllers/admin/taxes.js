const route = require("express").Router();
const { Taxes, GeoZones } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {
        include: GeoZones
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Taxes.findAndCountAll(params).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.post("/", async (req, res, next) => {

    try {
        const tax = await Taxes.create(req.body);
        return res.json(tax);
    } catch (error) {
        return res.status(400).json(error);
    }
});

route.patch("/:id", async (req, res, next) => {

    try {
        const tax = await Taxes.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        return res.json(tax);
    } catch (error) {
        return res.status(400).json(error);
    }
});

route.get("/:id", (req, res, next) => {
    Taxes.findByPk(req.params.id, {
        include: [
            {
                model: GeoZones,
            }
        ]
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res, next) => {

    try {
        await Taxes.destroy({
            where: {
                id: req.params.id
            }
        });
        return res.json({ message: "Successfully deleted" });
    } catch (error) {
        return res.status(404).json(err);
    }
});

module.exports = route;