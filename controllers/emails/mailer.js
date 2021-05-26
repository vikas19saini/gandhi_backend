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
        console.log(error);
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

    let heading = "", text = "", subject = ""; // 0 - Processing, 1 - Packed, 2 - Shipped, 3 - delivered, 4 - Refunded, 5 - Cancelled, 6 - Payment Fail

    if (order.status === 0) {
        heading = "Thanks for your order";
        text = `Thanks for shopping! We received your order containing ${order.products.length} items, and will contact you as soon as your package is shipped. You can find your purchase information below.`;
        subject = `${process.env.BRAND_NAME} - Order received #${order.id}`;
    } else if (order.status === 1) {
        heading = "Order packed";
        text = `Your order containing ${order.products.length} items is packed and will be shipped soon we will update you.`;
        subject = `${process.env.BRAND_NAME} - Order packed #${order.id}`;
    } else if (order.status === 2) {
        heading = "Your order is shipped";
        text = "It will be delivered to you within 7 working days.";
        subject = `${process.env.BRAND_NAME} - Order shipped #${order.id}`;
    } else if (order.status === 3) {
        heading = "Your order is delivered";
        text = "Order delivered! Thank you for choosing Gandhi Fabrics";
        subject = `${process.env.BRAND_NAME} - Order delivered #${order.id}`;
    } else if (order.status === 4) {
        heading = "Your Order Refunded";
        text = "Order Refunded! Thank you for choosing Gandhi Fabrics";
        subject = `${process.env.BRAND_NAME} - Order refunded #${order.id}`;
    } else if (order.status === 5) {
        heading = "Your order is cancelled";
        text = "Your order is cancelled! If you need more halp, please contact support@gandhifabrics.com";
        subject = `${process.env.BRAND_NAME} - Order cancelled #${order.id}`;
    } else if (order.status === 6) {
        heading = "Order Payment Fail";
        text = "Order payment declined! Thank you for choosing Gandhi Fabrics";
        subject = `${process.env.BRAND_NAME} - Order payment declined #${order.id}`;
    }

    // Sending email to customer
    send(order.user.email, subject, "orderCustomer2", {
        order: order,
        date: dateFormat(order.createdAt, "dddd, mmmm dS, yyyy"),
        heading: heading,
        text: text,
        eta: dateFormat(order.shipBy, "dddd, mmmm dS, yyyy"),
    })
}

module.exports = { send, sendOrderEmail }