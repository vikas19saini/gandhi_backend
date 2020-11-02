const route = require('express').Router();
const { Users } = require("../models/index");
const  email = require("./components/email");


route.post("/signUp", (req, res, next) => {
    req.body.status = 2
    req.body.otp = ("" + Math.random()).substring(2, 8);
    Users.create(req.body).then((data)=>{
        let msg = 
        "<html><head><title></title></head><body style='margin : 0 ; padding : 0 ; background-color : #ffffff;'>Hello "+req.body.name+",<br><br>Thanks for your registration .<br> OTP is: "+req.body.otp+"<br><br><br>Thankyou</body></html>";
        let email_data = { to : req.body.email , subject : "SignUp" , text: msg}
        email.sendMail(email_data)
        res.send(data).json();
    }).catch((err) => {
        res.status(400).send(err).json();
    })
});

route.post("/verifyOTP",async(req,res,next)=>{
   let getUser =  await Users.findOne({
        where: {
            email: req.body.email,
            otp:req.body.otp
        }
    });
    if(getUser){
        req.body.status = 1
        Users.update(req.body, {
            where: {
                id: getUser.id
            }
        });
        let msg = 
        "<html><head><title></title></head><body style='margin : 0 ; padding : 0 ; background-color : #ffffff;'>Hello,<br><br>Your Account is verified Successfully .<br><br><br>Thankyou</body></html>";
        let email_data = { to : req.body.email , subject : "Verify Account" , text: msg}
        email.sendMail(email_data)
        res.send({ message: "OTP Verify Successfully" }).json();
    }else{
        res.send({status:404, message: "Invalid OTP" }).json();
    }
    
})




module.exports = route;