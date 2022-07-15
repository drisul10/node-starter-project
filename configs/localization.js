const { default: localizify } = require("localizify")

module.exports = (app) => {
  app.use((req, _, next) => {
    localizify.setLocale(req.headers["locale"] || "id")
    next()
  })
  const en = require("../locales/en/lang.json")
  const id = require("../locales/id/lang.json")

  localizify.add("en", en).add("id", id).setLocale("en")
}
