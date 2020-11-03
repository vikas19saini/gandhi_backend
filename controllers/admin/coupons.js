const route = require("express").Router();
const seqConnection = require("../../models/connection");
const { Coupons } = require("../../models/index");

route.get("/", (req, res) => {
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

    Coupons.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", async (req, res) => {
    try {
        const transactionResult = await seqConnection.transaction(async (t) => {
            const coupon = await Coupons.create(req.body, { transaction: t });
            if (req.body.categories) {
                await coupon.addCategories(req.body.categories, { transaction: t });
            }
            if (req.body.users) {
                await coupon.addUsers(req.body.users, { transaction: t });
            }
            return { message: "Created Successfully" };
        });
        res.send(transactionResult).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});


route.patch("/:id", async (req, res) => {
    try {
        const transactionResult = await seqConnection.transaction(async (t) => {
            await Coupons.update(req.body, {
                where: {
                    id: req.params.id
                }
            });
            const coupon = await Coupons.findByPk(req.params.id);
            await coupon.setCategories(req.body.categories ? req.body.categories : [], { transaction: t });
            await coupon.setUsers(req.body.users ? req.body.users : [], { transaction: t });
            return { message: "updated" };
        });
        res.send(transactionResult).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.patch("/status/:id", async (req, res) => {
    try {
        await Coupons.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.send({ message: "Updated" }).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.get("/:id", async (req, res) => {
    try {
        const coupon = await Coupons.findByPk(req.params.id, {
            include: ["categories", "users"]
        });
        res.send(coupon).json();
    } catch (error) {
        res.status(404).send(error).json();
    }
})


route.delete("/:id", async (req, res) => {
    try {
        const coupon = await Coupons.findByPk(req.params.id);
        await coupon.setCategories([]);
        await coupon.setUsers([]);
        await Coupons.destroy({
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