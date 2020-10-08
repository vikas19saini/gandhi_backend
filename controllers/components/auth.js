const { Users } = require("../../models/index")
const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");
const config = require("config");

const login = async (userName, password) => {
    const user = await Users.findOne({
        where: {
            email: userName
        }
    })

    if (user === null) {
        return {
            status: false,
            message: "Invalid email address!"
        }
    }

    if (!passwordHash.verify(password, user.password)) {
        return {
            status: false,
            message: "Invalid password!"
        }
    }

    if (!user.status) {
        return {
            status: false,
            message: "Inactive account!"
        }
    }

    var authToken = jwt.sign({ username: user.email }, config.get("token_secret"), { expiresIn: "7200s" });

    await Users.update({ token: authToken }, {
        where: {
            id: user.id
        }
    });

    return {
        status: true,
        token: authToken
    }
}

module.exports = { login }