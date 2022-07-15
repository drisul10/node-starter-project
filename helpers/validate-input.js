exports.isValidInput = (t, fun, req, res) => {
  const Err = require("../helpers/errors")

  const validate = fun(t, req.body)
  if (validate.error) {
    Err.invalidInput(null, validate, req, res)
    return false
  }

  // delete unused prop
  delete validate.value["isUpdate"]

  return validate.value
}
