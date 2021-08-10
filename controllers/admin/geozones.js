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
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.post("/", async (req, res, next) => {

    try {
        const geoZone = await GeoZones.create(req.body);
        await geoZone.addZones(req.body.zones);
        return res.json(geoZone);
    } catch (error) {
        return res.status(400).json(error);
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
        return res.json(geoZone);
    } catch (error) {
        return res.status(400).json(error);
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
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
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
        return res.json({ message: "Successfully deleted" });
    } catch (error) {
        return res.status(404).json(err);
    }
});

module.exports = route;