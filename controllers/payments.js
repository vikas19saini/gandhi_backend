const route = require('express').Router();

route.get("/config", async (req, res) => {
    let payments = [{
        name: "paypal",
        mode: process.env.PAYPAL_MODE,
        key: process.env.PAYPAL_KEY,
        title: "Paypal Express Checkout",
        currencies: ["usd", "thb", "myr"]
    }, {
        name: "bank",
        url: process.env.BANK_PAYMENT_URL,
        merchantId: process.env.BANK_PAYMENT_ID,
        title: "Pay by credit/debit card",
        currencies: ["usd"]
    }];

    return res.json(payments);
});

route.get("/", async (req, res) => {
    res.render("index");
});
route.post("/", async (req, res) => {
    console.log(req.body);
});

module.exports = route;