import { APIMessage } from "@discordjs/builders/node_modules/discord-api-types/payloads/v9/channel";
import { Module } from "../types/module";
import config from "../config";
import superagent from "superagent";

const discordMessageLinkRegex = /https:\/\/((canary|ptb)\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/gm;

export default (client => {
  client.on("messageCreate", async message => {
    if (
      message.author.bot ||
      message.channel.type === "DM"
    ) return;

    const discordMessageLinks = message.content.match(discordMessageLinkRegex);
    if (!discordMessageLinks) return;

    for (const link of discordMessageLinks) {
      const [, channelId, messageId] = link.split("/").slice(-3);
      await Promise.any<{
        apiMessage: APIMessage;
        token: string;
      }>([
        client.token,
        ...config.autoQuoteTokens,
      ].map(token => new Promise((resolve, reject) => {
        superagent.get(`${client.options.http?.api}/v${client.options.http?.version}/channels/${channelId}/messages/${messageId}`)
          .set("Authorization", `Bot ${token}`)
          .set("User-Agent", "Kai Auto Quote (https://github.com/biaw/kai-bot/blob/master/src/modules/autoQuote.ts)")
          .end((err, res) => {
            if (err) return reject(err);
            if (res.statusCode !== 200) return reject();
            resolve({ apiMessage: res.body, token });
          });
      }))).then(async ({ apiMessage }) => {
        if (message.channel.type === "DM") return; // typescript

        const parent = message.channel.isThread() ? message.channel.parent : message.channel;
        const webhooks = await parent?.fetchWebhooks();
        const webhook = webhooks?.find(webhook => webhook.name === "Kai Autoquote") || await parent?.createWebhook("Kai Autoquote");

        await webhook?.send({
          allowedMentions: { parse: [], repliedUser: false, roles: [], users: []},
          avatarURL: `${client.options.http?.cdn}/avatars/${apiMessage.author.id}/${apiMessage.author.avatar}.png?size=128`,
          content: apiMessage.content || null,
          embeds: apiMessage.embeds,
          threadId: message.channel.isThread() ? message.channel.parentId ?? undefined : undefined,
          username: apiMessage.author.username,
        });
      }).catch(() => message.react("🤷‍♂️"));
    }
  });
}) as Module;
