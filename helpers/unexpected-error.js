const moment = require("moment")
const { parse } = require("useragent")
const { getClientIp } = require("request-ip")
const winston = require("winston")
const { KIND_OF_LOCAL, KIND_OF_REMOTE } = require("../constants/environment")
const botele = require("./bot-telegram")

const attrBuilder = (error, req) => {
  const attr = {}

  attr.time = moment().format("YYYY/MM/DD HH:mm:ss")
  attr.env = process.env.APP_ENV
  attr.appId = process.env.APP_ID
  attr.appVersion = process.env.APP_VERSION
  attr.appKind = process.env.APP_KIND
  attr.userIp = getClientIp(req)
  attr.userAgent = req.headers ? parse(req.headers["user-agent"]) : null
  attr.ssoId = req.user ? req.user.ssoId : null
  attr.error = error.error ? error.error : null
  attr.stack = error.stack ? error.stack : null
  attr.details = error.details ? error.details : null
  attr.headers = req.headers
  delete attr.headers["x-auth-token"]
  attr.params = req.params
  attr.query = req.query
  attr.body = req.body

  return attr
}

const logBuilder = (attr) => {
  if (process.env.APP_ENV.includes(KIND_OF_LOCAL))
    winston.error({
      message: attr.error.message,
      level: "error",
      stack: attr.stack || attr.details,
    })

  if (process.env.APP_ENV.includes(KIND_OF_REMOTE))
    winston.error({
      message: attr.stack,
      level: "error",
      stack: attr.stack || attr.details,
    })

  if (
    process.env.BOT_IS_ACTIVE == "true" &&
    process.env.APP_ENV.includes(KIND_OF_REMOTE)
  )
    botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, attr)
}

module.exports = (error, req, res, next) => {
  const buildError = {
    error: {
      httpCode: 500,
      code: 500,
      message: "terjadi kesalahan internal di sistem",
      cause: "internal sistem",
    },
    stack: error.stack,
  }
  const attr = attrBuilder(buildError, req)
  logBuilder(attr)

  return res.status(500).send({
    code: attr.error.code,
    httpCode: 500,
    message: attr.error.message,
  })
}
