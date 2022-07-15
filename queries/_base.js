const sortType = require("../constants/data-sort-type")
const { state_isActive, app_venv } = require("../models/_metadata").Fields

class BaseQuery {
  Model = null
  Fields = null
  selectedVenv = process.env.APP_VENV_SELECTED.split(",")

  optQuery(params, paramsAddition = null) {
    return {
      filter: params ? params.filter || "" : "",
      search: params
        ? params.search
          ? params.search.split(" ").join("|")
          : "" || ""
        : "",
      sort: params
        ? params.sort
          ? sortType[params.sort]
            ? sortType[params.sort].sort
            : sortType.NEWEST.sort
          : sortType.NEWEST.sort
        : sortType.NEWEST.sort,
      skip: params
        ? params.skip && Number.isInteger(params.skip)
          ? params.skip
          : 0
        : 0,
      limit: params
        ? params.limit
          ? Number.isInteger(params.limit)
            ? { $limit: params.limit }
            : { $limit: 10 }
          : { $addFields: { limit: null } }
        : { $addFields: { limit: null } },
      paramsAddition,
    }
  }

  // create
  async create(pDocument, pSession = null) {
    if (pSession) return this.Model.create(pDocument, { session: pSession })
    return this.Model.create(pDocument)
  }

  // create documents
  async creates(pDocuments, pSession = null) {
    if (pSession)
      return this.Model.insertMany(pDocuments, { session: pSession })
    return this.Model.insertMany(pDocuments)
  }

  // get documents with specific criterias and select specific fields
  async getsByCriterias(pCriterias = null, pSelectFields = null) {
    return this.Model.find(pCriterias).select(pSelectFields)
  }

  // get by ID and select specific fields
  async getById(pDocId, pSelectFields = null) {
    return this.Model.findOne({
      _id: pDocId,
      [app_venv.id]: { $in: this.selectedVenv },
    })
      .select(pSelectFields)
      .lean()
  }

  // get by criterias and select specific fields
  async getByCriterias(pCriterias, pSelectFields = null) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }

    return this.Model.findOne(pCriterias).select(pSelectFields)
  }

  // gets paging
  async getsPagingBase(
    pOpt,
    pAdditionMatch = null,
    pQueryPreFacet = null,
    pQueryItems = null,
    pAdditionProjectItems = null
  ) {
    const dummyProject = {
      "dummy-field": 0,
    }

    const dummyMatch = { "dummy-field": { $exists: false } }

    if (pAdditionMatch === null) pAdditionMatch = dummyMatch

    if (pQueryPreFacet === null)
      pQueryPreFacet = [{ $project: { dummy: dummyProject } }]

    const match = {
      $match: {
        $or: [
          { [state_isActive.id]: { $exists: false } },
          { [state_isActive.id]: true },
        ],
        ...pAdditionMatch,
      },
    }

    if (pQueryItems === null)
      pQueryItems = [{ $project: { dummy: dummyProject } }]

    if (pAdditionProjectItems === null) pAdditionProjectItems = dummyProject
    const projectItems = {
      $project: {
        ...pAdditionProjectItems,
      },
    }

    const result = await this.Model.aggregate([
      {
        $sort: { _id: -1 },
      },
      ...pQueryPreFacet,
      {
        $facet: {
          activeCount: [
            { $match: { [state_isActive.id]: true } },
            { $count: "size" },
          ],
          pagingActiveCount: [match, { $count: "size" }],
          items: [
            match,
            ...pQueryItems,
            { $sort: pOpt.sort },
            { $skip: pOpt.skip },
            pOpt.limit,
            projectItems,
          ],
        },
      },
      {
        $project: {
          activeCount: {
            $ifNull: [{ $arrayElemAt: ["$activeCount.size", 0] }, 0],
          },
          pagingActiveCount: {
            $ifNull: [{ $arrayElemAt: ["$pagingActiveCount.size", 0] }, 0],
          },
          items: 1,
        },
      },
    ])

    return result[0]
  }

  // check is exist
  async isExist(pDocId) {
    return this.Model.findOne({
      _id: pDocId,
      [app_venv.id]: { $in: this.selectedVenv },
    }).select({ _id: 1 })
  }

  // check is exist by criterias
  async isExistByCriterias(pCriterias) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }

    return this.Model.findOne(pCriterias).select({ _id: 1 })
  }

  // check is soft exist
  async isSoftExist(pDocId) {
    return this.Model.findOne({
      _id: pDocId,
      [state_isActive.id]: true,
      [app_venv.id]: { $in: this.selectedVenv },
    })
  }

  // update by ID
  async updateById(pDocId, pDataToUpdate, pSession = null) {
    return this.Model.updateOne(
      { _id: pDocId, [app_venv.id]: { $in: this.selectedVenv } },
      { $set: pDataToUpdate },
      { session: pSession }
    )
  }

  // update documents by criterias
  async updateByCriterias(pCriterias, pDataToUpdate) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }

    return this.Model.updateMany(pCriterias, { $set: pDataToUpdate })
  }

  // soft delete by ID
  async softDeleteById(pDocId, pSession = null) {
    return this.Model.updateOne(
      { _id: pDocId, [app_venv.id]: { $in: this.selectedVenv } },
      { $set: { [state_isActive.id]: false } },
      { session: pSession }
    )
  }

  // soft delete by criterias
  async softDeleteByCriterias(pCriterias) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }

    return this.Model.updateOne(pCriterias, {
      $set: { [state_isActive.id]: false },
    })
  }

  // soft deletes by criterias
  async softDeletesByCriterias(pCriterias) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }
    return this.Model.updateMany(pCriterias, {
      $set: { [state_isActive.id]: false },
    })
  }

  // hard delete by ID
  async hardDeleteById(pDocId) {
    return this.Model.deleteOne({
      _id: pDocId,
      [app_venv.id]: { $in: this.selectedVenv },
    })
  }

  // hard delete by criterias
  async hardDeleteByCriterias(pCriterias) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }

    return this.Model.deleteOne(pCriterias)
  }

  // hard deletes by criterias
  async hardDeletesByCriterias(pCriterias) {
    if (pCriterias) pCriterias[app_venv.id] = { $in: this.selectedVenv }
    else pCriterias = { [app_venv.id]: { $in: this.selectedVenv } }

    return this.Model.deleteMany(pCriterias)
  }
}

module.exports = { BaseQuery }
