const route = require("express").Router();
const { GeoZones, Zones, Countries } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {};

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    GeoZones.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", async (req, res, next) => {

    try {
        const geoZone = await GeoZones.create(req.body);
        await geoZone.addZones(req.body.zones);
        res.send(geoZone).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.patch("/:id", async (req, res, next) => {

    try {
        await GeoZones.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        const geoZone = await GeoZones.findByPk(req.params.id);
        await geoZone.setZones(req.body.zones);
        res.send(geoZone).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.get("/:id", (req, res, next) => {
    GeoZones.findByPk(req.params.id, {
        include: [
            {
                model: Zones,
                include: Countries
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
        const geoZone = await GeoZones.findByPk(req.params.id);
        await geoZone.setZones([]);
        await GeoZones.destroy({
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