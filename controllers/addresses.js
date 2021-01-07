const route = require("express").Router();
const { Addresses, Countries, Zones } = require("../models/index");

route.get("/", async (req, res) => {
    let params = {
        include: [
            {
                model: Countries,
                as: "country"
            },
            {
                model: Zones,
                as: "zone"
            },
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

    if (req.userId) {
        params.where = { userId: req.userId }
    }

    try {
        let addresses = await Addresses.findAndCountAll(params);

        return res.json(addresses);
    } catch (err) {
        return res.status(500).json(err);
    }
});

route.post("/", async (req, res) => {
    req.body.userId = req.userId;

    if (req.body.isDefault == 1) {
        await updateData(req.body)
    }
    Addresses.create(req.body).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.patch("/:id", async (req, res) => {
    try {
        if (req.body.isDefault == 1) {
            await updateData(req.body)
        }
        Addresses.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        return res.json({ message: "Updated Successfully" });
    } catch (err) {
        return res.status(500).json(err);
    }
});

route.get("/:id", (req, res, next) => {
    Addresses.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {
                model: Countries,
                as: "country"
            },
            {
                model: Zones,
                as: "zone"
            }
        ]
    }).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res) => {    
    try {
        await Addresses.destroy({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        })
        return res.json({ message: "Successfully deleted" });
    } catch (err) {
        console.log(err)
        return res.status(400).json(err);
    }
});

async function updateData(data) {
    let userId = data.userId;
    data.isDefault = 0;
    let updateData = await Addresses.update(data, {
        where: {
            userId: userId
        }
    });
    data.isDefault = 1;
    return updateData;
}

module.exports = route;