const route = require("express").Router();
const { Uploads } = require("../../models/index");
const multer = require("multer");
const fs = require("fs");
const sharp = require('sharp'); 



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

const upload = multer({ storage: storage });

route.get("/", (req, res, next) => {
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
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

/*route.post("/", upload.single('file'), (req, res, next) => {
console.log(req.file,"file")
    const request = {
        name: req.file.filename,
        type: req.file.mimetype,
        url: process.env.UPLOAD_PATH + req.file.filename,
        path: req.file.path
    }

    Uploads.create(request).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});
*/

route.post("/", upload.single('file'), (req, res, next) => {
    const request = {
        name: req.file.filename,
        type: req.file.mimetype,
        url: process.env.UPLOAD_PATH + req.file.filename,
        path: req.file.path
    }
    console.log(req.file,"file");
    if(req.file.size <= 1000000 ){//1mb
        Uploads.create(request).then((data) => {
            const imgname =  req.file.filename
            const img = imgname.split('.')
            const path = req.file.path;
            if(img[1] == 'png' || img[1] == 'PNG' || img[1] == 'jpg' || img[1] == 'jpeg' || img[1] == 'JPG' || img[1] == 'JPEG'){
                sharp(path).resize(100,100) 
                .jpeg({quality : 50}).toFile(req.file.destination+img[0]+"-100."+img[1]); 
            
                sharp(path).resize(350,350) 
                .jpeg({quality : 80}).toFile(req.file.destination+img[0]+"-350."+img[1]); 
            }
            res.send(data).json();

        }).catch((err) => {
            res.status(400).send(err).json();
        })
    }else{
        res.send({ status:404,message: "File size should not be more than 1MB" }).json();
    }
});


route.get("/:id", (req, res, next) => {
    Uploads.findByPk(req.params.id).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res, next) => {

    try {
        const file = await Uploads.findByPk(req.params.id);
        const imgname =  file.name
        const img = imgname.split('.')
        if(img[1] == 'png' || img[1] == 'PNG' || img[1] == 'jpg' || img[1] == 'jpeg' || img[1] == 'JPG' || img[1] == 'JPEG'){
            const file_path = file.path
            const path = file_path.split('.')
            fs.unlinkSync(path[0]+"-100."+path[1]);
            fs.unlinkSync(path[0]+"-350."+path[1]);
        }
        fs.unlinkSync(file.path);
        Uploads.destroy({
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