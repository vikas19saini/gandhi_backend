const route = require("express").Router();
const { Wishlists, Users, Products, Uploads } = require("../models/index");

route.get("/", async (req, res) => {
    let params = {
        order: [["id", "desc"]],
        distinct: true,
        include: [{
            model: Products,
            as: "product",
            include: [{
                model: Uploads,
                as: "featuredImage"
            }]
        }],
        where: {
            userId: req.userId
        }
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }
    try {
        let wishlist = await Wishlists.findAndCountAll(params);

        return res.json(wishlist);
    } catch (err) {
        console.log(err)
        return res.status(400).json(err);
    }
});

route.post("/", async (req, res) => {

    try {
        let wishlist = await Wishlists.findOne({ where: { userId: req.userId, productId: req.body.productId } })

        if (wishlist) {
            await Wishlists.destroy({ where: { userId: req.userId, productId: req.body.productId } })
            return res.json({ message: "Removed from wishlist" })
        }
        wishlist = await Wishlists.create({ ...req.body, ...{ userId: req.userId } })
        return res.json({ message: "Added in wishlist" })
    } catch (err) {
        return res.status(400).json(err)
    }
});

route.delete("/:id", async (req, res) => {
    try {
        await Wishlists.destroy({ where: { id: id, userId: req.userId } })
        return res.json({ message: "Successfully deleted" });
    } catch (err) {
        return res.status(400).json(err);
    }
});

module.exports = route;