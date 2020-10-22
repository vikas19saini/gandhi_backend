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







module.exports = {
    Users, Roles, Menus, RolesMenus, UsersRoles, Countries, Zones, Currencies, GeoZones, GeoZonesZones, Taxes, TaxClasses,
    WeightClasses, LengthClasses, Uploads, Categories, Filters, FilterValues, Attributes, AttributeValues, Coupons
}