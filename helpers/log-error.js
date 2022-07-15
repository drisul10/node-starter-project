const moment = require("moment")
const { parse } = require("useragent")
const { getClientIp } = require("request-ip")
const { error } = require("winston")
const { KIND_OF_LOCAL, KIND_OF_REMOTE } = require("../constants/environment")
const botele = require("../helpers/bot-telegram")

const attrBuilder = (error, req) => {
  const attr = {}

  attr.time = moment().format("YYYY/MM/DD HH:mm:ss")
  attr.env = process.env.APP_ENV
  attr.appId = process.env.APP_ID
  attr.appKind = process.env.APP_KIND
  attr.appVersion = process.env.APP_VERSION
  attr.userIp = getClientIp(req)
  attr.userAgent = req.headers ? parse(req.headers["user-agent"]) : null
  attr.ssoId = req.user ? req.user.ssoId : null
  attr.error = error.error ? error.error : null
  attr.stack = error.stack ? error.stack : null
  attr.details = error.details ? error.details : null

  return attr
}

const logBuilder = (attr) => {
  if (process.env.APP_ENV.includes(KIND_OF_LOCAL))
    error({
      message: attr.error.message,
      level: "error",
      stack: attr.stack || attr.details,
    })

  if (process.env.APP_ENV.includes(KIND_OF_REMOTE))
    error({
      message: attr,
      level: "error",
      stack: attr.stack || attr.details,
    })

  if (
    process.env.BOT_IS_ACTIVE == "true" &&
    process.env.APP_ENV.includes(KIND_OF_REMOTE)
  )
    botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, attr)
}

module.exports = (error, req) => {
  const attr = attrBuilder(error, req)
  logBuilder(attr)

  return attr
}
