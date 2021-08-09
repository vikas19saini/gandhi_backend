const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");

class Addresses extends Model { }

Addresses.init({
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(225),
        allowNull: false
    },
    countryId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    zoneId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    postcode: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    isDefault: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    completeAddress: {
        type: new DataTypes.VIRTUAL,
        get: function () {
            let shippingAddressArr = [];
            
            if (this.address)
                shippingAddressArr.push(this.address);

            if (this.city)
                shippingAddressArr.push(this.city);

            if (this.zone)
                shippingAddressArr.push(this.zone.name);

            if (this.country)
                shippingAddressArr.push(this.country.name);

            if (this.postcode)
                shippingAddressArr.push(this.postcode);

            if (this.phone)
                shippingAddressArr.push(this.phone);

            return shippingAddressArr.join(", ");
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "addresses",
    paranoid: true
});

module.exports = Addresses;