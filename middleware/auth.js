const jwt = require("jsonwebtoken");

const isLoggedIn = (token) => {
    try {
        jwt.verify(token, process.env.TOKEN);
        return true
    } catch (err) {
        return false;
    }
};

module.exports = { isLoggedIn };