module.exports = {
  // local
  emojis: require("./local")("emojis"),
  reactionroles: require("./local")("reactionroles"),
  shardstatus: require("./local")("shardstatus"),
  tickets: require("./local")("tickets"),
  botMonitor: require("./local")("botMonitor"),
  // mongo
  TrainingModel: require("./mongo/trainingModel"),
  QuickResponse: require("./mongo/quickResponse"),
};