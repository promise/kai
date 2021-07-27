const { Client, Message, GuildMember, TextChannel, ButtonInteraction } = require("discord.js"), { tickets, emojis } = require("../database"), config = require("../../config");
const { componentCallbacks } = require("../handlers/interactions");

const ticketMoveQueue = new Map(), serverInviteRequests = new Map();

module.exports = async (client = new Client) => {
  client.on("messageCreate", (message = new Message) => {
    if (message.guild && message.channel.id) {
      const ticket = tickets.get(message.channel.id);
      if (ticket) {
        if (message.author.id == ticket.owner) { // if ticket owner responded
          if (message.channel.parentId == config.tickets.categories.replied) { // if ticket is in the replied category
            if (!ticketMoveQueue.has(message.channel.id)) ticketMoveQueue.set(message.channel.id, setTimeout(() => message.channel.setParent(config.tickets.categories.inbox, { lockPermissions: false }), config.tickets.moveTimeout)); // move it after some time
          }
        } else if (!message.author.bot) { // if a mod responded
          const timeout = ticketMoveQueue.get(message.channel.id);
          if (timeout) {
            ticketMoveQueue.delete(message.channel.id);
            clearTimeout(timeout); // if it's supposed to move to the inbox after some time, stop the timeout so it doesn't move over
            if (ticket.notify) message.channel.send({
              content: `<@${ticket.owner}> New reply to your ticket in **${message.guild.name}**`,
              allowedMentions: { users: [ ticket.owner ] }
            }).then(m => m.delete()); // ghost ping the ticket owner
          }

          if (message.channel.parentId == config.tickets.categories.inbox) message.channel.setParent(config.tickets.categories.replied, { lockPermissions: false }); // if ticket is in the inbox, move it to the replied category
        }
      }
    } else if (message.channel.type == "DM") {
      const request = serverInviteRequests.get(message.author.id);
      if (request) {
        const ticket = tickets.get(request);
        if (ticket) client.fetchInvite(message.content).then(invite => {
          tickets.set(request, {
            ...ticket,
            server: invite.code
          });
          serverInviteRequests.delete(message.author.id);
          message.react(emojis.get("success")); // a form of delay
          update(client.channels.resolve(request)); // update the bot message
        }).catch(() => message.react(emojis.get("error"))); else message.react(emojis.get("error"));
      }
    }
  });

  client.on("guildMemberRemove", (member = new GuildMember) => {
    const memberTickets = tickets.raw().filter(({ data }) => data.includes(member.id)).map(({ ID }) => ({ ID, ticket: tickets.get(ID) })).filter(({ ticket }) => ticket.owner == member.id);
    memberTickets.forEach(ticket => {
      if (!ticket.closed) client.channels.resolve(ticket.ID)?.send({
        content: "*Ticket owner has left the server.*",
        components: [{
          type: "ACTION_ROW",
          components: [{
            type: "BUTTON",
            style: "DANGER",
            label: "Close ticket",
            custom_id: "ticket:close"
          }]
        }]
      });
    });
  });
};

const botMessage = ({
  owner = (new GuildMember).id,
  creator = (new GuildMember).id,
  description = "*No issue description*",
  timestamp = Date.now(),
  notify = true,
  server = null
}) => ({
  content: `Ticket for <@${owner}>, created <t:${Math.round(timestamp / 1000)}:R>${creator !== owner ? ` by <@${creator}>` : ""}.\n${description.split("\n").map(l => `> ${l}`).join("\n")} ${server ? `\n\n**Server invite:** discord.gg/${server}` : ""}`,
  allowedMentions: { users: [ owner ] },
  components: [
    {
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          style: server ? "SECONDARY" : "PRIMARY",
          label: server ? "Server linked (Unlink)" : "Link server",
          custom_id: server ? "ticket:unlink" : "ticket:link"
        },
        {
          type: "BUTTON",
          style: notify ? "SECONDARY" : "PRIMARY",
          label: notify ? "Notifications enabled" : "Notifications disabled",
          custom_id: notify ? "ticket:notify_disable" : "ticket:notify_enable"
        }
      ]
    },
    {
      type: "ACTION_ROW",
      components: [{
        type: "BUTTON",
        style: "DANGER",
        label: "Close ticket",
        custom_id: "ticket:close"
      }]
    }
  ]
});

componentCallbacks.set("ticket:link", (interaction = new ButtonInteraction) => {
  serverInviteRequests.set(interaction.user.id, interaction.message.channel.id);
  interaction.reply({ content: `${emojis.get("hello")} Send me a direct message with a server invite and I'll add it to this ticket for you :)`, ephemeral: true });
});

componentCallbacks.set("ticket:unlink", (interaction = new ButtonInteraction) => {
  const ticket = tickets.get(interaction.message.channel.id);
  if (ticket) {
    tickets.set(interaction.message.channel.id, {
      ...ticket,
      server: null
    });
    update(interaction.message.channel, interaction);
  }
});

componentCallbacks.set("ticket:notify_enable", (interaction = new ButtonInteraction) => {
  const ticket = tickets.get(interaction.message.channel.id);
  if (ticket) {
    tickets.set(interaction.message.channel.id, {
      ...ticket,
      notify: true
    });
    update(interaction.message.channel, interaction);
  }
});

componentCallbacks.set("ticket:notify_disable", (interaction = new ButtonInteraction) => {
  const ticket = tickets.get(interaction.message.channel.id);
  if (ticket) {
    tickets.set(interaction.message.channel.id, {
      ...ticket,
      notify: false
    });
    update(interaction.message.channel, interaction);
  }
});

componentCallbacks.set("ticket:close", (interaction = new ButtonInteraction) => close(interaction.message.channel, interaction.member));

async function create(member = new GuildMember, creator = new GuildMember, description) {
  const guild = member.client.guilds.resolve(config.guild), channel = await guild.channels.create(`${member.user.username.substring(0, 4)}-${member.user.discriminator}`, {
    parent: config.tickets.categories.inbox,
    permissionOverwrites: [
      {
        id: member.id,
        allow: [ "VIEW_CHANNEL" ]
      },
      {
        id: config.permissions.staff,
        allow: [ "VIEW_CHANNEL" ]
      },
      {
        id: guild.roles.everyone.id,
        deny: [ "VIEW_CHANNEL" ]
      }
    ]
  });

  const ticket = {
    owner: member.id,
    creator: creator.id,
    channel: channel.id,
    description,
    timestamp: Date.now(),
    notify: true,
    server: null
  };

  const message = await channel.send(botMessage(ticket));
  message.pin();

  ticket.message = message.id;

  tickets.set(channel.id, ticket);
  return channel;
}

async function update(channel = new TextChannel, buttonInteraction) {
  const ticket = tickets.get(channel.id);
  if (!ticket) return null;

  if (buttonInteraction) buttonInteraction.update(botMessage(ticket)); else {
    const message = await channel.messages.fetch(ticket.message);
    if (message) message.edit(botMessage(ticket));
    return true;
  }
}

async function close(channel = new TextChannel, member = new GuildMember) {
  const ticket = tickets.get(channel.id);
  if (!ticket) return null;

  tickets.set(channel.id, {
    ...ticket,
    closed: true,
    closedBy: member.id
  });

  await channel.delete();
  return true;
}

module.exports.create = create;
module.exports.update = update;
module.exports.close = close;