const { Users, Roles, Menus } = require("../../models/index")
const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");

const login = async (userName, password) => {
    const user = await Users.findOne({
        where: {
            email: userName
        },
        include: [{
            model: Roles,
            include: Menus
        }
        ]
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
            message: "Inactive account!",
            statusCode: 1100
        }
    }

    var authToken = jwt.sign({ username: user.email, userId: user.id }, process.env.TOKEN, { expiresIn: "3000d" });
    await Users.update({ token: authToken }, {
        where: {
            id: user.id
        }
    });

    return {
        status: true,
        token: authToken,
        user: user
    }
}

module.exports = { login }