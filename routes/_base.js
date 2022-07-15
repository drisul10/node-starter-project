const axios = require("axios")
const authory = require("../middlewares/authory")
const unauthory = (req, res, next) => next()
const moment = require("moment")
const momentTZ = require("moment-timezone")
const validateRoles = require("../middlewares/validate-roles")
const ctRole = require("../constants/role")
const ctResOk = require("../constants/response-ok")
const Err = require("../helpers/errors")
const { setObject } = require("../helpers/man-object")
const { saveFiles, removeFile } = require("../helpers/file-upload")
const { state_isActive, state_isLocked, logs, app_v } =
  require("../models/_metadata").Fields
const { isValidInput } = require("../helpers/validate-input")
const { t } = require("localizify")

class BaseRoute {
  router = null
  static axios = axios
  static moment = moment
  static momentTZ = momentTZ
  validateRoles = validateRoles
  static authory = authory
  static ctRole = ctRole
  static ctResOk = ctResOk
  Query = null
  ValInput = null
  static Err = Err
  isValidInput = isValidInput
  t = t

  constructor(router, query, valInput) {
    BaseRoute.axios.defaults.baseURL = process.env.SSO_ENDPOINT
    this.router = router
    this.Query = query
    this.ValInput = valInput
  }

  /* decide to use auth token or not */
  auth(noSignIn) {
    if (noSignIn) return unauthory
    return authory
  }

  /* param options validate roles */
  optValidateRoles(opt) {
    return {
      t: this.t,
      allowRoles: opt ? opt.allowRoles || true : true,
      withGroupRoles: opt ? opt.withGroupRoles || false : false,
      onlyGroupRoles: opt ? opt.onlyGroupRoles || false : false,
      noSignIn: opt ? opt.noSignIn || false : false,
      req: null,
      res: null,
    }
  }

  /* param options files */
  optFiles(opt) {
    return {
      saveFiles: opt ? opt.saveFiles || false : false,
      isRequired: opt ? opt.isRequired || false : false,
      path: opt ? opt.path || process.env.PATH_FILES : process.env.PATH_FILES,
      fieldName: opt ? opt.fieldName || "file" : "file",
      ext: opt ? opt.ext || [] : [],
      maxSize: opt ? opt.maxSize || 5000000 : 5000000,
      isSingle: opt ? opt.isSingle || true : true,
    }
  }

  genMetadataLogs(req) {
    return {
      create: {
        userId: req.user ? req.user.ssoId : null,
        isoDate: moment().toISOString(),
      },
      update: { isoDate: moment().toISOString() },
    }
  }

  updMetadataLogs(logs, req) {
    const updLogs = logs
    updLogs.update.userId = req.user ? req.user.ssoId : null
    updLogs.update.isoDate = moment().toISOString()

    return updLogs
  }

  constantsToLocalize(arr, obj = ["name"]) {
    return arr.map((v) => {
      const c = JSON.parse(JSON.stringify(v))
      for (const field of obj) {
        c[field] = this.t(c[field])
      }

      return c
    })
  }

  constantToLocalize(cObj, obj = ["label"]) {
    const c = JSON.parse(JSON.stringify(cObj))
    for (const field of obj) {
      c[field] = this.t(c[field])
    }

    return c
  }

