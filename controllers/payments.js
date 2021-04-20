const route = require('express').Router();

route.get("/config", async (req, res) => {
    let payments = [{
        name: "paypal",
        mode: process.env.PAYPAL_MODE,
        key: process.env.PAYPAL_KEY,
        title: "Paypal Express Checkout"
    }/* , {
        name: "bank",
        url: process.env.BANK_PAYMENT_URL,
        merchantId: process.env.BANK_PAYMENT_ID,
        title: "Pay by credit/debit card"
    } */];

    return res.json(payments);
});



module.exports = route;