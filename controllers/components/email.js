const nodemailer = require('nodemailer');
const mustache = require('mustache');

let mailModule = nodemailer.createTransport({
    host : "smtp.gmail.com",
    port : 465,
    secure : true,
    auth : {
        user:"vikas.lamppost@gmail.com  ",
        pass : "Vikash_19"
    },
});

let sendMail = (data)=>{
    var mailOptions = {
        from : "deepak.lamppost@gmail.com",
        to : data.to,
        subject : data.subject,
        html:mustache.render(data.text,data)
    }
  mailModule.sendMail(mailOptions);
}
 
module.exports = { sendMail : sendMail}