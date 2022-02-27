import { Guild } from "discord.js";

export default async (guild: Guild) => {
  const category = guild.channels.cache.find(c => c.name === "Reposting" && c.type === "GUILD_CATEGORY") || await guild.channels.create("Reposting", { type: "GUILD_CATEGORY" });
  if (category.type !== "GUILD_CATEGORY") return; // typescript

  guild.client.on("messageCreate", message => {
    if (
      message.author.bot !== true ||
      message.channel.type !== "GUILD_TEXT" ||
      message.channel.parentId !== category.id
    ) return;

    const channelId = message.channel.name; // channel name is the id of the channel to repost to
    const channel = guild.client.channels.cache.get(channelId);
    if (channel?.isText()) {
      if (message.embeds[0]?.author?.name?.endsWith("[bot]")) return; // ignore GitHub bot messages
      channel.send({
        content: message.content || null,
        embeds: message.embeds,
        attachments: Array.from(message.attachments.values()),
      });
    }
  });
};
