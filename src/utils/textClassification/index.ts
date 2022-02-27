import TrainingModel, { TrainingModelData } from "../../database/models/trainingModel";
import { Classifier } from "./module";

export const classifiers = new Map<string, Classifier>();
export const models = new Map<string, Map<string, TrainingModelData>>();

updateClassifiers();

export function updateClassifiers() {
  TrainingModel.find().then(trainingModels => trainingModels.forEach(model => {
    const classifier = new Classifier({
      nGramMin: 2,
      nGramMax: 5,
    });

    model.data.forEach(({ input }, id) => classifier.train(input, id));

    classifiers.set(model.name, classifier);
    models.set(model.name, model.data);
  }));
}
