const { Sequelize, Op } = require("sequelize");
const { Orders, OrdersProducts } = require("../../models");

const route = require("express").Router();

route.get("/", async (req, res) => {
    try {
        let orders = await Orders.count();
        let totalRevenue = await Orders.sum("total", {
            where: { status: 3 }
        });
        let deliveredOrders = await Orders.count({
            where: { status: 3 }
        });
        let productsSold = await OrdersProducts.count({
            include: [
                {
                    model: Orders,
                    as: "order",
                    where: {
                        status: 3
                    },
                    required: true
                }
            ]
        });

        let date = new Date();
        let monthStartDate = `${date.getFullYear()}-0${date.getMonth() + 1}-01`;
        let monthEndDate = `${date.getFullYear()}-0${date.getMonth() + 1}-31`;
        let yearStartDate = `${date.getFullYear()}-01-01`;
        let yearEndDate = `${date.getFullYear()}-12-31`;
        
        let thisMonthSalesData = await Orders.count({
            where: {
                status: 3,
                createdAt: {
                    [Op.gte]: monthStartDate,
                    [Op.lte]: monthEndDate
                }
            },
            attributes: [[Sequelize.literal(`DATE(created_at)`), 'date'], [Sequelize.fn('sum', Sequelize.col("total")), 'sales']],
            group: ["date"],
        });

        let thisYearSalesData = await Orders.count({
            where: {
                status: 3,
                createdAt: {
                    [Op.gte]: yearStartDate,
                    [Op.lte]: yearEndDate
                }
            },
            attributes: [[Sequelize.literal(`MONTH(created_at)`), 'month'], [Sequelize.fn('sum', Sequelize.col("total")), 'sales']],
            group: ["month"],
        });

        return res.status(200).json({
            orders,
            totalRevenue,
            deliveredOrders,
            productsSold,
            thisMonthSalesData,
            thisYearSalesData
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json(err.message || "No message available");
    }
});

module.exports = route;