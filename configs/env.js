const { KIND_OF_REMOTE } = require("../constants/environment")
const botele = require("../helpers/bot-telegram")

module.exports = () => {
  let message = ""

  if (!process.env.JWT_PRIVATE_KEY) {
    message = "JWT_PRIVATE_KEY environment definition was not defined."

    if (process.env.APP_ENV.includes(KIND_OF_REMOTE))
      botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, message)

    throw new Error(message)
  }

  if (
    !process.env.MONGO_URI_LOCAL_DEVELOPMENT ||
    !process.env.MONGO_URI_REMOTE_TESTING ||
    !process.env.MONGO_URI_REMOTE_STAGING ||
    !process.env.MONGO_URI_REMOTE_PRODUCTION
  ) {
    message = "MONGO_URI environment definitions was not completed."

    if (process.env.APP_ENV.includes(KIND_OF_REMOTE))
      botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, message)

    throw new Error(message)
  }

  if (
    !process.env.GMAIL_SERVICE_NAME ||
    !process.env.GMAIL_SERVICE_HOST ||
    !process.env.GMAIL_SERVICE_SECURE ||
    !process.env.GMAIL_SERVICE_PORT ||
    !process.env.GMAIL_USER_NAME ||
    !process.env.GMAIL_USER_PASSWORD
  ) {
    message = "GMAIL_SERVICE environment definitions was not completed."

    if (process.env.APP_ENV.includes(KIND_OF_REMOTE))
      botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, message)

    throw new Error(message)
  }

  if (
    !process.env.RABBIT_SALT ||
    !process.env.RABBIT_KEY ||
    !process.env.RABBIT_IV
  ) {
    message = "RABBIT ENCRYPTION environment definitions was not defined."

    if (process.env.APP_ENV.includes(KIND_OF_REMOTE))
      botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, message)

    throw new Error(message)
  }

  if (!process.env.BOT_TELEGRAM_KEY || !process.env.BOT_TELEGRAM_C1ID) {
    message = "BOT_TELEGRAM environment definitions was not defined."

    throw new Error(message)
  }
}
