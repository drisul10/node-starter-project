exports.chunk = (str, n) => {
  const ret = []
  for (i = 0, len = str.length; i < len; i += n) {
    ret.push(str.substr(i, n))
  }

  return ret
}

exports.formatBytes = (byteSize, decimal = 1) => {
  if (0 === byteSize) return "0 Bytes"
  const c = 0 > decimal ? 0 : decimal,
    d = Math.floor(Math.log(byteSize) / Math.log(1000))

  return (
    parseFloat((byteSize / Math.pow(1000, d)).toFixed(c)) +
    " " +
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  )
}

exports.randNumber = (n) => {
  let strNum = ""
  for (i = 0; i < n; i++) {
    strNum += Math.floor(Math.random() * 10).toString()
  }

  return strNum
}

exports.capitalizeWords = (w) => {
  return w.replace(/\b\w/g, (l) => l.toUpperCase())
}

exports.toRupiah = (value) => {
  if (!value) return "Rp" + 0
  return "Rp" + value.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1.")
}
