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

route.post("/verifyOTP", async (req, res, next) => {
    let getUser = await Users.findOne({
        where: {
            email: req.body.email,
            otp: req.body.otp
        }
    });
    if (getUser) {
        req.body.status = 1
        Users.update(req.body, {
            where: {
                id: getUser.id
            }
        });
        let msg =
            "<html><head><title></title></head><body style='margin : 0 ; padding : 0 ; background-color : #ffffff;'>Hello,<br><br>Your Account is verified Successfully .<br><br><br>Thankyou</body></html>";
        let email_data = { to: req.body.email, subject: "Verify Account", text: msg }
        email.sendMail(email_data)
        res.send({ message: "OTP Verify Successfully" }).json();
    } else {
        res.send({ status: 404, message: "Invalid OTP" }).json();
    }
});

module.exports = route;