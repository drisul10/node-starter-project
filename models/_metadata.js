const { Schema } = require("mongoose")

const Fields = {
  state: { id: "state", name: "metadata.state.label" },
  stateIsActive: { id: "isActive", name: "metadata.stateIsActive.label" },
  state_isActive: {
    id: "state.isActive",
    name: "metadata.stateIsActive.label",
  },
  stateIsLocked: { id: "isLocked", name: "metadata.stateIsLocked.label" },
  state_isLocked: {
    id: "state.isLocked",
    name: "metadata.stateIsLocked.label",
  },
  logs: { id: "logs", name: "metadata.logs.label" },
  logsCreate: { id: "create", name: "metadata.logsCreate.label" },
  logs_create: { id: "logs.create", name: "metadata.logsCreate.label" },
  logsCreateUserId: { id: "userId", name: "metadata.logsCreateUserId.label" },
  logs_create_userId: {
    id: "logs.create.userId",
    name: "metadata.logsCreateUserId.label",
  },
  logsCreateIsoDate: {
    id: "isoDate",
    name: "metadata.logsCreateIsoDate.label",
  },
  logs_create_isoDate: {
    id: "logs.create.isoDate",
    name: "metadata.logsCreateIsoDate.label",
  },
  logsUpdate: { id: "update", name: "metadata.logsUpdate.label" },
  logs_update: { id: "logs.update", name: "metadata.logsUpdate.label" },
  logsUpdateUserId: { id: "userId", name: "metadata.logsUpdateUserId.label" },
  logs_update_userId: {
    id: "logs.update.userId",
    name: "metadata.logsUpdateUserId.label",
  },
  logsUpdateIsoDate: {
    id: "isoDate",
    name: "metadata.logsUpdateIsoDate.label",
  },
  logs_update_isoDate: {
    id: "logs.update.isoDate",
    name: "metadata.logsUpdateIsoDate.label",
  },
  app: { id: "app", name: "metadata.app.label" },
  appV: { id: "v", name: "metadata.appV.label" },
  app_v: { id: "app.v", name: "metadata.appV.label" },
  appEnv: { id: "env", name: "metadata.appEnv.label" },
  app_env: { id: "app.env", name: "metadata.appEnv.label" },
  appVenv: { id: "venv", name: "metadata.appVenv.label" },
  app_venv: { id: "app.venv", name: "metadata.appVenv.label" },
}
exports.Fields = Fields

const metadata = {
  [Fields.state.id]: {
    [Fields.stateIsActive.id]: {
      type: Boolean,
      default: true,
      required: true,
    },
    [Fields.stateIsLocked.id]: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  [Fields.logs.id]: {
    [Fields.logsCreate.id]: {
      [Fields.logsCreateUserId.id]: {
        type: Schema.Types.ObjectId,
        default: null,
      },
      [Fields.logsCreateIsoDate.id]: { type: Date, required: true },
    },
    [Fields.logsUpdate.id]: {
      [Fields.logsUpdateUserId.id]: {
        type: Schema.Types.ObjectId,
        default: null,
      },
      [Fields.logsUpdateIsoDate.id]: { type: Date, required: true },
    },
  },
  [Fields.app.id]: {
    [Fields.appV.id]: {
      type: String,
      default: process.env.APP_VERSION || null,
    },
    [Fields.appEnv.id]: {
      type: String,
      default: process.env.APP_ENV || null,
    },
    [Fields.appVenv.id]: {
      type: String,
      default: process.env.APP_VENV || null,
    },
  },
}

exports.state = metadata.state
exports.logs = metadata.logs
exports.app = metadata.app
