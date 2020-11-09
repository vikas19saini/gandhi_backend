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
Categories.belongsTo(Uploads, { as: 'mobileMedia', foreignKey: "mobileUploadId", targetKey: "id" });

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

Addresses.belongsTo(Users, { as: "users", foreignKey: "userId", targetKey: "id" });
Addresses.belongsTo(Countries, { as: "countries", foreignKey: "country_id", targetKey: "id" });
Addresses.belongsTo(Zones, { as: "zones", foreignKey: "zoneId", targetKey: "id" });

module.exports = {
    Users, Roles, Menus, RolesMenus, UsersRoles, Countries, Zones, Currencies, GeoZones, GeoZonesZones, Taxes, TaxClasses,
    WeightClasses, LengthClasses, Uploads, Categories, Filters, FilterValues, Attributes, AttributeValues, Coupons, Products, ProductsAttributeValues,
    ProductsFilterValues, ProductsCategories, ProductsUploads, CouponsCategories, CouponsUsers, Sliders, Addresses, Imports
}