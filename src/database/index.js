module.exports = {
  // local
  emojis: require("./local")("emojis"),
  quickresponses: require("./local")("quickresponses"),
  reactionroles: require("./local")("reactionroles"),
  shardstatus: require("./local")("shardstatus"),
  tickets: require("./local")("tickets"),
  botMonitor: require("./local")("botMonitor"),
  // mongo
  mlTraining: require("./mongo/trainingModel")
};