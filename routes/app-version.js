const router = require("express").Router()
const { BaseRoute } = require("./_base")
const AppVersionQuery = require("../queries/app-version").Query
const AppVersion = new AppVersionQuery()
const ValInput = require("../validations/app-version")

class Route extends BaseRoute {
  getLatest(optRoles) {
    optRoles = this.optValidateRoles(optRoles)

    this.router.get(
      "/latest",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // get next latest year
        const latest = await AppVersion.getLatest()

        return res.status(200).send(latest)
      }
    )
  }
}

const route = new Route(router, AppVersion, ValInput)
const { DEVELOPER } = Route.ctRole
route.create({ allowRoles: DEVELOPER.id })
route.getsAll({ noSignIn: true })
route.getLatest({ noSignIn: true })
route.getById({ noSignIn: true })
route.updateById({ allowRoles: DEVELOPER.id })
route.switchLockById({ allowRoles: DEVELOPER.id })
route.deleteSoftById({ allowRoles: DEVELOPER.id })
route.reviveById({ allowRoles: DEVELOPER.id })
route.deleteHardById({ allowRoles: DEVELOPER.id })

module.exports = router
