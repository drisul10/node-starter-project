exports.PLAY_STORE = {
  id: "PLAY_STORE",
  name: "channelUpdateVersion.playStore.label",
}
exports.TELEGRAM = {
  id: "TELEGRAM",
  name: "channelUpdateVersion.telegram.label",
}

exports.all = [this.PLAY_STORE, this.TELEGRAM]
exports.allId = this.all.map((v) => v.id)
exports.allName = this.all.map((v) => v.name)
