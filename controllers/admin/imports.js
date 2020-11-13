const route = require("express").Router();
const { Imports } = require("../../models/index");
const multer = require("multer");
const fs = require("fs");
const extract = require("extract-zip");

var storage = multer.diskStorage({
    destination: process.env.IMPORT_DIR,
    filename: (req, file, cb) => {
        let fileName = file.originalname;
        if (fs.existsSync(process.env.IMPORT_DIR + file.originalname)) {
            fileName = Date.now() + file.originalname;
        }

        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(zip)$/i)) {
            return cb(new Error('Invalid file format .zip format allowed!!'))
        }

        cb(null, true)
    }
});

route.get("/", (req, res) => {
    let params = {
        order: [
            ['id', 'DESC']
        ]
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Imports.findAndCountAll(params).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/", upload.single('file'), async (req, res) => {
    try {
        const folderPath = process.env.IMPORT_DIR + Date.now();
        const zipPath = process.env.IMPORT_DIR + req.file.filename;

        // Creating new directory
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) throw err;
        });

        // Extracting zip file
        await extract(zipPath, { dir: folderPath });
        const f = await Imports.create({
            path: folderPath
        });
        fs.unlinkSync(zipPath);
        res.send(f).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});


route.get("/:id", (req, res) => {
    Imports.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res) => {

    try {
        const file = await Imports.findByPk(req.params.id);
        fs.unlinkSync(file.path);
        Imports.destroy({
            where: {
                id: req.params.id
            }
        });
        res.send({ message: "Successfully deleted" }).json();
    } catch (error) {
        res.status(500).send(error).json();
    }
});

module.exports = route;