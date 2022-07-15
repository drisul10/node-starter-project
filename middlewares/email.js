const { createTransport } = require("nodemailer")
const hbs = require("nodemailer-express-handlebars")

const gmailTransport = createTransport({
  service: process.env.GMAIL_SERVICE_NAME,
  host: process.env.GMAIL_SERVICE_HOST,
  secure: process.env.GMAIL_SERVICE_SECURE, // TODO update in production with STARTTLS
  port: process.env.GMAIL_SERVICE_PORT,
  auth: {
    user: process.env.GMAIL_USER_NAME,
    pass: process.env.GMAIL_USER_PASSWORD,
  },
})

gmailTransport.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".hbs",
      layoutsDir: "views/layout_email",
      partialsDir: "views/",
      defaultLayout: null,
    },
    extName: ".hbs",
    viewPath: "./views/layout_email",
  })
)

module.exports.gmailTransport = gmailTransport
