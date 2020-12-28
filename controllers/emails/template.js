const fs = require("fs")
const path = require("path")
const jade = require("jade")

module.exports = (templatePath, context) => {
    var templateName = path.join(path.join(global.appRootDir, "emails"), templatePath + ".jade")
    var template = fs.readFileSync(templateName, { encoding: "utf8" })
    var compiledTemplate = jade.compile(template, { filename: templateName })
    var html = compiledTemplate(context)

    return html
}