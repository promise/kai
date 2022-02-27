import { Module } from "../../types/module";
import { Role } from "discord.js";
import config from "../../config";
import emojiModule from "./emojis";
import repostingModule from "./reposting";

export default (async client => {
  const guild = client.guilds.cache.find(g => g.name === "Kai Internal Server") || await client.guilds.create("Kai Internal Server", {
    channels: [],
    defaultMessageNotifications: "ONLY_MENTIONS",
    explicitContentFilter: "DISABLED",
    icon: client.user.displayAvatarURL({ size: 1024 }),
    roles: [
      {
        id: "0",
        name: "Owner",
        color: config.colors.info,
        permissions: ["ADMINISTRATOR"],
        hoist: true,
      },
    ],
  });

  const ownerRole = guild.roles.cache.find(r => r.name === "Owner") as Role;

  client.on("guildMemberAdd", member => {
    if (
      member.id === config.ownerId &&
      member.guild.id === guild.id
    ) member.roles.add(ownerRole);
  });

  emojiModule(guild);
  repostingModule(guild);
}) as Module;
