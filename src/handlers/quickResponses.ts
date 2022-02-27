import { Message } from "discord.js";
import QuickResponse from "../database/models/quickResponse";
import config from "../config";

export default async function handleQuickResponses(message: Message, name: string) {
  if (message.guildId !== config.guildId) return;

  const quickResponse = await QuickResponse.findOne({ name }).catch(() => null);
  if (quickResponse && message.channel.isText() && message.channel.type !== "DM") {
    const reference = message.reference ? await message.fetchReference() : null;
    const content = (reference ? `> [Reply to ${reference.author.toString()}'s message](<${reference.url}>): *${reference.cleanContent.split("\n").slice(0, 3).join("; ") + (reference.cleanContent.split("\n").length > 3 ? "..." : "")}*\n\n` : "") + quickResponse.body;

    const parent = message.channel.isThread() ? message.channel.parent : message.channel;
    const webhooks = await parent?.fetchWebhooks();
    const webhook = webhooks?.find(webhook => webhook.name === "Kai Quick Response") || await parent?.createWebhook("Kai Quick Response");

    await webhook?.send({
      allowedMentions: { users: reference ? [reference.author.id] : []},
      avatarURL: message.member?.displayAvatarURL() || message.author.displayAvatarURL(),
      content,
      threadId: message.channel.isThread() ? message.channel.parentId ?? undefined : undefined,
      username: message.member?.displayName || message.author.username,
    }).then(() => message.delete());
  }
}
