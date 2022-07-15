const appVersion = require("../routes/app-version")

module.exports = function (app) {
  app.use("/api/v1/app-version", appVersion)
}
