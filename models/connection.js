const Sequelize = require('sequelize-hierarchy')();

var seqConnection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        //timezone: process.env.TIMEZONE
//        logging: false
    }
);

module.exports = seqConnection;