const route = require("express").Router();
const { Orders, OrdersProducts, OrdersCoupons, Coupons, Products, Addresses, OrderAddresses, OrdersHistories, Payments, Users, Uploads } = require("../../models/index");
const { sendOrderEmail } = require("../emails/mailer");

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
        let status = req.body.status;

        let order = await Orders.findByPk(req.body.orderId);
        if (order.status === status) {
            return res.status(406).json({ message: "Couldn't update status" });
        }

        await Orders.update({ status: req.body.status }, { where: { id: req.body.orderId } });
        await OrdersHistories.create({
            orderId: req.body.orderId,
            status: req.body.status,
            text: "Status updated by admin"
        });

        sendOrderEmail(req.body.orderId); // Sending emails after updating order status
        return res.json({ message: "Status updated" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Couldn't update status" });
    }
});


route.get("/:id", (req, res) => {
    Orders.findByPk(req.params.id, {
        include: ["coupons", "shippingAddress", "coupons", "histories", "user", {
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
        }],
        rejectOnEmpty: true
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        console.log(err)
        return res.status(404).json(err);
    })
});

module.exports = route;