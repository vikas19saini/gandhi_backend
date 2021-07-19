const route = require("express").Router();
const { Orders, Coupons, Products, OrderAddresses, OrdersHistories, Payments, Users, Uploads } = require("../../models/index");

route.get("/", async (req, res) => {
    let params = {
        order: [
            ['id', 'desc']
        ],
        distinct: true,
        include: [
            {
                model: Products,
                as: "products",
                include: ["featuredImage"]
            },
            {
                model: Coupons,
                as: "coupons"
            },
            {
                model: OrderAddresses,
                as: "shippingAddress"
            },
            {
                model: Payments,
                as: "payments"
            },
            {
                model: OrdersHistories,
                as: "histories"
            },
            {
                model: Users,
                as: "user"
            }
        ]
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    let whereClause = {};

    if (req.query.status) {
        whereClause.status = req.query.status.split(",");
    }

    if (req.query.orderId) {
        whereClause.id = req.query.orderId;
    }

    if (req.query.orderId) {
        whereClause.id = req.query.orderId;
    }

    if (req.query.userId) {
        whereClause.userId = req.query.userId;
    }

    params.where = whereClause

    try {
        let orders = await Orders.findAndCountAll(params);

        return res.json(orders);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
});

route.patch("/updateStatus", async (req, res) => {
    try {
        let order = await Orders.findByPk(req.body.orderId);
        order.status = req.body.status;
        await order.save();

        return res.json({ message: "Status updated" });
    } catch (err) {
        console.log(err);
        let message = err.message;
        return res.status(500).json({ message: message });
    }
});

route.patch("/tracking", async (req, res) => {
    try {
        let tracking = req.body.trackingNo;
        await Orders.update({ trackingNo: tracking }, { where: { id: req.body.orderId } });
        return res.json({ message: "Successfully updated" });
    } catch (err) {
        return res.status(500).json({ message: "Couldn't update status" });
    }
});

route.get("/:id", (req, res) => {
    Orders.findByPk(req.params.id, {
        include: ["coupons", "shippingAddress", "coupons", "user", "payments", {
            model: Products,
            as: "products",
            include: {
                model: Uploads,
                as: "featuredImage",
                attributes: {
                    exclude: ["name", "createdAt", "updatedAt"]
                }
            },
            attributes: ["id", "slug", "shippingWeight"]
        }, {
                model: OrdersHistories,
                as: "histories",
            }],
        rejectOnEmpty: true,
        order: [["histories", "createdAt", "asc"]]
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        console.log(err)
        return res.status(404).json(err);
    })
});

module.exports = route;