const { promises, statSync, unlinkSync } = require("fs")
const Err = require("../constants/error")
const logerr = require("./log-error")
const { encrypt } = require("./encryption")
const { formatBytes } = require("./strings")

// Read a file from the server as a Buffer
exports.loadFile = async (fileDest) => {
  const data = await promises.readFile(fileDest)
  return new Buffer.from(data)
}

exports.saveFiles = (
  t,
  filePath,
  fieldName,
  options = {
    allowOverwrite: false,
    fieldIsRequired: false,
    useEncryptedFileName: false,
    allowedExtensions: [],
    maxSizeInBytes: 0,
    single: false,
  },
  req,
  res
) => {
  let values = []

  // Option field is required
  if (options.fieldIsRequired) {
    if (!filePath) {
      logerr({ error: Err.FILE_PATH_UNKNOWN }, req)

      res.status(Err.FILE_PATH_UNKNOWN.httpCode).send({
        code: Err.FILE_PATH_UNKNOWN.code,
        httpCode: Err.FILE_PATH_UNKNOWN.httpCode,
        message: t(Err.FILE_PATH_UNKNOWN.message),
      })

      return { error: true }
    }

    if (!req.files) {
      logerr({ error: Err.FILE_REQUIRED_BUT_NOT_SELECTED }, req)

      res.status(Err.FILE_REQUIRED_BUT_NOT_SELECTED.httpCode).send({
        code: Err.FILE_REQUIRED_BUT_NOT_SELECTED.code,
        httpCode: Err.FILE_REQUIRED_BUT_NOT_SELECTED.httpCode,
        message: t(Err.FILE_REQUIRED_BUT_NOT_SELECTED.message),
      })

      return { error: true }
    }
  }

  if (req.files) {
    if (!Array.isArray(req.files[fieldName]))
      req.files[fieldName] = [req.files[fieldName]]

    for (const file of req.files[fieldName]) {
      if (!file) return { error: false, empty: true }

      let fileName = file.name
      const fileSize = file.size

      // Allowed extensions
      if (options.allowedExtensions.length > 0) {
        const arrExtToStr = options.allowedExtensions.join("|")
        const regexExt = new RegExp(".(" + arrExtToStr + ")$")
        if (!fileName.toLowerCase().match(regexExt)) {
          Err.FILE_EXT_NOT_ALLOWED.allowed = arrExtToStr

          logerr({ error: Err.FILE_EXT_NOT_ALLOWED }, req)

          res.status(Err.FILE_EXT_NOT_ALLOWED.httpCode).send({
            code: Err.FILE_EXT_NOT_ALLOWED.code,
            httpCode: Err.FILE_EXT_NOT_ALLOWED.httpCode,
            message: t(Err.FILE_EXT_NOT_ALLOWED.message),
          })

          return { error: true }
        }
      }

      // Maximum size
      if (fileSize > options.maxSizeInBytes) {
        Err.FILE_SIZE_TOO_BIG.size = formatBytes(fileSize, 2)
        Err.FILE_SIZE_TOO_BIG.maxSize = formatBytes(options.maxSizeInBytes, 2)

        logerr({ error: Err.FILE_SIZE_TOO_BIG }, req)

        res.status(Err.FILE_SIZE_TOO_BIG.httpCode).send({
          code: Err.FILE_SIZE_TOO_BIG.code,
          httpCode: Err.FILE_SIZE_TOO_BIG.httpCode,
          message: t(Err.FILE_SIZE_TOO_BIG.message),
        })

        return { error: true }
      }

      // Option use encryted filename
      if (options.useEncryptedFileName) {
        if (!file) fileName = null
        else
          fileName =
            encrypt(fileName) +
            "." +
            fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
      }

      // Get boolean if filename is already exist on the server
      let isExist = null
      try {
        statSync(filePath + fileName.toLowerCase())
        isExist = true
      } catch (_) {
        isExist = false
      }

      // If exist AND option allow to overwrite is not enabled
      if (isExist && !options.allowOverwrite) {
        logerr({ error: Err.FILE_EXIST_AND_OVERWRITE_NOT_PERMITTED }, req)

        res.status(Err.FILE_EXIST_AND_OVERWRITE_NOT_PERMITTED.httpCode).send({
          code: Err.FILE_EXIST_AND_OVERWRITE_NOT_PERMITTED.code,
          httpCode: Err.FILE_EXIST_AND_OVERWRITE_NOT_PERMITTED.httpCode,
          message: t(Err.FILE_EXIST_AND_OVERWRITE_NOT_PERMITTED.message),
        })

        return { error: true }
      }
      // If exist AND option allow to overwrite is enabled AND the user didn't want to, return warning
      else if (isExist && options.allowOverwrite && req.body.overwrite != 1) {
        logerr(
          {
            error: Err.FILE_EXIST_AND_SET_TO_OVEWRITE,
            additional: { isDuplicate: true },
          },
          req
        )

        res.status(Err.FILE_EXIST_AND_SET_TO_OVEWRITE.httpCode).send({
          code: Err.FILE_EXIST_AND_SET_TO_OVEWRITE.code,
          httpCode: Err.FILE_EXIST_AND_SET_TO_OVEWRITE.httpCode,
          message: t(Err.FILE_EXIST_AND_SET_TO_OVEWRITE.message),
          additional: { isDuplicate: true },
        })

        return { error: true }
      }

      // Return value for encrypted filename
      if (options.useEncryptedFileName)
        values.push({
          error: false,
          originName: file ? file.name.toLowerCase() : null,
          encryptedName: fileName.toLowerCase(),
          appliedName: fileName.toLowerCase(),
        })
      // Return value for unencrypted filename
      else
        values.push({
          error: false,
          originName: file ? file.name.toLowerCase() : null,
          encryptedName: null,
          appliedName: fileName.toLowerCase(),
        })
    }

    for (const file of req.files[fieldName]) {
      file.mv(filePath + file.name.toLowerCase())
    }
  } else {
    return { error: false, empty: true }
  }

  if (options.single) return values[0]
  else return values
}

// Remove a file from the server
exports.removeFile = (filePath, fileName, req, res) => {
  // If given filePath and fileName
  if (filePath && fileName) {
    try {
      // Try to remove
      unlinkSync(filePath + fileName)
      return { error: false }
    } catch (error) {
      // on catch error (maybe because file is no longer exist)
      logerr({ error: Err.FILE_ON_REMOVE_FAIL_UNLINK }, req)

      res.status(Err.FILE_ON_REMOVE_FAIL_UNLINK.httpCode).send({
        code: Err.FILE_ON_REMOVE_FAIL_UNLINK.code,
        httpCode: Err.FILE_ON_REMOVE_FAIL_UNLINK.httpCode,
        message: t(Err.FILE_ON_REMOVE_FAIL_UNLINK.message),
      })

      return { error: true }
    }
  }
  // If not given filePath or fileName
  else {
    logerr({ error: Err.FILE_ON_REMOVE_NO_CANDIDATE }, req)

    res.status(Err.FILE_ON_REMOVE_NO_CANDIDATE.httpCode).send({
      code: Err.FILE_ON_REMOVE_NO_CANDIDATE.code,
      httpCode: Err.FILE_ON_REMOVE_NO_CANDIDATE.httpCode,
      message: t(Err.FILE_ON_REMOVE_NO_CANDIDATE.message),
    })

    return { error: true }
  }
}
