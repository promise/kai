import { DocumentType, getModelForClass, prop } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import { WhatIsIt } from "@typegoose/typegoose/lib/internal/constants";

export class TrainingModelData {
  @prop({ type: [String], default: []}, WhatIsIt.ARRAY) input!: Array<string>;
  @prop({ type: Number, default: 0.5 }) confidenceRequired!: number;
  @prop({ type: String, default: null }) quickResponse?: string;
}

export class TrainingModel {
  @prop({ type: String, required: true }) name!: string;
  @prop({ type: TrainingModelData, default: {}}, WhatIsIt.MAP) data!: Map<string, TrainingModelData>;
}

export type BotLogDocument = DocumentType<TrainingModel, BeAnObject>;

export default getModelForClass(TrainingModel);
