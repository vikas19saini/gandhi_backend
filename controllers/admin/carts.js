const route = require("express").Router();
const { Carts , Users } = require("../../models/index");

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
        let carts = await Carts.findAndCountAll(params);

        res.send(carts).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", async(req, res, next) => {
    let getUserId = await Users.findOne({
        where: {
            token: req.headers.token
        }
    });
    if(getUserId){
        req.body.userId = getUserId.id;
        Carts.create(req.body).then((data) => {
            res.send(data).json();
        }).catch((err) => {
            res.status(400).send(err).json();
        })
    }else{
        let err = "Invalid Token"
        res.status(400).send(err).json();
    }
});

route.patch("/:id", async (req, res) => {
    try {
        Carts.update(req.body, {
            where: {
                id: req.params.id
            }
        });
         res.send({ message: "Updated Successfully" }).json();
    } catch (err) {
        res.status(500).send(err).json();
    }
});

route.delete("/:id", async (req, res) => {
    try {
        await Carts.destroy({
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