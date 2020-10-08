const country = require("express").Router();
const { Countries, Zones } = require("../../models/index");

country.get("/", (req, res, next) => {
    let params = {
        include: Zones
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    const countries = Countries.findAndCountAll(params);

    countries.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

country.post("/", (req, res, next) => {
    const con = Countries.create(req.body);
    con.then((data) => {
        res.send(data), json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

country.patch("/:id", (req, res, next) => {
    const con = Countries.update(req.body, {
        where: {
            id: req.params.id
        }
    });
    con.then((data) => {
        res.send(data), json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

country.delete("/:id", (req, res, next) => {
    const con = Countries.destroy({
        where: {
            id: req.params.id
        }
    });
    con.then((d) => {
        res.send({ message: "Successfully deleted" }).json();
    }).catch((error) => {
        res.status(400).send(error).json();
    })
});

country.get("/:id", (req, res, next) => {
    const con = Countries.findByPk(req.params.id);
    con.then((data) => {
        res.send(data).json();
    }).catch((error) => {
        res.status(404).send(error).json();
    })
});

module.exports = country;