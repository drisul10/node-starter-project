const { verify } = require("jsonwebtoken")
const { UNAUTHORIZED, BAD_TOKEN } = require("../constants/error")
const logerr = require("../helpers/log-error")
const { default: localizify, t } = require("localizify")

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token")
  if (!token) {
    logerr({ error: UNAUTHORIZED }, req)

    localizify.setLocale(req.headers["locale"] || "id")
    return res.status(UNAUTHORIZED.httpCode).send({
      errorCode: UNAUTHORIZED.httpCode,
      message: t(UNAUTHORIZED.message),
    })
  }

  try {
    const decoded = verify(token, process.env.JWT_PRIVATE_KEY)
    req.user = decoded
    next()
  } catch (error) {
    logerr({ error: BAD_TOKEN }, req)

    localizify.setLocale(req.headers["locale"] || "id")
    return res.status(BAD_TOKEN.httpCode).send({
      errorCode: BAD_TOKEN.httpCode,
      message: t(BAD_TOKEN.message),
    })
  }
}
