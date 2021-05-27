const { DataTypes, Model } = require("sequelize");
const seqConnection = require("./connection");
const fs = require("fs");

class Uploads extends Model { }

Uploads.init({
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    fullUrl: {
        type: DataTypes.VIRTUAL,
        get() {
            return `${process.env.WEB_URL + this.url}`;
        }
    },
    thumbnailUrl: {
        type: DataTypes.VIRTUAL,
        get() {
            if (fs.existsSync(this.path.replace(".", "-350x350."))) {
                return `${process.env.WEB_URL + this.url.replace(".", "-350x350.")}`;
            } else {
                let ext = this.path.split(".");
                ext = ext[ext.length - 1];
                if (ext.toLowerCase() === "svg" && fs.existsSync(this.path)) {
                    return `${process.env.WEB_URL + this.url}`;
                }
                return `${process.env.WEB_URL + "/images/placeholder.webp"}`;
            }
        }
    },
    miniThumbnailUrl: {
        type: DataTypes.VIRTUAL,
        get() {
            if (fs.existsSync(this.path.replace(".", "-100x100."))) {
                return `${process.env.WEB_URL + this.url.replace(".", "-100x100.")}`;
            } else {
                let ext = this.path.split(".");
                ext = ext[ext.length - 1];
                if (ext.toLowerCase() === "svg" && fs.existsSync(this.path)) {
                    return `${process.env.WEB_URL + this.url}`;
                }
                return `${process.env.WEB_URL + "/images/placeholder.webp"}`;
            }
        }
    }
}, {
    sequelize: seqConnection,
    underscored: true,
    modelName: "uploads",
    paranoid: true
})

module.exports = Uploads;