  /* create a document */
  create(optRoles, optFiles, optValidations) {
    optRoles = this.optValidateRoles(optRoles)
    optFiles = this.optFiles(optFiles)
    this.router.post(
      "/create",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // validate input
        let input = isValidInput(this.t, this.ValInput.save, req, res)
        if (!input) return

        // custom validation isExist
        if (optValidations && optValidations.isExist) {
          const validate = await optValidations.validateIsExist(req)
          if (!validate.OK)
            return BaseRoute.Err.dbNoRecord(this.t, validate.pattern, req, res)
        }

        // custom validation satisfy input
        if (optValidations && optValidations.isSatisfyInput) {
          const validate = await optValidations.validateSatisfyInput(
            this.t,
            req,
            input
          )
          if (!validate.OK)
            return BaseRoute.Err.unsatisfiedInput(
              this.t,
              validate.pattern,
              req,
              res
            )
        }

        // save files
        let prefix = null
        let files = null
        if (optFiles.saveFiles) {
          prefix = req.user.ssoId + process.env.PATH_PREFIX
          files = saveFiles(
            this.t,
            optFiles.path + prefix,
            optFiles.fieldName,
            {
              fieldIsRequired: optFiles.isRequired,
              allowedExtensions: optFiles.ext,
              maxSizeInBytes: optFiles.maxSize,
              single: optFiles.isSingle,
            },
            req,
            res
          )
          if (files.error) return

          // fill name files
          if (!files.empty) {
            if (optFiles.isSingle) input[optFiles.fieldName] = files.appliedName
            else input[optFiles.fieldName] = files.map((v) => v.appliedName)
          }
        }

        // fill input metadata
        input[logs.id] = this.genMetadataLogs(req)

        // save into DB
        this.Query.create(input)
          .then(async (_) => {
            return res.status(200).send(ctResOk.dbSave(this.t))
          })
          .catch((error) => {
            if (optFiles.saveFiles) {
              // remove files if any error on dbsave
              if (!files.empty) {
                if (optFiles.isSingle) {
                  const rm = removeFile(
                    optFiles.path + prefix,
                    files.appliedName,
                    req,
                    res
                  )
                  if (rm.error) return
                } else {
                  for (const file of files) {
                    const rm = removeFile(
                      optFiles.path + prefix,
                      file.appliedName,
                      req,
                      res
                    )
                    if (rm.error) return
                  }
                }
              }
            }

            return BaseRoute.Err.dbFailSave(this.t, error, req, res)
          })
      }
    )
  }

  /* get all documents */
  getsAll(optRoles) {
    optRoles = this.optValidateRoles(optRoles)

    this.router.get("/all", this.auth(optRoles.noSignIn), async (req, res) => {
      optRoles.req = req
      optRoles.res = res

      // validate roles
      if (!this.validateRoles(optRoles).OK) return

      // get from DB
      this.Query.getsByCriterias()
        .then((result) => {
          return res.status(200).send(result)
        })
        .catch((error) => {
          return BaseRoute.Err.dbFailOp(this.t, error, req, res)
        })
    })
  }

  /* get documents with paging */
  getsPaging(optRoles) {
    optRoles = this.optValidateRoles(optRoles)

    this.router.post(
      "/paging",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get documents (with paging options)
        const docs = await this.Query.getsPaging(req.body.optPaging)

        return res.status(200).send(docs)
      }
    )
  }

  /* get a document by ID */
  getById(optRoles, queryFunction = null) {
    optRoles = this.optValidateRoles(optRoles)

    this.router.get(
      "/one/:docId",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get document ID
        const docId = req.params.docId

        // validate input
        const valinput = this.ValInput.docId(this.t, docId)
        if (valinput.error)
          return BaseRoute.Err.invalidInput(this.t, valinput, req, res)

        // get from DB
        let fun = null
        if (!queryFunction) fun = this.Query.getById(valinput.value)
        else fun = eval("this.Query." + queryFunction + "(valinput.value)")

        fun
          .then((result) => {
            if (!result || result.length == 0)
              return BaseRoute.Err.dbNoRecord(this.t, valinput.value, req, res)

            if (Array.isArray(result)) result = result[0]

            return res.status(200).send(result)
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailOp(this.t, error, req, res)
          })
      }
    )
  }

  /* update a document by ID */
  updateById(optRoles, optFiles, optValidations) {
    optRoles = this.optValidateRoles(optRoles)
    optFiles = this.optFiles(optFiles)
    this.router.put(
      "/update/:docId",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get document ID
        const docId = req.params.docId

        // check is document exist
        const isExist = await this.Query.isSoftExist(docId)
        if (!isExist) return BaseRoute.Err.dbNoRecord(this.t, docId, req, res)

        // validate input
        let input = isValidInput(this.t, this.ValInput.save, req, res)
        if (!input) return

        // custom validation isExist
        if (optValidations && optValidations.isExist) {
          const validate = await optValidations.validateIsExist(req)
          if (!validate.OK)
            return BaseRoute.Err.dbNoRecord(this.t, validate.pattern, req, res)
        }

        // custom validation operation
        if (optValidations && optValidations.isOperation) {
          const validate = await optValidations.validateOperation(req, isExist)
          if (!validate.OK)
            return BaseRoute.Err.dbImmutableRecord(this.t, null, req, res)
        }

        // custom validation satisfy input
        if (optValidations && optValidations.isSatisfyInput) {
          const validate = await optValidations.validateSatisfyInput(
            this.t,
            req,
            input,
            true,
            docId
          )
          if (!validate.OK)
            return BaseRoute.Err.unsatisfiedInput(
              this.t,
              validate.pattern,
              req,
              res
            )
        }

        // update metadata
        input[logs.id] = this.updMetadataLogs(isExist[logs.id], req)

        // update to DB
        this.Query.updateById(docId, input)
          .then(async (_) => {
            return res.status(200).send(ctResOk.dbUpdate(this.t))
          })
          .catch((error) => {
            if (optFiles.saveFiles) {
              // remove files if any error on dbsave
              if (!files.empty) {
                if (optFiles.isSingle) {
                  const rm = removeFile(
                    optFiles.path + prefix,
                    files.appliedName,
                    req,
                    res
                  )
                  if (rm.error) return
                } else {
                  for (const file of files) {
                    const rm = removeFile(
                      optFiles.path + prefix,
                      file.appliedName,
                      req,
                      res
                    )
                    if (rm.error) return
                  }
                }
              }
            }

            return BaseRoute.Err.dbFailSave(this.t, error, req, res)
          })
      }
    )
  }

  /* switch statelock a document by ID */
  switchLockById(optRoles) {
    optRoles = this.optValidateRoles(optRoles)
    this.router.put(
      "/switch/statelock/:docId",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get document ID
        const docId = req.params.docId

        // validate ID
        const valId = this.ValInput.docId(this.t, docId)
        if (valId.error)
          return BaseRoute.Err.invalidInput(this.t, valId, req, res)

        // check is document exist
        const isExist = await this.Query.isSoftExist(valId.value)
        if (!isExist)
          return BaseRoute.Err.dbNoRecord(this.t, valId.value, req, res)

        // update state isLocked to DB
        this.Query.updateById(valId.value, {
          [state_isLocked.id]: !isExist.state.isLocked,
        })
          .then(() => {
            return res.status(200).send(ctResOk.dbFine(this.t))
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailOp(this.t, error, req, res)
          })
      }
    )
  }

  /* soft delete a document by ID */
  deleteSoftById(optRoles, optValidations) {
    optRoles = this.optValidateRoles(optRoles)
    this.router.delete(
      "/delete/soft/:docId",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get document ID
        const docId = req.params.docId

        // validate ID
        const valId = this.ValInput.docId(this.t, docId)
        if (valId.error)
          return BaseRoute.Err.invalidInput(this.t, valId, req, res)

        // check is document exist
        const isExist = await this.Query.isSoftExist(valId.value)
        if (!isExist)
          return BaseRoute.Err.dbNoRecord(this.t, valId.value, req, res)

        // custom validation operation
        if (optValidations && optValidations.isOperation) {
          const validate = await optValidations.validateOperation(req, isExist)
          if (!validate.OK)
            return BaseRoute.Err.dbImmutableRecord(this.t, null, req, res)
        }

        // change state isActive in DB to false
        this.Query.softDeleteById(valId.value)
          .then(() => {
            return res.status(200).send(ctResOk.dbDeleteSoft(this.t))
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailDelete(this.t, error, req, res)
          })
      }
    )
  }

  /* revive a document by ID */
  reviveById(optRoles) {
    optRoles = this.optValidateRoles(optRoles)
    this.router.put(
      "/revive/:docId",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get document ID
        const docId = req.params.docId

        // validate ID
        const valId = this.ValInput.docId(this.t, docId)
        if (valId.error)
          return BaseRoute.Err.invalidInput(this.t, valId, req, res)

        // check is document exist
        const isExist = await this.Query.isExist(valId.value)
        if (!isExist)
          return BaseRoute.Err.dbNoRecord(this.t, valId.value, req, res)

        // change state in DB
        this.Query.updateById(valId.value, {
          [state_isActive.id]: true,
          [state_isLocked.id]: false,
        })
          .then((result) => {
            return res.status(200).send(result)
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailOp(this.t, error, req, res)
          })
      }
    )
  }

  /* hard delete a document by ID */
  deleteHardById(optRoles) {
    optRoles = this.optValidateRoles(optRoles)
    this.router.delete(
      "/delete/hard/:docId",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        optRoles.req = req
        optRoles.res = res

        // validate roles
        if (!this.validateRoles(optRoles).OK) return

        // get document ID
        const docId = req.params.docId

        // validate ID
        const valId = this.ValInput.docId(this.t, docId)
        if (valId.error)
          return BaseRoute.Err.invalidInput(this.t, valId, req, res)

        // check is document exist
        const isExist = await this.Query.isExist(valId.value)
        if (!isExist)
          return BaseRoute.Err.dbNoRecord(this.t, valId.value, req, res)

        // delete from DB
        this.Query.hardDeleteById(valId.value)
          .then((result) => {
            return res.status(200).send(result)
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailDelete(this.t, error, req, res)
          })
      }
    )
  }

  migrateCollection(
    optRoles,
    query = { qOld: qOld, qNew: qnew },
    version = { vOld: vOld, vNew: vNew },
    fieldChanges,
    dataChanges,
    newFieldData,
    dataConverts,
    beforeMigrate
  ) {
    optRoles = this.optValidateRoles(optRoles)
    this.router.post(
      "/migrate-collection",
      this.auth(optRoles.noSignIn),
      async (req, res) => {
        // get all data from old collection
        const oldDatas = await query.qOld
          .getsByCriterias({
            [app_v.id]: { $in: version.vOld },
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailOp(this.t, error, req, res)
          })

        let candidateNewDatas = oldDatas.map((v) => {
          const newData = JSON.parse(JSON.stringify(v))

          // convert old data with new data
          for (const field in dataConverts) {
            newData[field] = dataConverts[field](v[field])
          }

          // replace old field with new field
          for (const oldField in fieldChanges) {
            newData[fieldChanges[oldField]] = newData[oldField]
            delete newData[oldField]
          }

          // replace old data with new data
          setObject(newData, app_v.id, version.vNew)
          for (const field in dataChanges) {
            if (field.includes("."))
              setObject(newData, field, dataChanges[field])
            else newData[field] = dataChanges[field]
          }

          // new field with new data
          for (const field in newFieldData) {
            if (field.includes("."))
              setObject(newData, field, newFieldData[field])
            else newData[field] = newFieldData[field]
          }

          return newData
        })

        // add custom task before migration
        if (beforeMigrate && beforeMigrate.run) {
          candidateNewDatas = await beforeMigrate.task(candidateNewDatas)
        }

        // clear new collection
        await query.qNew.hardDeletesByCriterias().catch((error) => {
          return BaseRoute.Err.dbFailDelete(this.t, error, req, res)
        })

        // save data to new collection
        await query.qNew
          .creates(candidateNewDatas)
          .then(() => {
            return res.status(200).send(ctResOk.dbFine(this.t))
          })
          .catch((error) => {
            return BaseRoute.Err.dbFailSave(this.t, error, req, res)
          })
      }
    )
  }
}

module.exports = { BaseRoute }
