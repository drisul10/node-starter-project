const Err = require("../constants/error")
const logerr = require("./log-error")

exports.invalidInput = (t, input, req, res, onlyLog = false) => {
  logerr({ error: Err.INPUT_FAIL_VALIDATE, details: input.error }, req)

  if (!onlyLog)
    return res.status(Err.INPUT_FAIL_VALIDATE.httpCode).send({
      code: Err.INPUT_FAIL_VALIDATE.code,
      httpCode: Err.INPUT_FAIL_VALIDATE.httpCode,
      message: input.error.details[0].message,
    })
}

exports.unsatisfiedInput = (t, pattern, req, res, onlyLog = false) => {
  logerr({ error: Err.INPUT_UNSATISFIED, details: { pattern: pattern } }, req)
  if (!onlyLog)
    return res.status(Err.INPUT_UNSATISFIED.httpCode).send({
      code: Err.INPUT_UNSATISFIED.code,
      httpCode: Err.INPUT_UNSATISFIED.httpCode,
      message:
        t(Err.INPUT_UNSATISFIED.message) +
        " (" +
        t(pattern.label) +
        (pattern.value ? pattern.value + ")" : ")"),
    })
}

exports.dbFailSave = (t, error, req, res, onlyLog = false) => {
  let e = Err.DB_FAIL_SAVE
  let m = t(e.message)
  if (error.code === 11000) {
    e = Err.DB_DUPLICATE_RECORD
    m =
      t(e.message) +
      (error.keyValue
        ? ": " + error.keyValue[Object.keys(error.keyValue)[0]]
        : "")
  }
  logerr({ error: e, stack: error.stack }, req)

  if (!onlyLog)
    return res
      .status(e.httpCode)
      .send({ code: e.code, httpCode: e.httpCode, message: m })
}

exports.dbFailOp = (t, error, req, res, onlyLog = false) => {
  logerr({ error: Err.DB_FAIL_OPERATION, stack: error.stack }, req)

  if (!onlyLog)
    return res.status(Err.DB_FAIL_OPERATION.httpCode).send({
      code: Err.DB_FAIL_OPERATION.code,
      httpCode: Err.DB_FAIL_OPERATION.httpCode,
      message: t(Err.DB_FAIL_OPERATION.message),
    })
}

exports.dbFailDelete = (t, error, req, res, onlyLog = false) => {
  logerr({ error: Err.DB_FAIL_DELETE, stack: error.stack }, req)

  if (!onlyLog)
    return res.status(Err.DB_FAIL_DELETE.httpCode).send({
      code: Err.DB_FAIL_DELETE.code,
      httpCode: Err.DB_FAIL_DELETE.httpCode,
      message: t(Err.DB_FAIL_DELETE.message),
    })
}

exports.dbLocked = (t, pattern, req, res, onlyLog = false) => {
  logerr({ error: Err.DB_LOCKED_RECORD, details: { pattern: pattern } }, req)

  if (!onlyLog)
    return res.status(Err.DB_LOCKED_RECORD.httpCode).send({
      code: Err.DB_LOCKED_RECORD.code,
      httpCode: Err.DB_LOCKED_RECORD.httpCode,
      message: t(Err.DB_LOCKED_RECORD.message),
    })
}

exports.dbNoRecord = (t, pattern, req, res, onlyLog = false) => {
  logerr({ error: Err.DB_NO_RECORD, details: { pattern: pattern } }, req)

  if (!onlyLog)
    return res.status(Err.DB_NO_RECORD.httpCode).send({
      code: Err.DB_NO_RECORD.code,
      httpCode: Err.DB_NO_RECORD.httpCode,
      message: t(Err.DB_NO_RECORD.message),
    })
}

exports.dbDuplicateRecord = (t, pattern, req, res, onlyLog = false) => {
  logerr({ error: Err.DB_DUPLICATE_RECORD, details: { pattern: pattern } }, req)

  if (!onlyLog)
    return res.status(Err.DB_DUPLICATE_RECORD.httpCode).send({
      code: Err.DB_DUPLICATE_RECORD.code,
      httpCode: Err.DB_DUPLICATE_RECORD.httpCode,
      message:
        t(Err.DB_DUPLICATE_RECORD.message) +
        " (" +
        t(pattern.label) +
        (pattern.value ? ": " + t(pattern.value) + ")" : ")"),
    })
}

exports.dbImmutableRecord = (t, pattern, req, res, onlyLog = false) => {
  logerr({ error: Err.DB_IMMUTABLE_RECORD, details: { pattern: pattern } }, req)

  if (!onlyLog)
    return res.status(Err.DB_IMMUTABLE_RECORD.httpCode).send({
      code: Err.DB_IMMUTABLE_RECORD.code,
      httpCode: Err.DB_IMMUTABLE_RECORD.httpCode,
      message: t(Err.DB_IMMUTABLE_RECORD.message),
    })
}

exports.emailFailSent = (t, error, req, res, onlyLog = false) => {
  logerr({ error: Err.EMAIL_NOT_SENT, stack: error.stack }, req)

  if (!onlyLog)
    return res.status(Err.EMAIL_NOT_SENT.httpCode).send({
      code: Err.EMAIL_NOT_SENT.code,
      httpCode: Err.EMAIL_NOT_SENT.httpCode,
      message: t(Err.EMAIL_NOT_SENT.message),
    })
}
