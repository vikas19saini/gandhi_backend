const route = require('express').Router();
const { Users } = require("../models/index");
const { sendOtp } = require("./emails/customer")


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

module.exports = route;