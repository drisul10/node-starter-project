const express = require("express")
const app = express()
const { join } = require("path")
const fileUpload = require("express-fileupload")
const cors = require("cors")
const winston = require("winston")
const { KIND_OF_REMOTE } = require("./constants/environment")
const botele = require("./helpers/bot-telegram")
const unexpectedError = require("./helpers/unexpected-error")

// enable file upload
app.use(fileUpload({ createParentPath: true }))
app.use("/userfiles", express.static(join(__dirname, "/userfiles")))
app.use("/uploads", express.static(join(__dirname, "/uploads")))

// cross-origin resource sharing
app.use(cors())

// parsing application/json
app.use(express.json())

// parsing application/xwww
app.use(express.urlencoded({ extended: true }))

require("dotenv").config()
require("./configs/localization")(app)
require("./configs/env")()
require("./configs/logging")()
require("./configs/routes")(app)
require("./configs/db")()

const port = process.env.APP_PORT || 3000

app.listen(port, () => {
  const message = `App listening at port ${port}, in **${process.env.APP_ENV}** mode, version ${process.env.APP_VERSION}.`
  winston.info(message)

  if (
    process.env.BOT_IS_ACTIVE == "true" &&
    process.env.APP_ENV.includes(KIND_OF_REMOTE)
  )
    botele.sendMessage(process.env.BOT_TELEGRAM_C1ID, message)
})

// should placed in the bottom.
app.use(unexpectedError)
