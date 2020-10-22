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
    try {
        const attributes = await Attributes.findAndCountAll(params);
        res.send(attributes).json();
    } catch (error) {
        res.status(500).send(error).json();
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
        res.send(attribute).json();
    } catch (error) {
        res.status(500).send(error).json();
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

        res.send(transactionResult).json();
    } catch (error) {
        console.log(error);
        res.status(500).send(error).json();
    }
});

route.get("/:id", async (req, res) => {
    try {
        const arrtibute = await Attributes.findByPk(req.params.id, {
            include: ["attributeValues"]
        });
        res.send(arrtibute).json();
    } catch (error) {
        res.status(404).send(error).json();
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
        res.send({ message: "deleted" }).json();
    } catch (error) {
        res.status(404).send(error).json();
    }
});

module.exports = route;