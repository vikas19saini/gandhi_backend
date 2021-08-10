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
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
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
        return res.json(transactionResult);
    } catch (error) {
        return res.status(400).json(error);
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
        return res.json(transactionResult);
    } catch (error) {
        return res.status(400).json(error);
    }
});

route.patch("/status/:id", async (req, res) => {
    try {
        await Coupons.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        return res.json({ message: "Updated" });
    } catch (error) {
        return res.status(400).json(error);
    }
});

route.get("/:id", async (req, res) => {
    try {
        const coupon = await Coupons.findByPk(req.params.id, {
            include: ["categories", "users"]
        });
        return res.json(coupon);
    } catch (error) {
        return res.status(404).json(error);
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
        return res.json({ message: "Successfully deleted" });
    } catch (error) {
        return res.status(404).json(err);
    }
});


module.exports = route;