const route = require("express").Router();
const { Carts , Users , Addresses , Countries , Zones , Products ,WeightClasses } = require("../models/index");
const Buffer   = require('buffer/').Buffer
const request = require("request");

route.get("/", async (req, res) => {
    let params = {
        order: [["id", "desc"]],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }
    try {
        let carts = await Carts.findAndCountAll(params);

        res.send(carts).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", async(req, res, next) => {
    console.log(req.body,"req");
    let getUserId = await Users.findOne({
        where: {
            token: req.headers.token
        }
    });
    if(getUserId){
        req.body.userId = getUserId.id;
        Carts.create(req.body).then((data) => {
            res.send(data).json();
        }).catch((err) => {
            res.status(400).send(err).json();
        })
    }else{
        let err = "Invalid Token"
        res.status(400).send(err).json();
    }
});

route.patch("/:id", async (req, res) => {
    try {
        Carts.update(req.body, {
            where: {
                id: req.params.id
            }
        });
         res.send({ message: "Updated Successfully" }).json();
    } catch (err) {
        res.status(500).send(err).json();
    }
});

route.delete("/:id", async (req, res) => {
    try {
        await Carts.destroy({
            where: {
                id: req.params.id
            }
        })
        res.send({ message: "Successfully deleted" }).json();
    } catch (err) {
        res.status(404).send(err).json();
    }
});

route.post("/calcShipping", async(req, res) => {
    let user_id
    //user_id = await decodeToken(req.headers.token)
    user_id = 80

    try {

        let getProductDetails = await Carts.findAll({
            where:{
                user_id:user_id
            },
            include: [
                {
                    model: Products,
                    as: "products"
                }
            ]
        })

        let array = getProductDetails
        let productDetails = []
        let totalWeight = 0;
        for(let index = 0; index < getProductDetails.length; index++)
        {
            const element = array[index];
            let getWeightClass = await WeightClasses.findOne({
                where:{
                    id  :   element.products.dataValues.weightClassId
                },
                attributes: ['id', 'unit'],
            })
            totalWeight +=  element.products.dataValues.shippingWeight
            product_details =
                {
                    "description"   :   element.products.dataValues.name,
                    "origin_country":   "JPN",
                    "quantity"  :   element.products.dataValues.quantity,
                    "price" :
                    {
                        "amount"    :   element.products.dataValues.ragularPrice,
                        "currency"  :   "JPY"
                    },
                    "weight" :
                    {
                        "value" :   element.products.dataValues.shippingWeight,
                        "unit"  :   getWeightClass.dataValues.unit
                    },
                    "sku"   :   element.products.dataValues.sku
                }
                productDetails.push(product_details)
        }
        let getWeightUnit = await WeightClasses.findOne({
            order: [
                ['id', 'DESC']],
            attributes: ['id', 'unit'],
        })

        let getCountryDetails = await Addresses.findAll({
            where: {
                id: req.body.address_id
            },
            include: [
                {
                    model: Countries,
                    as: "countries"
                },
                {
                    model: Users,
                    as: "users"
                },
                {
                    model: Zones,
                    as: "zones"
                }
            ]
        })
        if(getCountryDetails[0].countries.code_2 === process.env.COUNTRY_OF_IMPLEMENTATION){//TH
            let username , password , authentication , auth , options , req , chunks
            username = process.env.EMS_USERNAME;
            password = process.env.EMS_PASSWORD;
            authentication  = Buffer.from(username + ':' + password).toString('base64');
            auth = 'Basic ' + authentication;
        
            options = { 
                method: 'POST',
                url: 'https://r_dservice.thailandpost.com/webservice/getRatePriceZoneByWeight',
                headers: 
                { 
                    'postman-token': '264c2700-5e8a-072f-b0c1-79d7771c974b',
                    'cache-control': 'no-cache',
                    'authorization': auth,
                    'content-type': 'application/json' 
                },
                body: 
                {   
                    type    : 'E',//E=(EMS delivery service) , "R" (registered shipping service)
                    sourcePostcode  :   process.env.CUSTOMER_POSTCODE ,
                    destinationPostcode : getCountryDetails[0].postcode,
                    weight  : totalWeight
                },
                json: true 
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                 res.send(body).json();
            });
        }
        else
        {
            var options = {
                method: 'POST',
                url: 'https://sandbox-api.postmen.com/v3/rates',
                headers: {
                    'content-type': 'application/json',
                    'postmen-api-key': 'afa44b2a-10cf-4719-ac20-96017d897d57'//test server api key
                },
                body: {
                    "async":false,
                    "shipper_accounts":[
                        {
                            "id":"0fe56e4f-2c61-4088-8fbf-e9614e4f6d0e"
                        }
                    ],
                    "shipment":{
                        "parcels":[
                            {
                                "description":"Food XS",
                                "box_type":"custom",
                                "weight":{
                                    "value":totalWeight,
                                    "unit": getWeightUnit.dataValues.unit
                                },
                                "dimension":{
                                    "width":20,
                                    "height":40,
                                    "depth":40,
                                    "unit":"cm"
                                },
                                "items":productDetails
                            }
                        ],
                        "ship_from":{
                            "contact_name":process.env.CUSTOMER_CONTACT_NAME,
                            "street1":process.env.CUSTOMER_ADDRESS_LINE1,
                            "city":process.env.CUSTOMER_CITY,
                            "state":"Phra Nakhon",
                            "country":process.env.CUSTOMER_ADDRESS_LINE3,
                            "phone":process.env.CUSTOMER_TELEPHONE,
                            "email":process.env.CUSTOMER_EMAIL,
                            "type":"business"//residential
                            
                            /*contact_name: 'Yin Ting Wong',
                            street1: 'Flat A, 29/F, Block 17\nLaguna Verde',
                            city: 'Hung Hom',
                            state: 'Kowloon',
                            country: 'HKG',
                            phone: '96679797',
                            email: 'test@test.test',
                            type: 'residential'
                            */
                        },
                        "ship_to":{
                            "contact_name": getCountryDetails[0].name,
                            "street1":getCountryDetails[0].address,
                            "city":"Sonipat",
                            "state":getCountryDetails[0].zones.name,
                            "postal_code": getCountryDetails[0].postcode,
                            "country":getCountryDetails[0].countries.name,
                            "phone": getCountryDetails[0].phone,
                            "email":getCountryDetails[0].users.email,
                            "type": getCountryDetails[0].type
                            
                           /*"contact_name":"Mike Carunchia",
                            "street1":"9504 W Smith ST",
                            "city":"Yorktown",
                            "state":"Indiana",
                            "postal_code":"47396",
                            "country":"USA",
                            "phone":"7657168649",
                            "email":"test@test.test",
                            "type":"residential"
                           */
                        }
                    }
                },
                json: true
            };
            
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                res.send(body).json();
        
            });
        }
    } catch (err) {
        res.status(400).send(err).json();
    }
})

const decodeToken = async (token) => {
    const base64String = token.split('.')[1];
    const decodedValue = JSON.parse(Buffer.from(base64String,'base64').toString('ascii'));
    return decodedValue.id;
}

module.exports = route;