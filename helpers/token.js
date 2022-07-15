const { sign } = require("jsonwebtoken")

exports.generate = (dataObject) => {
  return sign(dataObject, process.env.JWT_PRIVATE_KEY)
}
