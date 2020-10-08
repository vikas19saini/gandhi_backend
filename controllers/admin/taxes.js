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
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", async (req, res, next) => {

    try {
        const tax = await Taxes.create(req.body);
        res.send(tax).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.patch("/:id", async (req, res, next) => {

    try {
        const tax = await Taxes.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.send(tax).json();
    } catch (error) {
        res.status(400).send(error).json();
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
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res, next) => {

    try {
        await Taxes.destroy({
            where: {
                id: req.params.id
            }
        });
        res.send({ message: "Successfully deleted" }).json();
    } catch (error) {
        res.status(404).send(err).json();
    }
});

module.exports = route;