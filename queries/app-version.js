const { BaseQuery } = require("./_base")

const { Model, Fields } = require("../models/app-version")

const { _id, number, outdatedNumber, name, kind, channelUpdate, linkUpdate } =
  require("../models/app-version").Fields

class Query extends BaseQuery {
  constructor() {
    super()
    this.Model = Model
    this.Fields = Fields
  }

  // get latest
  async getLatest() {
    return Model.findOne({})
      .sort({ [number.id]: -1 })
      .select({
        [_id.id]: 1,
        [number.id]: 1,
        [outdatedNumber.id]: 1,
        [name.id]: 1,
        [kind.id]: 1,
        [channelUpdate.id]: 1,
        [linkUpdate.id]: 1,
      })
  }
}

module.exports = { Query }
