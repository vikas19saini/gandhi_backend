const route = require("express").Router();
const { Imports, AttributeValues, FilterValues, TaxClasses, LengthClasses, WeightClasses, Uploads, Products,
    ProductsAttributeValues, ProductsCategories, ProductsFilterValues, ProductsUploads } = require("../../models/index");
const multer = require("multer");
const fs = require("fs");
const extract = require("extract-zip");
const readXlsxFile = require('read-excel-file/node');
var rimraf = require("rimraf");
const Categories = require("../../models/categories");
const dateFormat = require('dateformat');
let logs = "";
const sharp = require('sharp');
const seqConnection = require("../../models/connection");
const allowedFileFormats = ['png', 'jpg', 'jpeg'];
var xlsx = require('json-as-xlsx');

const schema = {
    sku: {
        prop: 'sku',
        type: String,
        required: true
    }, name: {
        prop: 'name',
        type: String,
        required: true
    }, shortDescription: {
        prop: 'shortDescription',
        type: String
    }, longDescription: {
        prop: 'longDescription',
        type: String
    }, tags: {
        prop: 'tags',
        type: String
    }, categories: {
        prop: 'categories',
        required: true,
        type: String
    }, attributes: {
        prop: 'attributes',
        type: String
    }, attributeValues: {
        prop: 'attributeValues',
        type: String
    }, filters: {
        prop: 'filters',
        type: String
    }, ragularPrice: {
        prop: 'ragularPrice',
        type: Number,
        required: true
    }, salePrice: {
        prop: 'salePrice',
        type: Number
    }, tax: {
        prop: 'tax',
        type: String
    }, quantity: {
        prop: 'quantity',
        type: String
    }, manageStock: {
        prop: 'manageStock',
        type: (value) => {
            if (value.toLocaleLowerCase() === "yes")
                return 1
            return 0
        }
    }, minOrderQuantity: {
        prop: 'minOrderQuantity',
        type: Number,
    }, maxOrderQuantity: {
        prop: 'maxOrderQuantity',
        type: Number
    }, step: {
        prop: 'step',
        type: String
    }, shippingLength: {
        prop: 'shippingLength',
        type: Number
    }, shippingWidth: {
        prop: 'shippingWidth',
        type: Number
    }, shippingHeight: {
        prop: 'shippingHeight',
        type: Number
    }, shippingWeight: {
        prop: 'shippingWeight',
        type: Number,
        required: true
    }, lengthClass: {
        prop: 'lengthClass',
        type: String
    }, weightClass: {
        prop: 'weightClass',
        type: Number
    }, image: {
        prop: 'image',
        /* required: true, */
        type: String
    }, thumbnails: {
        prop: 'thumbnails',
        type: String
    }, status: {
        prop: 'status',
        type: (value) => {
            if (value.trim().toLocaleLowerCase() === 'live')
                return 1
            return 0
        }
    }, stockStatus: {
        prop: 'stockStatus',
        type: (value) => {
            if (value.trim().toLocaleLowerCase() === 'in')
                return 1
            return 0
        }
    }
}

var storage = multer.diskStorage({
    destination: process.env.IMPORT_DIR,
    filename: (req, file, cb) => {
        let fileName = file.originalname;
        if (fs.existsSync(process.env.IMPORT_DIR + file.originalname)) {
            fileName = Date.now() + file.originalname;
        }

        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(zip)$/i)) {
            return cb(new Error('Invalid file format .zip format allowed!!'))
        }

        cb(null, true)
    }
});

route.get("/", (req, res) => {
    let params = {
        order: [
            ['id', 'DESC']
        ]
    };

    if (req.query.limit) {
        params.limit = parseInt(req.query.limit);
    }

    if (req.query.offset) {
        params.offset = parseInt(req.query.offset);
    }

    Imports.findAndCountAll(params).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
});

route.post("/", upload.single('file'), async (req, res) => {
    try {
        const folderPath = process.env.IMPORT_DIR + Date.now();
        const zipPath = process.env.IMPORT_DIR + req.file.filename;

        // Creating new directory
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) throw err;
        });

        // Extracting zip file
        await extract(zipPath, { dir: folderPath });
        const f = await Imports.create({
            path: folderPath
        });
        fs.unlinkSync(zipPath);

        readXlsxFile(f.path + "/products.xlsx").then(async (rows) => {
            await Imports.update({
                total: rows.length - 1
            }, {
                where: {
                    id: f.id
                }
            })
        }).catch(error => {
            return res.json(error);
        })

        return res.json(f);
    } catch (error) {
        return res.status(400).json(error);
    }
});


route.get("/:id", (req, res) => {
    Imports.findByPk(req.params.id).then((data) => {
        return res.json(data);
    }).catch((err) => {
        return res.status(404).json(err);
    })
});

