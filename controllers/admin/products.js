const route = require("express").Router();
const { Products } = require("../../models/index");

route.get("/", async (req, res) => {
    let params = {
        order: [["id", "desc"]],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    try {
        let products = await Products.findAndCountAll(params);

        res.send(products).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", (req, res, next) => {
    Products.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", async (req, res) => {
    try {
        Products.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.send({ message: "Updated Successfully" }).json();
    } catch (err) {
        res.status(500).send(err).json();
    }
});

route.get("/:id", (req, res, next) => {
    Products.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res, next) => {
    try {
        await Products.destroy({
            where: {
                id: req.params.id
            }
        })
        res.send({ message: "Successfully deleted" }).json();
    } catch (err) {
        res.status(404).send(err).json();
    }
});

module.exports = route;