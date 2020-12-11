const route = require("express").Router();
const { Sliders, Uploads } = require("../../models/index");

route.get("/", async (req, res) => {
    console.log(req.query.type,"req")
    let params = {
        include: [
            {
                model: Uploads,
                as: "media"
            },
            {
                model: Uploads,
                as: "mobileMedia"
            }
        ],
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

    if(req.query.type){
        params.where ={'type': req.query.type};
        params.order= [['sort_order', 'desc']]
       
    }
    try {
        let sliders = await Sliders.findAndCountAll(params);
        res.send(sliders).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", (req, res, next) => {
    Sliders.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.patch("/:id", async (req, res) => {
    try {
        Sliders.update(req.body, {
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
    Sliders.findOne({
        where: {
            id: req.params.id
        },
        include: [
       
        {
            model: Uploads,
            as: "media"
        },
        {
            model: Uploads,
            as: "mobileMedia"
        }]
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res) => {
    try {
        await Sliders.destroy({
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