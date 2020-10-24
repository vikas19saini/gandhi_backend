const route = require("express").Router();
const { Filters, FilterValues } = require("../../models/index");
const seqConnection = require("../../models/connection");

route.get("/", async (req, res) => {
    let params = {
        order: [
            ['id', 'desc']
        ]
    };
    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    if (req.query.include) {
        params.include = req.query.include.split(",");
    }

    try {
        const filters = await Filters.findAndCountAll(params);
        res.send(filters).json();
    } catch (error) {
        res.status(500).send(error).json();
    }
});

route.post("/", async (req, res) => {
    try {
        const filter = await Filters.create(req.body, {
            include: [
                {
                    association: "filterValues"
                }
            ]
        });
        res.send(filter).json();
    } catch (error) {
        res.status(500).send(error).json();
    }
});

route.patch("/:id", async (req, res) => {
    try {

        const transactionResult = await seqConnection.transaction(async (t) => {
            const filter = await Filters.update(req.body, {
                where: {
                    id: req.params.id
                }
            }, { transaction: t });

            const filterValues = await FilterValues.findAll({
                where: {
                    filterId: req.params.id
                }
            }, { transaction: t });

            const filterValueIds = filterValues.map(val => val.id);

            for (const filterValueId of filterValueIds) {
                let reqFilterValue = req.body.filterValues.filter(f => f.id === filterValueId);
                if (reqFilterValue.length > 0) {
                    await FilterValues.update(reqFilterValue[0], {
                        where: {
                            id: filterValueId
                        }
                    }, { transaction: t });
                } else {
                    await FilterValues.destroy({
                        where: {
                            id: filterValueId
                        }
                    }, { transaction: t });
                }
            }

            const newFilterValues = req.body.filterValues.filter(val => !val.id);
            for (const saveNewFilter of newFilterValues) {
                await FilterValues.create({ ...saveNewFilter, ...{ filterId: req.params.id } }, { transaction: t });
            }

            return { message: "updated" };
        });

        res.send(transactionResult).json();
    } catch (error) {
        console.log(error);
        res.status(500).send(error).json();
    }
});

route.get("/:id", async (req, res) => {
    try {
        const filter = await Filters.findByPk(req.params.id, {
            include: ["filterValues"]
        });
        res.send(filter).json();
    } catch (error) {
        res.status(404).send(error).json();
    }
})

route.delete("/:id", async (req, res) => {
    try {
        await Filters.destroy({
            where: {
                id: req.params.id
            }
        });
        await FilterValues.destroy({
            where: {
                filterId: req.params.id
            }
        });
        res.send({ message: "deleted" }).json();
    } catch (error) {
        res.status(404).send(error).json();
    }
});

module.exports = route;