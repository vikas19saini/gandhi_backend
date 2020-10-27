const route = require('express').Router();
const { Users } = require("../models/index");


route.post("/signUp", (req, res, next) => {
    req.body.status = 2
    req.body.otp = ("" + Math.random()).substring(2, 8);
    Users.create(req.body).then((data)=>{
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
        res.send({ message: "OTP Verify Successfully" }).json();
    }else{
        res.send({status:404, message: "Invalid OTP" }).json();
    }
    
})




module.exports = route;