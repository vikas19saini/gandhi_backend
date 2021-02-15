const route = require("express").Router();
const { Uploads } = require("../../models/index");
const multer = require("multer");
const fs = require("fs");
const sharp = require('sharp');
const allowedFileFormats = ['png', 'jpg', 'jpeg'];

var storage = multer.diskStorage({
    destination: process.env.UPLOAD_DIR,
    filename: (req, file, cb) => {
        let fileName = file.originalname;
        if (fs.existsSync(process.env.UPLOAD_DIR + file.originalname)) {
            fileName = Date.now() + file.originalname;
        }

        cb(null, fileName);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: parseInt(process.env.MAX_UPLOAD_FILE_SIZE), files: 1 } });

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

    Uploads.findAndCountAll(params).then((data) => {
        return res.json(data);
    }).catch((err) => {
        console.log(err)
        return res.status(400).json(err);
    })
});

route.post("/", upload.single('file'), (req, res) => {

    const request = {
        name: req.file.filename,
        url: process.env.UPLOAD_PATH + req.file.filename,
        path: req.file.path
    }

    Uploads.create(request).then((data) => {
        const imgname = req.file.filename
        const img = imgname.split('.')
        const path = req.file.path;
        if (allowedFileFormats.includes(img[1].toLocaleLowerCase())) {
            sharp(path).resize(100, 100, {
                fit: sharp.fit.inside
            }).jpeg({ quality: 100 }).toFile(req.file.destination + img[0] + "-100x100." + img[1]);

            sharp(path).resize(350, 350, {
                fit: sharp.fit.inside
            }).jpeg({ quality: 100 }).toFile(req.file.destination + img[0] + "-350x350." + img[1]);
        }
        return res.json(data);

    }).catch((err) => {
        return res.status(400).json(err);
    })
});


route.get("/:id", (req, res) => {
    Uploads.findByPk(req.params.id).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res) => {

    try {
        const file = await Uploads.findByPk(req.params.id);
        const imgname = file.name
        const img = imgname.split('.')
        if (allowedFileFormats.includes(img[1].toLocaleLowerCase())) {
            const file_path = file.path
            const path = file_path.split('.')
            fs.unlinkSync(path[0] + "-100x100." + path[1]);
            fs.unlinkSync(path[0] + "-350x350." + path[1]);
        }
        fs.unlinkSync(file.path);
        await Uploads.destroy({
            where: {
                id: req.params.id
            }
        });
        return res.json({ message: "Successfully deleted" });
    } catch (error) {
        return res.status(500).json(error);
    }
});

module.exports = route;