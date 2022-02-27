import { DocumentType, getModelForClass, prop } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";

export class QuickResponse {
  @prop({ type: String, required: true }) name!: string;
  @prop({ type: String, required: true }) body!: string;
}

export type BotLogDocument = DocumentType<QuickResponse, BeAnObject>;

export default getModelForClass(QuickResponse);
