const route = require("express").Router();
const { EmailSmsTemplates } = require("../../models/index");

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

    EmailSmsTemplates.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

/*route.post("/", (req, res, next) => {
    EmailSmsTemplates.create(req.body).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});
*/
route.patch("/:id", async(req, res, next) => {
   try {
        const result = await EmailSmsTemplates.update(
          { subject: req.body.subject , body : req.body.body ,notification_status:req.body.notification_status ,type : req.body.type},
          { where: { id: req.params.id } }
        )
       res.send(result).json();
      } catch (err) {
        res.status(400).send(err).json();
      }
});

route.get("/:id", (req, res, next) => {
    EmailSmsTemplates.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", (req, res, next) => {
    EmailSmsTemplates.destroy({
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