const { connect } = require("mongoose")
const winston = require("winston")
const botele = require("../helpers/bot-telegram")
const {
  KIND_OF_REMOTE,
  LOCAL_DEVELOPMENT,
  LOCAL_PRODUCTION,
  REMOTE_DEVELOPMENT,
  REMOTE_TESTING,
  REMOTE_STAGING,
  REMOTE_PRODUCTION,
} = require("../constants/environment")

const MongoDbURI = () => {
  let uri = ""

  switch (process.env.APP_ENV) {
    case LOCAL_DEVELOPMENT:
      uri = process.env.MONGO_URI_LOCAL_DEVELOPMENT
      break

    case LOCAL_PRODUCTION:
      uri = process.env.MONGO_URI_REMOTE_PRODUCTION
      break

    case REMOTE_DEVELOPMENT:
      uri = process.env.MONGO_URI_REMOTE_PRODUCTION
      break

    case REMOTE_TESTING:
      uri = process.env.MONGO_URI_REMOTE_TESTING
      break

    case REMOTE_STAGING:
      uri = process.env.MONGO_URI_REMOTE_STAGING
      break

    case REMOTE_PRODUCTION:
      uri = process.env.MONGO_URI_REMOTE_PRODUCTION
      break

    default:
      break
  }

  return uri
}

module.exports = () => {
  connect(MongoDbURI(), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
    .then(() => {
      const message =
        "Connected to MongoDB in **" + process.env.APP_ENV + "** mode."
      winston.info(message)

      if (
        process.env.BOT_IS_ACTIVE == "true" &&
        process.env.APP_ENV.includes(KIND_OF_REMOTE)
      )
        botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, message)
    })
    .catch((error) => {
      winston.error({
        message: error.message,
        level: "error",
        stack: error.stack,
      })

      if (
        process.env.BOT_IS_ACTIVE == true &&
        process.env.APP_ENV.includes(KIND_OF_REMOTE)
      )
        botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, error.stack)
    })
}
