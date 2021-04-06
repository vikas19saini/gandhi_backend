const nodemailer = require("nodemailer")
const { Orders, Uploads, Products, OrderAddresses, Users } = require("../../models")
const templateGenerator = require("./template")
var dateFormat = require("dateformat");

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

const sendOrderEmail = async (orderId) => {
    let order = await Orders.findByPk(orderId, {
        include: [{
            model: Products,
            as: "products",
            include: [
                {
                    model: Uploads,
                    as: "featuredImage"
                }
            ]
        }, {
            model: OrderAddresses,
            as: "shippingAddress"
        }, {
            model: Users,
            as: "user"
        }]
    });

    if (order.status === 1) {
        send(order.user.email, `${process.env.BRAND_NAME} - Order received #${order.id}`, "processing", { order: order, date: dateFormat(order.createdAt, "dddd, mmmm dS, yyyy") })
    }
}

module.exports = { send, sendOrderEmail }