const route = require("express").Router();
const { Attributes, AttributeValues } = require("../../models/index");
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
        const attributes = await Attributes.findAndCountAll(params);
        return res.json(attributes);
    } catch (error) {
        return res.status(500).json(error);
    }
});

route.post("/", async (req, res) => {
    try {
        const attribute = await Attributes.create(req.body, {
            include: [
                {
                    association: "attributeValues"
                }
            ]
        });
        return res.json(attribute);
    } catch (error) {
        return res.status(500).json(error);
    }
});

route.patch("/:id", async (req, res) => {
    try {

        const transactionResult = await seqConnection.transaction(async (t) => {
            const attribute = await Attributes.update(req.body, {
                where: {
                    id: req.params.id
                }
            }, { transaction: t });

            const attributeValues = await AttributeValues.findAll({
                where: {
                    attributeId: req.params.id
                }
            }, { transaction: t });

            const attributeValueIds = attributeValues.map(val => val.id);

            for (const attributeValueId of attributeValueIds) {
                let reqAttributeValue = req.body.attributeValues.filter(f => f.id === attributeValueId);
                if (reqAttributeValue.length > 0) {
                    await AttributeValues.update(reqAttributeValue[0], {
                        where: {
                            id: attributeValueId
                        }
                    }, { transaction: t });
                } else {
                    await AttributeValues.destroy({
                        where: {
                            id: attributeValueId
                        }
                    }, { transaction: t });
                }
            }

            const newAttributeValues = req.body.attributeValues.filter(val => !val.id);
            for (const saveNewAttribute of newAttributeValues) {
                await AttributeValues.create({ ...saveNewAttribute, ...{ attributeId: req.params.id } }, { transaction: t });
            }

            return { message: "updated" };
        });

        return res.json(transactionResult)
    } catch (error) {
        return res.status(500).json(error);
    }
});

route.get("/:id", async (req, res) => {
    try {
        const arrtibute = await Attributes.findByPk(req.params.id, {
            include: ["attributeValues"]
        });
        return res.json(arrtibute);
    } catch (error) {
        return res.status(404).json(error);
    }
})

route.delete("/:id", async (req, res) => {
    try {
        await Attributes.destroy({
            where: {
                id: req.params.id
            }
        });
        await AttributeValues.destroy({
            where: {
                attributeId: req.params.id
            }
        });
        return res.json({ message: "deleted" });
    } catch (error) {
        return res.status(404).json(error);
    }
});

module.exports = route;