route.delete("/:id", async (req, res) => {

    try {
        const file = await Imports.findByPk(req.params.id);

        if (fs.existsSync(file.path)) {
            rimraf.sync(file.path);
        }

        Imports.destroy({
            where: {
                id: req.params.id
            }
        });
        return res.json({ message: "Successfully deleted" });
    } catch (error) {
        return res.status(500).json(error);
    }
});

route.get("/errorExcel/:id", async (req, res) => {
    const im = await Imports.findByPk(req.params.id);
    const productsList = await readXlsxFile(im.path + "/products.xlsx", { schema });

    if (productsList.errors.length > 0) {
        return res.status(500).json(productsList.errors);
    }

    let toFile = [];

    for (item of productsList.rows) {
        try {
            await Products.findAll({
                where: {
                    sku: item.sku.trim()
                },
                rejectOnEmpty: true
            });
        } catch (e) {
            toFile.push(item);
        }
    }

    let columns = [];

    for (let index in toFile[0]) {
        columns.push({
            label: index,
            value: index
        });
    }

    let errorFile = xlsx(columns, toFile, {
        sheetName: 'Sheet1', // The name of the sheet
        fileName: 'errorUpload', // The name of the spreadsheet
        extraLength: 3, // A bigger number means that columns should be wider
        writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
    }, false);

    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-disposition': `attachment; filename=errorUpload.xlsx`
    })
    return res.send(errorFile);
});

