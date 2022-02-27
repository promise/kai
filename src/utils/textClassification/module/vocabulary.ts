/* eslint-disable no-underscore-dangle */

export type VocabularyTermsInput = Array<string> | Set<string>;
export type VocabularyTerms = Set<string>;

export class Vocabulary {
  _terms: VocabularyTerms;
  constructor(terms: VocabularyTermsInput) {
    if (!(terms instanceof Array) && !(terms instanceof Set)) {
      throw new Error("terms must be an array or set literal");
    }

    this._terms = new Set(terms);
  }

  get size() {
    return this._terms.size;
  }

  get terms(): VocabularyTerms {
    return this._terms;
  }

  set terms(terms: VocabularyTermsInput) {
    if (!(terms instanceof Array) && !(terms instanceof Set)) {
      throw new Error("terms must be an array or set literal");
    }

    this._terms = new Set(terms);
  }

  add(terms: string | VocabularyTermsInput) {
    if (typeof terms !== "string" && !(terms instanceof Array) && !(terms instanceof Set)) {
      throw new Error("terms must be a string, array or set literal");
    }

    if (typeof terms === "string") {
      this._terms.add(terms);
    } else {
      terms.forEach(term => this._terms.add(term));
    }

    return this;
  }

  remove(terms: string | VocabularyTermsInput) {
    if (typeof terms !== "string" && !(terms instanceof Array) && !(terms instanceof Set)) {
      throw new Error("terms must be a string, array or set literal");
    }

    if (typeof terms === "string") {
      this._terms.delete(terms);
    } else {
      terms.forEach(term => this._terms.delete(term));
    }

    return this;
  }

  has(term: string) {
    return this._terms.has(term);
  }

  indexOf(term: string) {
    if (!this._terms.has(term)) {
      return -1;
    }

    return Array.from(this._terms).indexOf(term);
  }
}
