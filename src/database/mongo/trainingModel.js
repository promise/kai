const mongoose = require("mongoose");

const trainingModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Map, of: {
    input: { type: [String], default: [] },
    quickresponse: { type: String, required: true },
    confidenceRequired: { type: Number, default: 0.5 }
  }, default: [] }
});

const TrainingModel = mongoose.model("TrainingModel", trainingModelSchema);

module.exports = TrainingModel;