const route = require("express").Router();
const { TaxClasses, Taxes } = require("../../models/index");

route.get("/", (req, res, next) => {
    let params = {};

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    TaxClasses.findAndCountAll(params).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.post("/", async (req, res, next) => {

    try {
        const taxClass = await TaxClasses.create(req.body);
        req.body.taxes.forEach((t) => {
            taxClass.addTaxes([t.id], { through: { priority: t.priority } })
        })
        return res.json(taxClass);
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.patch("/:id", async (req, res, next) => {

    try {
        await TaxClasses.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        const taxClass = await TaxClasses.findByPk(req.params.id);

        //Delete reationship before creating new
        await taxClass.setTaxes([]);

        // Create reationship
        req.body.taxes.forEach((t) => {
            taxClass.addTaxes([t.id], { through: { priority: t.priority } })
        })
        return res.json(taxClass);
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.get("/:id", (req, res, next) => {
    TaxClasses.findByPk(req.params.id, { include: Taxes }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res, next) => {
    try {
        await TaxClasses.destroy({
            where: {
                id: req.params.id
            }
        })
        return res.json({ message: "Succcessfully deleted" });
    } catch (err) {
        return res.status(404).json(err);
    }
});

module.exports = route;