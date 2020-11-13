const route = require("express").Router();
const { Settings } = require("../../models/index");
const { Op } = require('sequelize');


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
    if (req.query.search) {
        params.where = {
            [Op.or]: [
                {
                    value: {
                        [Op.like]: `%${req.query.search}%`
                    }
                }
            ]
        }
    }

    Settings.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

/*route.post("/", (req, res, next) => {
    Settings.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});
*/
route.patch("/:id", async(req, res, next) => {
   try {
        const result = await Settings.update(
          { value: req.body.value},
          { where: { id: req.params.id } }
        )
       res.send(result).json();
      } catch (err) {
        res.status(400).send(err).json();
      }
});

route.get("/:id", (req, res, next) => {
    Settings.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", (req, res, next) => {
    Settings.destroy({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

module.exports = route;