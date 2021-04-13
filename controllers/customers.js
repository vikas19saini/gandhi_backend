const route = require('express').Router();
const { Users, Enquiries } = require("../models/index");
const { sendOtp } = require("./emails/customer");
const multer = require("multer");
const fs = require("fs");
const { isAuthenticated } = require('../middleware/auth');

var storage = multer.diskStorage({
    destination: process.env.UPLOAD_DIR.replace("uploads", "enquires"),
    filename: (req, file, cb) => {
        if (file) {
            let fileName = file.originalname;
            if (fs.existsSync(process.env.UPLOAD_DIR.replace("uploads", "enquires") + file.originalname)) {
                fileName = Date.now() + file.originalname;
            }

            cb(null, fileName);
        }
    }
});

const upload = multer({ storage: storage, limits: { fileSize: parseInt(process.env.MAX_UPLOAD_FILE_SIZE), files: 1 } });

route.post("/registartion", async (req, res) => {
    try {
        req.body.otp = ("" + Math.random()).substring(2, 8)
        let user = await Users.create(req.body)
        await sendOtp(user)
        return res.json({ message: "Successfully created" })
    } catch (err) {
        return res.status(400).json(err);
    }
});

route.post("/verify", async (req, res) => {
    try {
        let user = await Users.findOne({
            where: {
                email: req.body.email,
                otp: req.body.otp
            }
        });

        if (!user) return res.status(400).json({ message: "Incorrect OTP! please try again" })
        await Users.update({ status: 1, otp: null }, { where: { email: req.body.email } })

        return res.json({ message: "OTP Verified" })

    } catch (err) {
        return res.status(500).json(err)
    }
});

route.post("/enquiry", upload.single('file'), async (req, res) => {
    let request = req.body;
    if (req.file) {
        request = { ...req.body, ...{ image: req.file.filename } };
    }


    Enquiries.create(request).then((data) => {
        return res.json({ message: "Successfully created" });
    }).catch((err) => {
        console.log(err)
        return res.status(500).json(err);
    })
});

route.get("/details", [isAuthenticated], async (req, res) => {
    Users.findByPk(req.userId, {
        attributes: ["name", "email", "phone", "additionalInfo"]
    }).then((user) => {
        return res.json(user);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.patch("/details", [isAuthenticated], async (req, res) => {
    Users.update({
        name: req.body.name,
        phone: req.body.phone,
    }, { where: { id: req.userId } }).then((user) => {
        return res.json({ message: "Updated" });
    }).catch((err) => {
        return res.status(400).json(err);
    })
})

module.exports = route;