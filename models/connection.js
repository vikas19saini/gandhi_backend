const { Sequelize } = require("sequelize");
const config = require("config");

var seqConnection = new Sequelize(
    config.get("database.name"),
    config.get("database.username"),
    config.get("database.password"),
    {
        host: config.get("database.host"),
        dialect: config.get("database.dialect"),
//        logging: false
    }
);

module.exports = seqConnection;