require("winston-mongodb")
require("express-async-errors")
const moment = require("moment")
const { format, add, transports, exceptions } = require("winston")
const botele = require("../helpers/bot-telegram")
const {
  REMOTE_PRODUCTION,
  KIND_OF_REMOTE,
} = require("../constants/environment")

const fmt = {
  format: format.combine(
    format.simple(),
    format.splat(),
    format.printf((msg) =>
      format
        .colorize()
        .colorize(
          msg.level,
          `[${
            process.env.APP_ID
          }/${msg.level.toUpperCase()}]    ${moment()}    ${msg.message} ${
            msg.stack ? "\n" + msg.stack : ""
          }`
        )
    )
  ),
}

module.exports = function () {
  // add console log
  add(new transports.Console(fmt))

  // add dbcolection log (production only)
  if (process.env.APP_ENV === REMOTE_PRODUCTION)
    add(
      new transports.MongoDB({
        level: "error",
        db: process.env.MONGO_URI_REMOTE_PROD,
        collection: "log-errors",
        options: { useUnifiedTopology: true },
      })
    )

  // add console log for exception
  exceptions.handle(new transports.Console(fmt))

  // add telegram notification on unhandled promise rejection (production only)
  process.on("unhandledRejection", (exception) => {
    if (
      process.env.BOT_IS_ACTIVE == "true" &&
      process.env.APP_ENV.includes(KIND_OF_REMOTE)
    )
      botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, attr)

    throw exception
  })
}
