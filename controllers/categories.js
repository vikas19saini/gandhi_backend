const route = require('express').Router();
const { Categories, Uploads } = require("../models/index");

route.get("/:slug", async (req, res) => {
    let getCategory = await Categories.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Uploads,
                as: "media"
            },
            {
                model: Uploads,
                as: "mobileMedia"
            },
            {
                model: Categories,
                as: "ancestors"
            }
        ]
    });
    if (getCategory) {
        console.log(getCategory.ancestors.length,"getCategory")
        var product = []
        if(getCategory.ancestors.length > 0 ){
            console.log("if")
            product = [{'product_count' : 10 }]
            //getCategory.push(product)
            console.log(getCategory,"prod")
        }else{
            console.log("else")
        }
        res.send({ message: "Success" ,"result" : getCategory}).json();
    } else {
        res.send({ status: 404, message: "No Data Found" }).json();
    }
})



module.exports = route;