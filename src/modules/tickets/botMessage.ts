import { MessageOptions, TextBasedChannel } from "discord.js";
import { emojis, tickets } from "../../database";
import { Ticket } from "../../types/tickets";
import { close } from ".";
import { components } from "../../handlers/interactions/components";

export default function generateBotMessage({ ownerId, creatorId, description, timestamp, notify, server }: Ticket): MessageOptions {
  return {
    content: [
      `Ticket for <@${ownerId}>, created <t:${Math.floor(timestamp / 1000)}:R> by <@${creatorId}>.`,
      description.split("\n").map(line => `> ${line}`).join("\n"),
      "",
      server ? `**Server Invite:** discord.gg/${server}` : "",
    ].join("\n"),
    allowedMentions: { users: [ownerId]},
    components: [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            style: server ? "SECONDARY" : "PRIMARY",
            label: server ? "Server linked (Unlink)" : "Link server",
            customId: server ? "ticket:unlink" : "ticket:link",
          },
          {
            type: "BUTTON",
            style: notify ? "SECONDARY" : "PRIMARY",
            label: notify ? "Notifications enabled" : "Notifications disabled",
            customId: notify ? "ticket:notify_disable" : "ticket:notify_enable",
          },
        ],
      },
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            style: "DANGER",
            label: "Close ticket",
            customId: "ticket:close",
          },
        ],
      },
    ],
  };
}

components.set("ticket:link", {
  allowedUsers: null,
  callback: async interaction => interaction.reply({
    content: `${await emojis.get("hello")} Send the server invite in here and it'll automatically be linked to the ticket :)`,
    ephemeral: true,
  }),
});

components.set("ticket:unlink", {
  allowedUsers: null,
  callback: async interaction => {
    const ticket = await tickets.get(interaction.channelId);
    if (ticket) {
      const updatedTicket = { ...ticket, server: null };
      tickets.set(interaction.channelId, updatedTicket);
      interaction.update(generateBotMessage(updatedTicket));
    }
  },
});

components.set("ticket:notify_enable", {
  allowedUsers: null,
  callback: async interaction => {
    const ticket = await tickets.get(interaction.channelId);
    if (ticket) {
      const updatedTicket = { ...ticket, notify: true };
      tickets.set(interaction.channelId, updatedTicket);
      interaction.update(generateBotMessage(updatedTicket));
    }
  },
});

components.set("ticket:notify_disable", {
  allowedUsers: null,
  callback: async interaction => {
    const ticket = await tickets.get(interaction.channelId);
    if (ticket) {
      const updatedTicket = { ...ticket, notify: false };
      tickets.set(interaction.channelId, updatedTicket);
      interaction.update(generateBotMessage(updatedTicket));
    }
  },
});

components.set("ticket:close", {
  allowedUsers: null,
  callback: interaction => close(interaction.channel as TextBasedChannel),
});
