const { BAD_ROLE_CONFIG, FORBIDDEN } = require("../constants/error")
const logerr = require("../helpers/log-error")

module.exports = function validateRoles({
  t,
  allowRoles: allowRoles = [],
  allowAppIds: allowAppIds = [process.env.APP_ID],
  allowAppKinds: allowAppKinds = [process.env.APP_KIND, "ANDROID"],
  allowAllApps: allowAllApps = false,
  allowAllAppIds: allowAllAppIds = false,
  allowAllAppKinds: allowAllAppKinds = false,
  onlyGroupRoles: onlyGroupRoles = false,
  withGroupRoles: withGroupRoles = false,
  funLoc: funLoc = null,
  req = null,
  res = null,
}) {
  if (allowRoles === true) return { OK: true }
  if (!Array.isArray(req.user.roles)) req.user.roles = [req.user.roles]
  if (!Array.isArray(req.user.groupRoles))
    req.user.groupRoles = [req.user.groupRoles]
  const userRoles = withGroupRoles
    ? req.user.groupRoles.concat(req.user.roles)
    : onlyGroupRoles
    ? req.user.groupRoles
    : req.user.roles

  if (
    (!Array.isArray(allowRoles) && typeof allowRoles != "string") ||
    (!Array.isArray(allowAppIds) && typeof allowAppIds != "string") ||
    (!Array.isArray(allowAppKinds) && typeof allowAppKinds != "string")
  ) {
    logerr(
      {
        error: BAD_ROLE_CONFIG,
        funLoc: funLoc,
        details: {
          allowAllApps: allowAllApps,
          allowAllAppIds: allowAllAppIds,
          allowAllAppKinds: allowAllAppKinds,
          allowedRoles: allowRoles,
          userRoles: userRoles,
          onlyGroupRoles: onlyGroupRoles,
          withGroupRoles: withGroupRoles,
          userGroupRoles: req.user.groupRoles,
          allowAppIds: allowAppIds,
          userAppIds: req.user.appId,
          allowAppKinds: allowAppKinds,
          userAppKinds: req.user.appKind,
        },
      },
      req
    )

    res.status(BAD_ROLE_CONFIG.httpCode).send({
      errorCode: BAD_ROLE_CONFIG.httpCode,
      message: t(BAD_ROLE_CONFIG.message),
    })

    return { OK: false }
  } else {
    let match = false

    for (let role of userRoles) {
      if (!allowRoles) break

      if (Array.isArray(allowRoles))
        match = allowRoles.some((v2) => v2 === role)
      else if (typeof allowRoles === "string") match = allowRoles === role
      else break

      if (match) break
    }

    if (!allowAllApps) {
      if (!allowAllAppIds) {
        if (typeof allowAppIds === "string") allowAppIds = [allowAppIds]
        if (!allowAppIds.some((v) => v === req.user.appId)) match = false
      }
      if (!allowAllAppKinds) {
        if (typeof allowAppKinds === "string") allowAppKinds = [allowAppKinds]
        if (!allowAppKinds.some((v) => v === req.user.appKind)) match = false
      }
    }

    if (!match) {
      logerr(
        {
          error: FORBIDDEN,
          funLoc: funLoc,
          details: {
            allowAllApps: allowAllApps,
            allowAllAppIds: allowAllAppIds,
            allowAllAppKinds: allowAllAppKinds,
            allowedRoles: allowRoles,
            userRoles: userRoles,
            onlyGroupRoles: onlyGroupRoles,
            withGroupRoles: withGroupRoles,
            userGroupRoles: req.user.groupRoles,
            allowAppIds: allowAppIds,
            userAppIds: req.user.appId,
            allowAppKinds: allowAppKinds,
            userAppKinds: req.user.appKind,
          },
        },
        req
      )

      res
        .status(FORBIDDEN.httpCode)
        .send({ errorCode: FORBIDDEN.httpCode, message: t(FORBIDDEN.message) })

      return { OK: false }
    } else return { OK: true }
  }
}
