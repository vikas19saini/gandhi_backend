const nodemailer = require("nodemailer")
const templateGenerator = require("./template")

const mailer = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
})

const send = async (to, subject, template, context) => {

    try {
        let templateHtml = templateGenerator(template, context)
        
        await mailer.sendMail({
            from: process.env.EMAIL_FROM,
            to: to,
            subject: subject,
            html: templateHtml,
        })

        return true
    } catch (error) {
        throw error
    }

}

module.exports = send