route.get("/deleteProducts/:id", async (req, res) => {

    const im = await Imports.findByPk(req.params.id);
    const productsList = await readXlsxFile(im.path + "/products.xlsx", { schema });

    if (productsList.errors.length > 0) {
        return res.status(500).json(productsList.errors);
    }

    for (item of productsList.rows) {
        try {

            let uploadIdsToDeleteonUpdate = [];
            let thumbs = await Products.findOne({
                where: { sku: item.sku },
                include: [{
                    model: Uploads,
                    as: "thumbnails",
                    required: false
                }],
                rejectOnEmpty: true
            });

            /* console.log(thumbs.id); */

            if (thumbs.uploadId) {
                uploadIdsToDeleteonUpdate.push(thumbs.uploadId);
            }

            for (let up of thumbs.thumbnails) {
                uploadIdsToDeleteonUpdate.push(up.id);
            }

            let previousImages = await Uploads.findAll({
                where: {
                    id: uploadIdsToDeleteonUpdate
                }
            });

            await seqConnection.transaction(async (t) => {
                await Products.destroy({
                    where: {
                        id: thumbs.id
                    }, transaction: t
                });
                await ProductsAttributeValues.destroy({
                    where: {
                        productId: thumbs.id
                    }, transaction: t
                });
                await ProductsCategories.destroy({
                    where: {
                        productId: thumbs.id
                    }, transaction: t
                });
                await ProductsUploads.destroy({
                    where: {
                        productId: thumbs.id
                    }, transaction: t
                });
                await ProductsFilterValues.destroy({
                    where: {
                        productId: thumbs.id
                    }, transaction: t
                });

                await Uploads.destroy({
                    where: {
                        id: uploadIdsToDeleteonUpdate
                    }, transaction: t
                });
            });

            for (let up of previousImages) {
                if (fs.existsSync(up.path)) {
                    fs.unlinkSync(up.path);
                    fs.unlinkSync(up.path.replace(/\.(?=[^.]*$)/, "-100x100."));
                    fs.unlinkSync(up.path.replace(/\.(?=[^.]*$)/, "-350x350."));
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    await Imports.update({
        success: 0,
        updated: 0,
        error: 0,
        status: 0
    }, {
        where: {
            id: parseInt(req.params.id)
        }
    });

    return res.json({ message: "Successfully deleted!" });
});

route.get("/start/:id", async (req, res) => {

    const im = await Imports.findByPk(req.params.id);
    const productsList = await readXlsxFile(im.path + "/products.xlsx", { schema });

    if (productsList.errors.length > 0) {
        return res.status(500).json(productsList.errors);
    }

    fs.appendFileSync(im.path + "/logs.txt", "", (error) => {
        if (error) {
            return res.status(500).json({ message: "Unable to create log file:" });
        }
    });

    logs = fs.createWriteStream(im.path + "/logs.txt", {
        flags: "a"
    })

    let created = updated = errors = 0;
    let uploadIdsToDeleteonUpdate = [];

    for (item of productsList.rows) {
        try {
            writeToLog(`*** Importing SKU : '${item.sku}' ***`);
            if (item.hasOwnProperty('categories')) {
                writeToLog("Fetching categories of the product");
                let categoryIds = await getCtaegories(item.categories);
                item.categories = categoryIds;
            }

            if (item.hasOwnProperty("attributes") && item.hasOwnProperty("attributeValues")) {
                writeToLog("Fetching attributes & their values");
                let attributes = await mapAttributes(item.attributes, item.attributeValues);
                item.attributes = attributes;
            }

            if (item.hasOwnProperty('filters')) {
                writeToLog("Fetching filters & their values");
                let filterIds = await mapFilters(item.filters);
                item.filters = filterIds;
            }

            if (item.hasOwnProperty('tax')) {
                writeToLog("Fetching tax class & their values");
                let taxClassId = await getTaxClass(item.tax);
                item.taxClassId = taxClassId;
            }

            if (item.hasOwnProperty('lengthClass')) {
                writeToLog("Fetching lenght class");
                let lengthClassId = await getLengthClass(item.lengthClass);
                item.lengthClassId = lengthClassId;
            } else {
                writeToLog("Fetching lenght class");
                let lengthClassId = await getLengthClass(false);
                item.lengthClassId = lengthClassId;
            }

            if (item.hasOwnProperty('weightClass')) {
                writeToLog("Fetching weight class");
                let weightClassId = await getWeightClass(item.weightClass);
                item.weightClassId = weightClassId;
            } else {
                writeToLog("Fetching weight class");
                let weightClassId = await getWeightClass(false);
                item.weightClassId = weightClassId;
            }

            if (item.hasOwnProperty("image")) {
                writeToLog("Uploading featured image");
                let imageId = await mapMedias(item.image, im); // featured image;
                item.uploadId = imageId[0];
            }

            if (req.query.requestType === "update") {
                let thumbs = await Products.findOne({
                    where: { sku: item.sku },
                    include: ["thumbnails", "featuredImage"],
                });

                if (item.hasOwnProperty("image")) {
                    uploadIdsToDeleteonUpdate.push(thumbs.uploadId);
                }

                if (item.hasOwnProperty("thumbnails")) {
                    for (let up of thumbs.thumbnails) {
                        uploadIdsToDeleteonUpdate.push(up.id);
                    }
                }
            }

            if (item.hasOwnProperty("thumbnails")) {
                writeToLog("Uploading thumbnails image");
                let thumbnailsId = await mapMedias(item.thumbnails, im); // thumbnails image;
                item.thumbnails = thumbnailsId;
            }

            if (req.query.requestType === "create") {
                item.slug = item.name + "-" + item.sku;
                item.slug = item.slug.toLocaleLowerCase().replace(/ /g, "");
            }

            const createProduct = await seqConnection.transaction(async (t) => {
                let product = null;
                if ((req.query.requestType === "update") && (item.sku)) {
                    await Products.update(item, { where: { sku: item.sku }, transaction: t });
                    product = await Products.findOne({
                        where: {
                            sku: item.sku
                        }, transaction: t
                    });
                } else {
                    product = await Products.create(item, { transaction: t });
                }

                if (item.hasOwnProperty("categories")) {
                    if (req.query.requestType === "update") {
                        await ProductsCategories.destroy({ where: { productId: product.id }, transaction: t });
                    }
                    await product.addCategories(item.categories, { transaction: t })
                }

                if (item.hasOwnProperty("filters")) {
                    if (req.query.requestType === "update") {
                        await ProductsFilterValues.destroy({ where: { productId: product.id }, transaction: t });
                    }
                    await product.addFilters(item.filters, { transaction: t });
                }

                if (item.hasOwnProperty("thumbnails")) {
                    if (req.query.requestType === "update") {
                        await ProductsUploads.destroy({ where: { productId: product.id }, transaction: t });
                    }
                    await product.addThumbnails(item.thumbnails, { transaction: t });
                }

                if (item.hasOwnProperty("attributes")) {
                    if (req.query.requestType === "update") {
                        await ProductsAttributeValues.destroy({ where: { productId: product.id }, transaction: t });
                    }
                    for (attr of item.attributes) {
                        await product.addAttributes([attr.id], { through: { attributeDescription: attr.value }, transaction: t });
                    }
                }

                return product;
            });

            if (req.query.requestType === "create")
                created++;
            else
                updated++

        } catch (err) {
            errors++;
            console.log(err);
            writeToLog(err.message);
        }
    }

    writeToLog("Deleting previous images");
    let previousImages = await Uploads.findAll({
        where: {
            id: uploadIdsToDeleteonUpdate
        }
    });

    for (let up of previousImages) {
        if (fs.existsSync(up.path)) {
            fs.unlinkSync(up.path);
            fs.unlinkSync(up.path.replace(/\.(?=[^.]*$)/, "-100x100."));
            fs.unlinkSync(up.path.replace(/\.(?=[^.]*$)/, "-350x350."));
        }
    }

    await Uploads.destroy({
        where: {
            id: uploadIdsToDeleteonUpdate
        }
    });

    logs.end();

    await Imports.update({
        success: created,
        updated: updated,
        error: errors,
        status: 1
    }, {
        where: {
            id: req.params.id
        }
    });

    return res.json({ message: "Import successfully run" });
});


async function getCtaegories(categories) {
    categories = categories.toString();
    categories = (categories.indexOf("||") > -1) ? categories.split("||") : [categories.trim()];

    let categoryIds = [];
    for (slug of categories) {
        let category = await Categories.findBySlug(slug);

        if (category) {
            categoryIds.push(category.id);
        } else {
            writeToLog(`Category with slug name '${slug}' is not found`);
        }
    }

    return categoryIds;
}

async function mapAttributes(attributes, attributeValues) {
    let attributeObjs = [];

    try {
        attributes = attributes.toString();
        attributeValues = attributeValues.toString();

        attributes = (attributes.indexOf("||") > -1) ? attributes.split("||") : [attributes];
        attributeValues = (attributeValues.indexOf("||") > -1) ? attributeValues.split("||") : [attributeValues];

        if (attributes.length !== attributeValues.length) {
            writeToLog("Attribute & their values are not match");
            return attributeObjs;
        }

        for (index in attributes) {
            let attribute = await AttributeValues.findOne({
                where: {
                    name: attributes[index].trim()
                }
            });

            if (attribute) {
                attributeObjs.push({
                    id: attribute.id,
                    value: attributeValues[index]
                })
            } else {
                writeToLog(`Attribute with name ${attributes[index]} is not found`);
            }
        }
    } catch (error) {
        writeToLog(`*Exception - attribute name & their values are invalid`);
    }

    return attributeObjs;
}

async function mapFilters(filters) {
    filters = filters.toString()
    filters = filters.indexOf("||") > -1 ? filters.split("||") : [filters.trim()]
    let filterIds = []

    for (f of filters) {
        let filter = await FilterValues.findOne({
            where: {
                name: f.trim()
            }
        })

        if (filter)
            filterIds.push(filter.id);
        else
            writeToLog(`Filter with name ${f} is not found`);
    }

    return filterIds;
}

async function getTaxClass(className) {
    let taxClass = await TaxClasses.findOne({
        where: {
            title: className.trim()
        }
    })

    return taxClass ? taxClass.id : null
}

async function getLengthClass(className) {
    let cond = {};

    if (!className) {
        cond = {
            where: {
                isDefault: 1
            }
        }
    } else {
        cond = {
            where: {
                title: className.trim()
            }
        }
    }

    let lClass = await LengthClasses.findOne(cond);

    if (lClass) {
        return lClass.id;
    }

    writeToLog("Lenght class not found");
    return null;
}

async function getWeightClass(className) {
    let cond = {};

    if (!className) {
        cond = {
            where: {
                isDefault: 1
            }
        }
    } else {
        cond = {
            where: {
                title: className.trim()
            }
        }
    }

    let wClass = await WeightClasses.findOne(cond);

    if (wClass) {
        return wClass.id;
    }

    writeToLog("Weight class not found");
    return null;
}

async function mapMedias(files, importDir) {
    let fileIds = [];
    try {
        files = files.indexOf("||") > -1 ? files.split("||") : [files.trim()];
        for (let file of files) {
            file = file.trim();
            let extesnion = file.split(".");
            extesnion = extesnion[extesnion.length - 1];
            extesnion = extesnion.toLocaleLowerCase();
            let destName = Date.now() + "." + extesnion;

            let filePath = `${importDir.path}/${file}`
            let copyTo = process.env.UPLOAD_DIR + destName

            if (!fs.existsSync(filePath)) {
                writeToLog(`File ${filePath} not found`);
                continue;
            }

            fs.copyFileSync(filePath, copyTo) // copying file to upload dir

            if (allowedFileFormats.includes(extesnion.toLocaleLowerCase())) {
                writeToLog("Creating image thumbnails")
                sharp(filePath).resize(100, 100, {
                    fit: sharp.fit.inside
                }).jpeg({ quality: 100 }).toFile(`${process.env.UPLOAD_DIR + destName.replace(".", "-100x100.")}`)
                sharp(filePath).resize(350, 350, {
                    fit: sharp.fit.inside
                }).jpeg({ quality: 100 }).toFile(`${process.env.UPLOAD_DIR + destName.replace(".", "-350x350.")}`)
            }

            let up = await Uploads.create({
                name: destName,
                url: process.env.UPLOAD_PATH + destName,
                path: copyTo
            })
            fileIds.push(up.id);
            writeToLog("File successfully created & saved")
        }

    } catch (error) {
        console.log(error)
        writeToLog(`File could not be moved`)
    }

    return fileIds;
}

function writeToLog(message) {
    message = message + " : " + dateFormat(new Date(), "isoDateTime");
    logs.write(`>>> ${message}\n`);
}

module.exports = route;