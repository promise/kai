const mongoose = require("mongoose");

const botLogSchema = new mongoose.Schema({
  bot: { type: String, required: true },
  status: { type: {}, default: {} },
  timestamp: { type: Date, default: Date.now }
});

const BotLog = mongoose.model("BotLog", botLogSchema);

module.exports = BotLog;