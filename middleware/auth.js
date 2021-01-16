const jwt = require("jsonwebtoken");

const isLoggedIn = (token) => {
    try {
        return jwt.verify(token, process.env.TOKEN);
    } catch (err) {
        return false;
    }
};

const isAuthenticated = (req, res, next) => {
    let user = isLoggedIn(req.headers['authorization']);
    if (!user) {
        return res.status(401).json({ message: "Please login to access" });
    }

    req.userId = user.userId;
    next()
}

module.exports = { isLoggedIn, isAuthenticated };