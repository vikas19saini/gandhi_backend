const route = require("express").Router();
const { Enquiries } = require("../../models/index");

route.get("/", async (req, res) => {
    console.log(req.query.type,"req")
    let params = {
        
        order: [
            ['id', 'desc']
        ],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    
    try {
        let enquiries = await Enquiries.findAndCountAll(params);
        res.send(enquiries).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", (req, res, next) => {
    Enquiries.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", async (req, res) => {
    try {
        Enquiries.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.send({ message: "Updated Successfully" }).json();
    } catch (err) {
        res.status(500).send(err).json();
    }
});

route.get("/:id", (req, res) => {
    Enquiries.findOne({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res) => {
    try {
        await Enquiries.destroy({
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