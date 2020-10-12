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
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", async (req, res, next) => {

    try {
        const taxClass = await TaxClasses.create(req.body);
        req.body.taxes.forEach((t) => {
            taxClass.addTaxes([t.id], { through: { priority: t.priority } })
        })
        res.send(taxClass).json();
    } catch (err) {
        res.status(400).send(err).json();
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
        res.send(taxClass).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.get("/:id", (req, res, next) => {
    TaxClasses.findByPk(req.params.id, { include: Taxes }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res, next) => {
    try {
        await TaxClasses.destroy({
            where: {
                id: req.params.id
            }
        })
        res.send({ message: "Succcessfully deleted" }).json();
    } catch (err) {
        res.status(404).send(err).json();
    }
});

module.exports = route;