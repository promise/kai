/* eslint-disable no-underscore-dangle */
import { Vocabulary, VocabularyTermsInput } from "./vocabulary";

export type ModelData = {
  [label: string]: {
    [token: string]: number;
  }
};

export type ModelConfig = {
  nGramMin?: number;
  nGramMax?: number;
  vocabulary?: VocabularyTermsInput | false;
  data?: ModelData;
}

export class Model {
  _nGramMin: number;
  _nGramMax: number;
  _vocabulary: Vocabulary | false;
  _data: ModelData;

  constructor(config: ModelConfig = {}) {
    if (!(config instanceof Object) || config.constructor !== Object) {
      throw new Error("config must be an object literal");
    }

    const {
      nGramMin = 1,
      nGramMax = 1,
      vocabulary = [],
      data = {},
    } = config;

    if (nGramMin !== parseInt(`${nGramMin}`)) throw new Error("nGramMin must be an integer");
    if (nGramMax !== parseInt(`${nGramMax}`)) throw new Error("nGramMax must be an integer");
    if (nGramMin < 1) throw new Error("nGramMin must be greater than or equal to 1");
    if (nGramMax < 1) throw new Error("nGramMax must be greater than or equal to 1");
    if (nGramMin > nGramMax) throw new Error("nGramMin must be less than or equal to nGramMax");
    if (vocabulary !== false && !(vocabulary instanceof Array) && !(vocabulary instanceof Set)) throw new Error("vocabulary must be array, set or false");
    if (!(data instanceof Object) || data.constructor !== Object) throw new Error("data must be an object literal");

    this._nGramMin = nGramMin;
    this._nGramMax = nGramMax;
    this._vocabulary = vocabulary === false ? false : new Vocabulary(vocabulary);
    this._data = data;
  }

  get nGramMin() {
    return this._nGramMin;
  }

  set nGramMin(size: number) {
    if (size !== parseInt(`${size}`)) throw new Error("size must be an integer");
    if (size < 1) throw new Error("size must be greater than or equal to 1");

    this._nGramMin = size;
  }

  get nGramMax() {
    return this._nGramMax;
  }

  set nGramMax(size: number) {
    if (size !== parseInt(`${size}`)) throw new Error("size must be an integer");
    if (size < 1) throw new Error("size must be greater than or equal to 1");

    this._nGramMax = size;
  }

  get vocabulary(): Vocabulary | false {
    return this._vocabulary;
  }

  set vocabulary(vocabulary: VocabularyTermsInput | Vocabulary | false) {
    if (vocabulary !== false && !(vocabulary instanceof Vocabulary)) {
      this._vocabulary = new Vocabulary(vocabulary);
    } else this._vocabulary = vocabulary;
  }

  get data() {
    return this._data;
  }

  set data(data: ModelData) {
    if (!(data instanceof Object) || data.constructor !== Object) throw new Error("data must be an object literal");

    this._data = data;
  }

  serialize() {
    return {
      nGramMin: this._nGramMin,
      nGramMax: this._nGramMax,
      vocabulary: this._vocabulary ? Array.from(this._vocabulary.terms) : false,
      data: this._data,
    };
  }
}
