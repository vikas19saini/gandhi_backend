const route = require('express').Router();
const { Products } = require("../models/index");

route.get("/:slug", async (req, res) => {
    let getProducts = await Products.findOne({
        where: {
            slug: req.params.slug
        },
        include: ["categories", "filters", "thumbnails", "attributes", "featuredImage", "taxClass", "lengthClass", "weightClass"]
    });
    if (getProducts) {
        res.send({ message: "Success" ,"result" : getProducts}).json();
    } else {
        res.send({ status: 404, message: "No Data Found" }).json();
    }
})



module.exports = route;