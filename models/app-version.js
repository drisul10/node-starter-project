const { Schema, model } = require("mongoose")

const { state, logs, app } = require("./_metadata")
const MtdtFields = require("./_metadata").Fields
const optChannelUpdateVersion = require("../constants/channel-update-version")

const Col = { name: "emp_app_versions" }
exports.Col = Col

const Fields = {
  _id: { id: "_id", name: "appVersion._id.label" },
  number: { id: "number", name: "appVersion.number.label" },
  outdatedNumber: {
    id: "outdatedNumber",
    name: "appVersion.outdatedNumber.label",
  },
  name: { id: "name", name: "appVersion.name.label" },
  kind: { id: "kind", name: "appVersion.kind.label" },
  channelUpdate: {
    id: "channelUpdate",
    name: "appVersion.channelUpdate.label",
  },
  linkUpdate: {
    id: "linkUpdate",
    name: "appVersion.linkUpdate.label",
  },
  ...MtdtFields,
}
exports.Fields = Fields

const Values = {
  optChannelUpdateVersion,
  name: { min: 1, max: 50 },
  kind: { min: 1, max: 50 },
}
exports.Values = Values

const SchemaModel = new Schema({
  [Fields.number.id]: { type: Number, required: true },
  [Fields.outdatedNumber.id]: { type: Number, required: true },
  [Fields.name.id]: {
    type: String,
    minlength: Values.name.min,
    maxlength: Values.name.max,
    required: true,
  },
  [Fields.kind.id]: {
    type: String,
    minlength: Values.kind.min,
    maxlength: Values.kind.max,
    required: true,
  },
  [Fields.channelUpdate.id]: {
    type: String,
    enum: optChannelUpdateVersion.allId,
    required: true,
    required: true,
  },
  [Fields.linkUpdate.id]: {
    type: String,
    required: true,
  },

  // metadata
  state,
  logs,
  app,
})

// indexes
SchemaModel.index(
  { [Fields.number.id]: 1 },
  {
    unique: true,
    partialFilterExpression: {
      [Fields.number.id]: { $type: "int" },
      [Fields.state_isActive.id]: true,
    },
  }
)

exports.Model = new model(Col.name, SchemaModel)
