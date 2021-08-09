const { Carts, Users, Addresses, Products, Coupons } = require("../../models");
const route = require("express").Router();

route.get("/", (req, res) => {
    let params = {
        order: [
            ['updatedAt', 'desc']
        ],
        rejectOnEmpty: true,
        /* paranoid: false, */
        include: [{
            model: Users,
            as: "user",
            attributes: ["name", "email"],
            paranoid: false
        }, {
            model: Addresses,
            as: "address",
            include: ["country", "zone"],
            paranoid: false
        }]
    };
    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Carts.scope('abandoned').findAndCountAll(params).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        console.log(err);
        return res.status(404).json({ message: err.message });
    });
});


route.get("/:id", (req, res) => {
    let params = {
        include: [{
            model: Users,
            as: "user",
            attributes: ["name", "email"],
            paranoid: false,
        }, {
            model: Addresses,
            as: "address",
            include: ["country", "zone"],
            paranoid: false,
        }, {
            model: Products,
            as: "products",
            include: ["featuredImage"]
        }]
    };

    Carts.findByPk(req.params.id, params).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        console.log(err);
        return res.status(404).json({ message: err.message });
    });
});

module.exports = route;