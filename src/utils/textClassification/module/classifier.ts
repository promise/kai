/* eslint-disable no-underscore-dangle */
import { Model, ModelConfig } from "./model";
import Prediction from "./prediction";

export type Tokens = Record<string, number>;
export type Vector = Record<number, number>;

export class Classifier {
  _model: Model;
  constructor(model?: Model | ModelConfig) {
    if (!(model instanceof Model)) this._model = new Model(model);
    else this._model = model;
  }

  get model() {
    return this._model;
  }

  set model(model: Model | ModelConfig) {
    if (!(model instanceof Model)) this._model = new Model(model);
    else this._model = model;
  }

  train(input: string | Array<string>, label: string) {
    if (typeof input !== "string" && !(input instanceof Array)) throw new Error("input must be a string or array of strings");
    if (typeof label !== "string") throw new Error("label must be a string");

    (Array.isArray(input) ? input : [input]).forEach(string => {
      let tokens = this.tokenize(string);
      if (this._model.vocabulary !== false) tokens = this.vectorize(tokens);

      if (typeof this._model.data[label] === "undefined") this._model.data[label] = {};
      Object.keys(tokens).forEach(index => {
        const occourences = tokens[index];
        if (typeof this._model.data[label][index] === "undefined") this._model.data[label][index] = 0;
        this._model.data[label][index] += occourences;
      });
    });

    return this;
  }

  predict(input: string, maxMatches = 1, minimumConfidence = 0.2) {
    if (typeof input !== "string") throw new Error("input must be a string");
    if (typeof maxMatches !== "number") throw new Error("maxMatches must be a number");
    if (typeof minimumConfidence !== "number") throw new Error("minimumConfidence must be a number");
    if (minimumConfidence < 0 || minimumConfidence > 1) throw new Error("minimumConfidence must be between 0 and 1");

    let tokens = this.tokenize(input);
    if (this._model.vocabulary !== false) tokens = this.vectorize(tokens);

    const predictions: Array<Prediction> = [];

    Object.keys(this._model.data).forEach(label => {
      const entry = this._model.data[label];
      const confidence = this.cosineSimilarity(tokens, entry);
      if (confidence >= minimumConfidence) predictions.push(new Prediction({ label, confidence }));
    });

    return predictions.sort((a, b) => {
      if (a.confidence === b.confidence) return 0;
      return a.confidence > b.confidence ? -1 : 1;
    }).slice(0, maxMatches);
  }

  splitWords(input: string) {
    if (typeof input !== "string") throw new Error("input must be a string");

    return input
      .replace(/'|´|’|-/g, "") // remove apostrophe, accent, and hyphen
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ") // replace all non-alphanumeric characters with a space
      .trim()
      .split(" ");
  }

  tokenize(input: string | Array<string>) {
    const words = Array.isArray(input) ? input : this.splitWords(input);
    const tokens: Tokens = {};

    words.forEach((word, index) => {
      let sequence = "";

      words.slice(index).forEach(nextWord => {
        sequence += ` ${nextWord}`;
        const tokenCount = sequence.split(" ").length;
        if (tokenCount < this._model.nGramMin || tokenCount > this._model.nGramMax) return;
        if (typeof tokens[sequence] === "undefined") tokens[sequence] = 0;
        tokens[sequence] += 1;
      });
    });

    return tokens;
  }

  vectorize(tokens: Tokens) {
    if (!(tokens instanceof Object) || tokens.constructor !== Object) throw new Error("tokens must be an object literal");
    if (this._model.vocabulary === false) throw new Error("cannot vectorize when vocabulary is false");


    const vector: Vector = {};

    Object.keys(tokens).forEach(token => {
      if (this._model.vocabulary === false) return;
      let vocabularyIndex = this._model.vocabulary.indexOf(token);
      if (vocabularyIndex === -1) {
        this._model.vocabulary.add(token);
        vocabularyIndex = this._model.vocabulary.size - 1;
      }

      vector[vocabularyIndex] = tokens[token];
    });

    return vector;
  }

  cosineSimilarity(vector1: Vector, vector2: Vector) {
    if (!(vector1 instanceof Object) || vector1.constructor !== Object) throw new Error("vector1 must be an object literal");
    if (!(vector2 instanceof Object) || vector2.constructor !== Object) throw new Error("vector2 must be an object literal");

    let dotProduct = 0;
    let vector1Magnitude = 0;
    let vector2Magnitude = 0;

    for (const i in vector1) {
      const value = vector1[i];
      if (typeof vector2[i] !== "undefined") dotProduct += value * vector2[i];
      vector1Magnitude += value ** 2;
    }

    for (const i in vector2) {
      const value = vector2[i];
      vector2Magnitude += value ** 2;
    }

    return dotProduct / (Math.sqrt(vector1Magnitude) * Math.sqrt(vector2Magnitude));
  }
}
