const Users = require("./users");
const Roles = require("./roles");
const Menus = require("./menus")
const RolesMenus = require('./roles_menus');
const UsersRoles = require('./users_roles');
const Countries = require("./countries");
const Zones = require("./zones");
const Currencies = require("./currencies");
const GeoZones = require("./geozones");
const GeoZonesZones = require("./geozones_zones");
const Taxes = require("./taxes");
const TaxClasses = require("./tax_classes");
const TaxesClasses = require("./taxes_classes");
const WeightClasses = require("./weight_classes");
const LengthClasses = require("./length_classes");
const Uploads = require("./uploads");
const Categories = require("./categories");
const Filters = require("./filters");
const FilterValues = require("./filter_values");
const Attributes = require("./attributes");
const AttributeValues = require("./attribute_values");
const Coupons = require("./coupons");
const Products = require("./products");
const ProductsCategories = require("./products_categories");
const ProductsUploads = require("./products_uploads");
const ProductsFilterValues = require("./products_filter_values");
const ProductsAttributeValues = require("./products_attribute_values");
const CouponsCategories = require("./coupons_categories");
const CouponsUsers = require("./coupons_users");
const Sliders = require("./sliders");
const Addresses = require("./addresses");
const Imports = require("./imports");
const Subscribers = require("./subscribers");
const Enquiries = require("./enquiries");
const EmailSmsTemplates = require("./email_sms_templates");
const Settings = require("./settings");
const Orders = require("./orders");
const OrdersProducts = require("./orders_products");
const OrdersCoupons = require("./orders_coupons");
const OrdersHistories = require("./orders_histories");
const OrderAddresses = require("./orders_addresses");
const Carts = require("./carts");
const Wishlists = require("./wishlist")
const CartProducts = require("./cart_products");
const Payments = require("./payments");

Users.belongsToMany(Roles, { through: UsersRoles, hooks: true });

Roles.belongsToMany(Users, { through: UsersRoles, hooks: true });
Roles.belongsToMany(Menus, { through: RolesMenus, onDelete: 'CASCADE' });

Zones.belongsTo(Countries, { onDelete: 'CASCADE', hooks: true });
Countries.hasMany(Zones);

GeoZones.belongsToMany(Zones, { through: GeoZonesZones, onDelete: 'CASCADE' });
Zones.belongsToMany(GeoZones, { through: GeoZonesZones, onDelete: 'CASCADE' });

Taxes.belongsTo(GeoZones);
TaxClasses.belongsToMany(Taxes, { through: TaxesClasses });

Categories.belongsTo(Uploads, { as: "media", foreignKey: "uploadId", targetKey: "id" })
Categories.belongsTo(Uploads, { as: 'subCategory', foreignKey: "subCategoryId", targetKey: "id" });
Categories.belongsTo(Uploads, { as: 'icon', foreignKey: "iconId", targetKey: "id" });

FilterValues.belongsTo(Filters, { as: "filterGroup", foreignKey: "filterId", targetKey: "id" });
Filters.hasMany(FilterValues, { as: "filterValues" });

AttributeValues.belongsTo(Attributes, { as: "attributeGroup", foreignKey: "attributeId", targetKey: "id" });
Attributes.hasMany(AttributeValues, { as: "attributeValues" });

// Product relationship
Products.belongsTo(TaxClasses, { as: "taxClass", foreignKey: "taxClassId", targetKey: "id" });
Products.belongsTo(LengthClasses, { as: "lengthClass", foreignKey: "lengthClassId", targetKey: "id" });
Products.belongsTo(WeightClasses, { as: "weightClass", foreignKey: "weightClassId", targetKey: "id" });
Products.belongsTo(Uploads, { as: "featuredImage", foreignKey: "uploadId", targetKey: "id" });

Products.belongsToMany(Categories, { through: ProductsCategories, as: "categories", foreignKey: "productId", otherKey: "categoryId" });
Categories.belongsToMany(Products, { through: ProductsCategories, as: "products", foreignKey: "categoryId", otherKey: "productId" });

