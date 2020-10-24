const route = require("express").Router();
const { Coupons } = require("../../models/index");

route.get("/", (req, res, next) => {
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

route.post("/", async (req, res, next) => {
    try {
        const coupon = await Coupons.create(req.body);
        await coupon.addCategories(req.body.categories);
        await coupon.addUsers(req.body.users);
        res.send(coupon).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});


route.patch("/:id", async (req, res, next) => {
    try {
        await Coupons.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        const coupon = await Coupons.findByPk(req.params.id);
        await coupon.setCategories(req.body.categories);
        await coupon.setUsers(req.body.users);
        res.send(coupon).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.get("/:id", async (req, res) => {
    try {
        const coupon = await Coupons.findByPk(req.params.id, {
            include: ["categories","users"]
        });
        res.send(coupon).json();
    } catch (error) {
        res.status(404).send(error).json();
    }
})


route.delete("/:id", async (req, res, next) => {
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