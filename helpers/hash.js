const { genSalt, hash, compare } = require("bcrypt")

exports.generate = async (plaintext) => {
  const salt = await genSalt(10)
  return hash(plaintext, salt)
}

exports.compare = async (plain, hash) => {
  return await compare(plain, hash)
}
