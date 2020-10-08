const jwt = require("jsonwebtoken");
const config = require("config");

const isLoggedIn = (token) => {
    try {
        jwt.verify(token, config.get("token_secret"));
        return true
    } catch (err) {
        return false;
    }
};

module.exports = { isLoggedIn };