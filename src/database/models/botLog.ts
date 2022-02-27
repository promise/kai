import { DocumentType, Severity, getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import { Schema } from "mongoose";
import { Status } from "../../types/status";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class BotLog {
  @prop({ type: String, required: true }) bot!: string;
  @prop({ type: Schema.Types.Mixed, default: {}}) status!: Status; // eslint-disable-line @typescript-eslint/no-explicit-any
  @prop({ type: Date, default: Date.now }) date!: Date;
}

export type BotLogDocument = DocumentType<BotLog, BeAnObject>;

export default getModelForClass(BotLog);
