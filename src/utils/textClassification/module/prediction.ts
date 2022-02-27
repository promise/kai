/* eslint-disable no-underscore-dangle */

export default class Prediction {
  _label: string;
  _confidence: number;

  constructor(prediction?: {
    label?: string;
    confidence?: number;
  }) {
    if (!(prediction instanceof Object) || prediction.constructor !== Object) {
      throw new Error("prediction must be an object literal");
    }

    this._label = prediction.label || "";
    this._confidence = prediction.confidence || 0;
  }

  get label() {
    return this._label;
  }

  set label(label: string) {
    if (typeof label !== "string") {
      throw new Error("label must be a string");
    }

    this._label = label;
  }

  get confidence() {
    return this._confidence;
  }

  set confidence(confidence: number) {
    if (typeof confidence !== "number") {
      throw new Error("confidence must be a number");
    }

    this._confidence = confidence;
  }
}
