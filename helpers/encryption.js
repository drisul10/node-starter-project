const { Rabbit, mode, pad, enc } = require("crypto-js")
exports.encrypt = (plaintext) => {
  const rabbit = Rabbit.encrypt(plaintext, process.env.RABBIT_KEY, {
    salt: process.env.RABBIT_SALT,
    iv: process.env.RABBIT_IV,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  }).toString()
  const e64 = enc.Base64.parse(rabbit)

  return e64.toString(enc.Hex)
}

exports.decrypt = (chiper) => {
  const reb64 = enc.Hex.parse(chiper)
  const bytes = reb64.toString(enc.Base64)
  const decrypt = Rabbit.decrypt(bytes, process.env.RABBIT_KEY, {
    salt: process.env.RABBIT_SALT,
    iv: process.env.RABBIT_IV,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  })

  return decrypt.toString(enc.Utf8)
}
