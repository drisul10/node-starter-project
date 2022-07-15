const { transform, isEqual, isArray, isObject } = require("lodash")

const diff = (origObj, newObj) => {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0

    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value
      }
    })
  }

  return changes(newObj, origObj)
}

exports.changes = (origObj, newObj) => {
  const diffs = diff(origObj, newObj)
  const uvals = Object.values(diffs)
  const ukeys = uvals[1] ? Object.keys(uvals[1]) : Object.keys(uvals[0])
  const originals = {}
  const updates = {}

  for (const k of ukeys) {
    originals[k] = origObj[k]
    updates[k] = newObj[k]
  }

  return { originals: originals, updates: updates }
}
