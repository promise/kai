import { Status } from "../types/status";
import { Ticket } from "../types/tickets";
import config from "../config";
import { createMemoryDatabase } from "./memory";
import { createQuickDatabase } from "./quick";
import mongoose from "mongoose";
import { mongooseLogger } from "../utils/logger/mongoose";

mongoose.set("debug", (collectionName, method, query, doc) => mongooseLogger.debug(JSON.stringify({ collectionName, method, query, doc })));

export const mongoConnection = mongoose.connect(config.databaseUri);

mongoConnection
  .then(() => mongooseLogger.info("Connected to database"))
  .catch(err => mongooseLogger.error(`Error when connecting to database: ${JSON.stringify({ err })}`));

export const emojis = createQuickDatabase<string>("emojis");
export const reactionRoles = createQuickDatabase<{ [emoji: string]: string; }>("reactionRoles");
export const statuses = createMemoryDatabase<Status>(); // any
export const tickets = createQuickDatabase<Ticket>("tickets");
