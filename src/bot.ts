import { Client, Options } from "discord.js";
import { Module } from "./types/module";
import autoResponseHandler from "./handlers/autoResponses";
import config from "./config";
import directMessageHandler from "./handlers/directMessages";
import { discordLogger } from "./utils/logger/discord";
import { inspect } from "util";
import interactionHandler from "./handlers/interactions";
import { join } from "path";
import { kaiLogger } from "./utils/logger/kai";
import messageCommandHandler from "./handlers/messageCommands";
import { mongoConnection } from "./database";
import quickResponseHandler from "./handlers/quickResponses";
import { readdir } from "fs/promises";

const client = new Client({
  makeCache: Options.cacheWithLimits({
    ...config.client.caches,
  }),
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
  userAgentSuffix: [
    "Kai Bot",
    "https://github.com/biaw/kai-bot",
  ],
  presence: {
    status: "online",
    activities: [
      {
        type: "WATCHING",
        name: "🦋",
      },
    ],
  },
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
  allowedMentions: {
    parse: [],
    roles: [],
    users: [],
    repliedUser: true,
  },
});

client.once("ready", client => {
  kaiLogger.info(`Logged in as ${client.user.tag}`);

  interactionHandler(client);

  readdir(join(__dirname, "modules"))
    .then(async files => {
      for (const file of files) {
        try {
          const module = (await import(join(__dirname, "modules", file))).default as Module;
          await module(client);
          kaiLogger.info(`Module "${file}" loaded`);
        } catch (e) {
          kaiLogger.error(`Module "${file}" failed to load: ${inspect(e)}`);
        }
      }
    })
    .catch(e => kaiLogger.error(`Error running modules: ${inspect(e)}`));
});

client.on("messageCreate", message => {
  if (
    message.author.bot ||
    message.type !== "DEFAULT"
  ) return;

  if (!message.guild) return directMessageHandler(message);

  if (message.content.match(`^<@!?${client.user?.id}> `)) return messageCommandHandler(message);
  if (message.content.match(`^<@!?${client.user?.id}>`)) {
    return void message.reply({
      content: `I am an open-sourced & private bot by <@${config.ownerId}>. Also, butterflies are cute.`,
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              label: "Source Code",
              style: "LINK",
              url: "https://github.com/biaw/kai-bot",
            },
          ],
        },
      ],
    });
  }

  if (message.content.startsWith(config.quickResponsePrefix)) return quickResponseHandler(message, message.content.slice(config.quickResponsePrefix.length).toLowerCase());

  autoResponseHandler(message);
});

client
  .on("debug", info => void discordLogger.debug(info))
  .on("error", error => void discordLogger.error(`Cluster errored. ${inspect(error)}`))
  .on("rateLimit", rateLimitData => void discordLogger.warn(`Rate limit ${JSON.stringify(rateLimitData)}`))
  .on("ready", () => void discordLogger.info("All shards have been connected."))
  .on("shardDisconnect", (event, id) => void discordLogger.warn(`Shard ${id} disconnected. ${inspect(event)}`))
  .on("shardError", (error, id) => void discordLogger.error(`Shard ${id} errored. ${inspect(error)}`))
  .on("shardReady", id => void discordLogger.info(`Shard ${id} is ready.`))
  .on("shardReconnecting", id => void discordLogger.warn(`Shard ${id} is reconnecting.`))
  .on("shardResume", (id, replayed) => void discordLogger.info(`Shard ${id} resumed. ${replayed} events replayed.`))
  .on("warn", info => void discordLogger.warn(info));

mongoConnection.then(() => {
  kaiLogger.info("Database connected, logging in to Discord.");
  client.login(config.client.token);
}).catch(e => kaiLogger.warn(`Database connection failed: ${inspect(e)}`));

process.on("unhandledRejection", e => kaiLogger.error(`Unhandled rejection: ${inspect(e)}`));
