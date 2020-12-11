const route = require("express").Router();
const { Orders, OrdersProducts, OrdersCoupons,Coupons , Products ,  Addresses , OrdersAddresses , OrdersHistories } = require("../../models/index");
const seqConnection = require("../../models/connection");

route.get("/", async (req, res) => {
    let params = {
        order: [
            ['id', 'desc']
        ],
        distinct: true
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }
    try {
        let orders = await Orders.findAndCountAll(params);

        res.send(orders).json();
    } catch (err) {
        res.status(400).send(err).json();
    }
});

route.post("/", async (req, res) => {
    try {
        const createOrder = await seqConnection.transaction(async (t) => {

            let coupon_code , type , coupon_value
            let getBillingAddress = await Addresses.findByPk(req.body.billingAddressId)
            if(getBillingAddress){
                let billingAddressData = {
                    address: getBillingAddress.dataValues.address,
                    country : getBillingAddress.dataValues.country_id,
                    zone : getBillingAddress.dataValues.zone_id,
                    postcode : getBillingAddress.dataValues.postcode,
                    type : getBillingAddress.dataValues.type,
                    name : getBillingAddress.dataValues.name,
                    phone : getBillingAddress.dataValues.phone
                }
                let billAddress = await OrdersAddresses.create( billingAddressData , { transaction: t }) ;
                var billing_address_id = billAddress.dataValues.id ; 
            }

            let getShippingAddress = await Addresses.findByPk(req.body.shippingAddressId)
            if(getShippingAddress){
                let shippingAddressData = {
                    address: getShippingAddress.dataValues.address,
                    country : getShippingAddress.dataValues.country_id,
                    zone : getShippingAddress.dataValues.zone_id,
                    postcode : getShippingAddress.dataValues.postcode,
                    type : getShippingAddress.dataValues.type,
                    name : getShippingAddress.dataValues.name,
                    phone : getShippingAddress.dataValues.phone
                }
                let shipAddress = await OrdersAddresses.create( shippingAddressData , { transaction: t });
                var shipping_address_id = shipAddress.dataValues.id ; 
            }
            req.body.billingAddressId =  billing_address_id
            req.body.shippingAddressId =  shipping_address_id
            let order = await Orders.create(req.body, { transaction: t });
            if(req.body.coupons){
                const getCouponDetail = await Coupons.findOne({
                    where: {
                        "id":req.body.coupons
                    },
                });
                coupon_code = ( getCouponDetail.dataValues.code ? getCouponDetail.dataValues.code : '' )
                type = ( getCouponDetail.dataValues.discountType ? (getCouponDetail.dataValues.discountType === 'percentage' ? 1 : 0 ):'');
                coupon_value = ( getCouponDetail.dataValues.amount ? getCouponDetail.dataValues.amount : '')
                let coupon = {
                    orderId:order.dataValues.id,
                    couponId: req.body.coupons,
                    couponCode: coupon_code,
                    type: type,//percentage,fixed
                    couponValue: coupon_value
                }
                await OrdersCoupons.create( coupon , { transaction: t })
            }

            if (req.body.products) {
               let products = req.body.products
                for(let index=0 ;index<products.length;index++){
                    const element = products[index];
                    let getProductDetail =  await Products.findOne({
                        where: {
                            //"id":element.id
                            "id": 19
                        },
                    });
                    let productData = {
                        orderId:order.dataValues.id,
                        productId : getProductDetail.dataValues.id,
                        title: getProductDetail.dataValues.name,
                        sku: getProductDetail.dataValues.sku,
                        ragularPrice: getProductDetail.dataValues.ragularPrice,
                        salePrice: getProductDetail.dataValues.salePrice,
                        tax: element.tax,
                        tax_value: element.tax_value,
                        tax_rate: element.tax_rate,
                        quantity: element.quantity,
                        discount: element.discount
                    }
                    await OrdersProducts.create( productData , { transaction: t })
                }
            }
            return order;
        });
        res.send(createOrder).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
    
});

route.patch("/:id", async (req, res) => {
    try {
        const transactionResult = await seqConnection.transaction(async (t) => {
            await Orders.update(req.body, {
                where: {
                    id: req.params.id
                }
            });
            const orders = await Orders.findByPk(req.params.id);
            await orders.setCoupons(req.body.coupons ? req.body.coupons : [], { transaction: t });
           // await orders.setUsers(req.body.users ? req.body.users : [], { transaction: t });
            return { message: "updated" };
        });
        res.send(transactionResult).json();
    } catch (error) {
        res.status(400).send(error).json();
    }
});

route.patch("/status/:id", async(req, res) => {
    let result ;
    try {
        const transactionResult = await seqConnection.transaction(async (t) => {
            const getOrderDetail =  await Orders.findOne({
                where: {
                    id : req.params.id
                },
            });
            if(getOrderDetail){
                if(req.body.status === getOrderDetail.dataValues.status){
                    res.send({"status":401, "message": "This Status is already updated" }).json();
                }else{
                    let orderStatus = {
                        status : req.body.status
                    }

                    await Orders.update(orderStatus, {
                        where: {
                            id: req.params.id
                        }
                    } , { transaction: t });

                    let historyData = {
                        orderId :   req.params.id,
                        status  :   req.body.status,
                        text    :   req.body.text
                    }
                    result = await OrdersHistories.create( historyData , { transaction: t })
                    console.log(result , "res");
                    
                }
            }else{
                let orderStatus = {
                    status : req.body.status
                }
                await Orders.update(orderStatus, {
                    where: {
                        id: req.params.id
                    }
                }) , { transaction: t };

                let historyData = {
                    orderId :   req.params.id,
                    status  :   req.body.status,
                    text    :   req.body.text
                }
                result = await OrdersHistories.create( historyData , { transaction: t })
            }
            return result;
        });
        res.send(transactionResult).json();
    } 
    catch (error) {
        res.status(400).send(error).json();
    }
});


route.get("/:id", (req, res) => {
    Orders.findByPk(req.params.id, {
        include: ["coupons", "products"]
    }).then((data) => {
        res.send(data).json();
    }).catch((err) => {
        res.status(404).send(err).json();
    })
});

route.delete("/:id", async (req, res) => {
    try {
        const orderTransaction = await seqConnection.transaction(async (t) => {
            await Orders.destroy({
                where: {
                    id: req.params.id
                }
            }, { transaction: t });
            await OrdersCoupons.destroy({
                where: {
                    orderId: req.params.id
                }
            }, { transaction: t });
            await OrdersProducts.destroy({
                where: {
                    orderId: req.params.id
                }
            }, { transaction: t });
            
            
            return { message: "Successfully deleted" };
        });
        res.send(orderTransaction).json();
    } catch (err) {
        res.status(404).send(err).json();
    }
});

module.exports = route;