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
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

country.post("/", (req, res, next) => {
    const con = Countries.create(req.body);
    con.then((data) => {
        return res.json(data)
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

country.patch("/:id", (req, res, next) => {
    const con = Countries.update(req.body, {
        where: {
            id: req.params.id
        }
    });
    con.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

country.delete("/:id", (req, res, next) => {
    const con = Countries.destroy({
        where: {
            id: req.params.id
        }
    });
    con.then((d) => {
        return res.json({ message: "Successfully deleted" });
    }).catch((error) => {
        return res.status(400).json(error);
    })
});

country.get("/:id", (req, res, next) => {
    const con = Countries.findByPk(req.params.id);
    con.then((data) => {
        return res.json(data);
    }).catch((error) => {
        return res.status(404).json(error);
    })
});

module.exports = country;