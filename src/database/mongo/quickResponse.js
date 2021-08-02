const mongoose = require("mongoose");

const quickResponseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  body: { type: String, required: true }
});

const QuickResponse = mongoose.model("QuickResponse", quickResponseSchema);

module.exports = QuickResponse;