Products.belongsToMany(Uploads, { through: ProductsUploads, as: "thumbnails", foreignKey: "productId", otherKey: "uploadId" });
Uploads.belongsToMany(Products, { through: ProductsUploads, as: "products", foreignKey: "uploadId", otherKey: "productId" });

Products.belongsToMany(FilterValues, { through: ProductsFilterValues, as: "filters", foreignKey: "productId", otherKey: "filterValueId" });
FilterValues.belongsToMany(Products, { through: ProductsFilterValues, as: "products", foreignKey: "filterValueId", otherKey: "productId" });

Products.belongsToMany(AttributeValues, { through: ProductsAttributeValues, as: "attributes", foreignKey: "productId", otherKey: "attributeValueId" });
AttributeValues.belongsToMany(Products, { through: ProductsAttributeValues, as: "products", foreignKey: "attributeValueId", otherKey: "productId" })
// Product relationship end

Coupons.belongsToMany(Categories, { through: CouponsCategories, as: "categories", foreignKey: "couponId", otherKey: "categoryId" });
Categories.belongsToMany(Coupons, { through: CouponsCategories, as: "coupons", foreignKey: "categoryId", otherKey: "couponId" });
Coupons.belongsToMany(Users, { through: CouponsUsers, as: "users", foreignKey: "couponId", otherKey: "userId" });

Sliders.belongsTo(Uploads, { as: "media", foreignKey: "uploadId", targetKey: "id" })
Sliders.belongsTo(Uploads, { as: 'mobileMedia', foreignKey: "mobileUploadId", targetKey: "id" });

Addresses.belongsTo(Users, { as: "user", foreignKey: "userId", targetKey: "id" });
Addresses.belongsTo(Countries, { as: "country", foreignKey: "country_id", targetKey: "id" });
Addresses.belongsTo(Zones, { as: "zone", foreignKey: "zoneId", targetKey: "id" });

Orders.belongsToMany(Products, { through: OrdersProducts, as: "products", foreignKey: "orderId", otherKey: "productId" });
Products.belongsToMany(Orders, { through: OrdersProducts, as: "orders", foreignKey: "productId", otherKey: "orderId" });
Orders.belongsToMany(Coupons, { through: OrdersCoupons, as: "coupons", foreignKey: "orderId", otherKey: "couponId" });
Coupons.belongsToMany(Orders, { through: OrdersCoupons, as: "orders", foreignKey: "couponId", otherKey: "orderId" });
Orders.hasMany(OrdersHistories, { as: "histories" });
Orders.belongsTo(Users, { as: "user", foreignKey: "userId", targetKey: "id" });
Orders.belongsTo(OrderAddresses, { as: "shippingAddress", foreignKey: "shippingAddressId", targetKey: "id" });
Orders.hasMany(Payments, { as: "payments" });

Carts.belongsTo(Users, { as: "user", foreignKey: "userId", targetKey: "id" });
Carts.belongsTo(Coupons, { as: "coupon", foreignKey: "couponId", targetKey: "id" });
Carts.belongsTo(Addresses, { as: "address", foreignKey: "addressId", targetKey: "id" });
Carts.belongsToMany(Products, { through: CartProducts, as: "products", foreignKey: "cartId", otherKey: "productId" });

Wishlists.belongsTo(Users, { as: "user" })
Wishlists.belongsTo(Products, { as: "product" })

module.exports = {
    Users, Roles, Menus, RolesMenus, UsersRoles, Countries, Zones, Currencies, GeoZones, GeoZonesZones, Taxes, TaxClasses,
    WeightClasses, LengthClasses, Uploads, Categories, Filters, FilterValues, Attributes, AttributeValues, Coupons, Products,
    ProductsAttributeValues, ProductsFilterValues, ProductsCategories, ProductsUploads, CouponsCategories, CouponsUsers, Sliders,
    Addresses, Subscribers, Imports, Enquiries, EmailSmsTemplates, Settings, Orders, OrdersProducts, OrdersCoupons, OrderAddresses,
    OrdersHistories, Carts, Wishlists, Payments
}