require("dotenv").config()
const { Telegraf } = require("telegraf")
let botele = { telegram: null }

if (process.env.BOT_IS_ACTIVE == "true") {
  botele = new Telegraf(process.env.BOT_TELEGRAM_KEY)
  botele.telegram.getMe().then((result) => {
    if (!result) botele.launch()
  })
}
module.exports = botele.telegram
