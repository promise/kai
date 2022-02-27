import { Invite, Message, TextChannel } from "discord.js";
import { emojis, tickets } from "../../database";
import { Ticket } from "../../types/tickets";
import config from "../../config";
import generateBotMessage from "./botMessage";

const ticketMoveQueue = new Map<string, NodeJS.Timeout>();

export default function onMessage(message: Message, ticket: Ticket) {
  const channel = message.channel as TextChannel;
  if (message.author.id === ticket.ownerId) {
    if (channel.parentId === config.tickets.categories.replied && !ticketMoveQueue.has(message.channelId)) ticketMoveQueue.set(message.channelId, setTimeout(() => channel.setParent(config.tickets.categories.inbox, { lockPermissions: false }), config.tickets.moveTimeout));
  } else if (!message.author.bot) {
    const timeout = ticketMoveQueue.get(message.channelId);
    if (timeout) {
      ticketMoveQueue.delete(message.channel.id);
      clearTimeout(timeout); // if it's supposed to move to the inbox after some time, stop the timeout so it doesn't move over
      if (ticket.notify) {
        message.channel.send({
          content: `<@${ticket.ownerId}> New reply to your ticket in **${message.guild?.name}**`,
          allowedMentions: { users: [ticket.ownerId]},
        }).then(m => m.delete());
      } // ghost ping the ticket owner
    }
    if (channel.parentId === config.tickets.categories.inbox) channel.setParent(config.tickets.categories.replied, { lockPermissions: false }); // if ticket is in the inbox, move it to the replied category
    const [inviteCode] = message.content.match(Invite.INVITES_PATTERN) || [null];
    if (inviteCode) {
      message.client.fetchInvite(inviteCode).then(async invite => {
        const updatedTicket = { ...ticket, server: invite.code };
        tickets.set(message.channelId, updatedTicket);
        message.react(await emojis.get("success"));
        message.channel.messages.fetch(ticket.botMessageId).then(botMessage => botMessage.edit(generateBotMessage(updatedTicket)));
      }).catch(async () => message.react(await emojis.get("error")));
    }
  }
}
