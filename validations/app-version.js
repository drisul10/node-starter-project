const {
  Joi,
  UpdateFields,
  isUpdate,
  docId,
  mString,
  mNumber,
} = require("./_base")

const { Fields, Values } = require("../models/app-version")
const { number, outdatedNumber, name, kind, channelUpdate, linkUpdate } = Fields
const { optChannelUpdateVersion, name: vlname, kind: vlkind } = Values

exports.docId = (t, input) => docId(t, input)

exports.save = (t, input) => {
  const schema = Joi.object({
    ...UpdateFields,
    [number.id]: Joi.number()
      .messages(mNumber({ t, title: number.name }))
      .when(isUpdate.id, isUpdate.opts),
    [outdatedNumber.id]: Joi.number()
      .messages(mNumber({ t, title: outdatedNumber.name }))
      .when(isUpdate.id, isUpdate.opts),
    [name.id]: Joi.string()
      .trim()
      .lowercase()
      .replace(/\s\s+/g, " ")
      .pattern(/^[A-Za-z0-9 '"._-]*$/)
      .min(vlname.min)
      .max(vlname.max)
      .messages(
        mString({ t, title: name.name, min: vlname.min, max: vlname.max })
      )
      .when(isUpdate.id, isUpdate.opts),
    [kind.id]: Joi.string()
      .trim()
      .replace(/\s\s+/g, " ")
      .pattern(/^[A-Za-z0-9 '"_-]*$/)
      .min(vlkind.min)
      .max(vlkind.max)
      .messages(
        mString({ t, title: kind.name, min: vlkind.min, max: vlkind.max })
      )
      .when(isUpdate.id, isUpdate.opts),
    [channelUpdate.id]: Joi.string()
      .valid(...optChannelUpdateVersion.allId)
      .messages(
        mString({
          t,
          title: channelUpdate.name,
          onlyIn: optChannelUpdateVersion.all,
        })
      )
      .when(isUpdate.id, isUpdate.opts),
    [linkUpdate.id]: Joi.string()
      .messages(mString({ t, title: channelUpdate.name }))
      .when(isUpdate.id, isUpdate.opts),
  })

  return schema.validate(input)
}
