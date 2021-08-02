module.exports = {
  // local
  emojis: require("./local")("emojis"),
  reactionroles: require("./local")("reactionroles"),
  tickets: require("./local")("tickets"),
  // mongo
  TrainingModel: require("./mongo/trainingModel"),
  QuickResponse: require("./mongo/quickResponse"),
  BotLog: require("./mongo/botLog"),
};