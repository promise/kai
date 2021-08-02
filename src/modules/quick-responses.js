const { Client, Message } = require("discord.js"), { QuickResponse } = require("../database"), config = require("../../config");

module.exports = (client = new Client) => {
  // if message starts with . then get content from quickresponses and reply to the user with said content
  client.on("messageCreate", async (message = new Message) => {
    if (!message.guild || message.guild.id !== config.guild) return;
    if (message.content.startsWith(config.qrPrefix)) {
      const response = await QuickResponse.findOne({ name: message.content.substring(config.qrPrefix.length).toLowerCase() }).catch(() => null);
      if (response) message.channel.fetchWebhooks().then(async webhooks => {
        let webhook = webhooks.find(w => w.name == "Kai Quick Response");
        if (!webhook) webhook = await message.channel.createWebhook("Kai Quick Response");
        const reference = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : null;
        await webhook.send({
          username: message.author.username,
          avatarURL: message.author.avatarURL(),
          content: (reference ? `> [Reply to ${reference.author}'s message](<${reference.url}>): *${reference.cleanContent.split("\n").slice(0, 3).join("; ") + (reference.cleanContent.split("\n").length > 3 ? " ..." : "")}*\n\n` : "") + response.body,
          allowedMentions: { users: reference ? [ reference.author.id ] : [] }
        });
        message.delete();
      });
    }
  });
};