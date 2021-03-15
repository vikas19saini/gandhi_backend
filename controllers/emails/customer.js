const { send } = require("./mailer")

const sendOtp = async (user) => {
    let st = await send(user.email, process.env.BRAND_NAME + " email verification", "otp", user)
    return st
}

module.exports = { sendOtp }