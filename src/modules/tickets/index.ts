import { CategoryChannel, GuildMember, TextBasedChannel, TextChannel } from "discord.js";
import { Module } from "../../types/module";
import { Ticket } from "../../types/tickets";
import config from "../../config";
import generateBotMessage from "./botMessage";
import onMessage from "./message";
import { tickets } from "../../database";

export default (client => {
  client.on("messageCreate", async message => {
    const ticket = await tickets.get(message.channel.id);
    if (ticket) return onMessage(message, ticket);
  });

  client.on("guildMemberRemove", async member => {
    const allTickets = await tickets.get();
    const userTickets = Object.entries(allTickets).filter(([, ticket]) => ticket.ownerId === member.id);
    for (const [channelId] of userTickets) {
      const channel = member.guild.channels.resolve(channelId);
      if (channel?.isText()) {
        channel.send({
          content: "*Ticket owner has left the server.*",
          components: [
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
        });
      }
    }
  });
}) as Module;

export async function create(member: GuildMember, creator: GuildMember, description: string) {
  const category = member.client.channels.resolve(config.tickets.categories.inbox) as CategoryChannel;
  const channel = await category.guild.channels.create(`${member.user.username.substring(0, 4)}-${member.user.discriminator}`, {
    parent: category,
    permissionOverwrites: [
      {
        id: member,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: config.roles.staff,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: category.guild.roles.everyone,
        deny: ["VIEW_CHANNEL"],
      },
    ],
  }) as TextChannel;

  const ticket: Ticket = {
    ownerId: member.id,
    creatorId: creator.id,
    description,
    timestamp: Date.now(),
    notify: true,
    server: null,
    botMessageId: "",
  };

  const message = await channel.send(generateBotMessage(ticket));
  message.pin();

  ticket.botMessageId = message.id;

  tickets.set(channel.id, ticket);
  return channel;
}

export async function close(channel: TextBasedChannel) {
  const ticket = await tickets.get(channel.id);
  if (ticket) {
    tickets.set(channel.id, { ...ticket, closedById: ticket.creatorId });
    await channel.delete();
    return true;
  } return false;
}
