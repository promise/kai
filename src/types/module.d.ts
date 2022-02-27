import { Client } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type Module = (client: Client<true>) => Promise<void> | void;
