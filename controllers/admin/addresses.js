const route = require("express").Router();
const { Addresses ,Countries , Zones , Users } = require("../../models/index");

route.get("/", async (req, res) => {
    let params = {
        include: [
            {
                model: Countries,
                as: "countries"
            },
            {
                model: Zones,
                as: "zones"
            },
            {
                model: Users,
                as: "users"
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

    try {
        let addresses = await Addresses.findAndCountAll(params);
        
        res.send(addresses).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", async(req, res, next) => {
    if(req.body.is_default == 1){
        let updated_data = await updateData(req.body)
    }
    Addresses.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })

});

route.patch("/:id", async (req, res) => {
    try {

        if(req.body.is_default == 1){
            let updated_data = await updateData(req.body)
        }
        Addresses.update(req.body, {
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
    Addresses.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {
                model: Countries,
                as: "countries"
            },
            {
                model: Zones,
                as: "zones"
            },
            {
                model: Users,
                as: "users"
            }
        ]
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res, next) => {
    try {
        await Addresses.destroy({
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


async function updateData(data){
    let user_id = JSON.parse(data.user_id);
    data.is_default = 0;
    let updateData = Addresses.update(data, {
        where: {
            user_id: user_id
        }
    });
    data.is_default = 1;
    return updateData;
}