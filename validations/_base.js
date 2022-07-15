const JoiImport = require("joi")
JoiImport.objectId = require("joi-objectid")(JoiImport)
const JoiDate = require("@joi/date")
const Joi = JoiImport.extend(JoiDate)
exports.Joi = Joi

exports.isUpdate = {
  id: "isUpdate",
  opts: {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional(),
  },
}

exports.UpdateFields = {
  _id: Joi.objectId().allow(null).messages(this.mDocId).optional(),
  isUpdate: Joi.boolean().default(false).optional(),
}

exports.docId = (t, input) => {
  const schema = Joi.objectId().messages(this.mDocId(t)).required()

  return schema.validate(input)
}

exports.mDocId = (t) => {
  return {
    "string.empty": `"ID" ${t("validate.isEmpty.label")}`,
    "any.required": `"ID" ${t("validate.isRequired.label")}`,
    "string.pattern.name": `"ID" ${t("validate.isNotValid.label")}`,
  }
}

exports.mAny = ({ t: t, title: title }) => {
  const obj = {
    "any.base": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "any.required": `"${t(title)}" ${t("validate.isRequired.label")}`,
  }

  return obj
}

exports.mString = ({
  t: t,
  title: title,
  min: min,
  max: max,
  onlyIn: onlyIn,
  anyOnly,
}) => {
  const obj = {
    "string.empty": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "string.base": `"${t(title)}" ${t("validate.isNotValid.label")}`,
    "string.pattern.base": `"${t(title)}" ${t("validate.isNotValid.label")}"`,
    "string.pattern.name": `"${t(title)}" ${t("validate.isNotValid.label")}"`,
    "any.required": `"${t(title)}" ${t("validate.isRequired.label")}`,
    "string.email": `"${t(title)}" ${t("validate.isNotValid.label")}`,
  }

  if (min)
    obj["string.min"] = `"${t(title)}" ${t("validate.min.label", { min })}`
  if (max)
    obj["string.max"] = `"${t(title)}" ${t("validate.max.label", { max })}`
  if (onlyIn)
    obj["any.only"] = `${t("validate.selectOption.label")} "${t(
      title
    )}": ${onlyIn.map((v) => " " + t(v.name))}`
  if (anyOnly) obj["any.only"] = `"${t(title)}" ${t(anyOnly)}`

  return obj
}

exports.mNumber = ({ t: t, title: title }) => {
  const obj = {
    "number.empty": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "number.base": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "number.unsafe": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "any.required": `"${t(title)}" ${t("validate.isRequired.label")}`,
  }

  return obj
}

exports.mArray = ({ t: t, title: title, min: min, max: max }) => {
  const obj = {
    "array.empty": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "array.base": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "any.required": `"${t(title)}" ${t("validate.isRequired.label")}`,
  }

  if (min)
    obj["array.min"] = `"${t(title)}" ${t("validate.minArray.label", { min })}`
  if (max)
    obj["array.max"] = `"${t(title)}" ${t("validate.maxArray.label", { max })}`

  return obj
}

exports.mDate = ({ title: title }) => {
  const obj = {
    "date.base": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "date.format": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "any.required": `"${t(title)}" ${t("validate.isRequired.label")}`,
  }

  return obj
}

exports.mBoolean = ({ t: t, title: title, onlyIn: onlyIn }) => {
  const obj = {
    "boolean.base": `"${t(title)}" ${t("validate.isEmpty.label")}`,
    "any.required": `"${t(title)}" ${t("validate.isRequired.label")}`,
  }

  if (onlyIn)
    obj["any.only"] = `${t("validate.selectOption.label")} "${t(
      title
    )}": ${onlyIn.map((v) => " " + t(v.name))}`

  return obj
}
