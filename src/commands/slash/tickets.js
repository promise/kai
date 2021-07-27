module.exports = {
  description: "See your tickets, and see general information about tickets"
};

const { CommandInteraction } = require("discord.js"), config = require("../../../config"), { tickets } = require("../../database");

module.exports.execute = async (interaction = new CommandInteraction) => {
  const memberTickets = tickets.raw().filter(({ data }) => data.includes(interaction.user.id)).map(({ ID }) => ({ ID, ticket: tickets.get(ID) })).filter(({ ID, ticket }) => ticket.owner == interaction.user.id && interaction.client.channels.resolve(ID));
  
  const ticketsAwaitingModerator = interaction.client.channels.resolve(config.tickets.categories.inbox).children.filter(ch => tickets.get(ch.id));
  const ticketsAwaitingResponse = interaction.client.channels.resolve(config.tickets.categories.replied).children.filter(ch => tickets.get(ch.id));
  
  interaction.reply({ embeds: [{
    fields: [
      {
        name: "General information",
        value: [
          `**${ticketsAwaitingModerator.size + ticketsAwaitingResponse.size}** tickets total`,
          `> **${ticketsAwaitingModerator.size}** tickets waiting for a moderator`,
          `> **${ticketsAwaitingResponse.size}** tickets waiting for a response`
        ].join("\n"),
        inline: true
      }, {
        name: "Your tickets",
        value: memberTickets.length ? memberTickets.map(({ ID }) => `<#${ID}>`).join(", ") : "*None*",
        inline: true
      }
    ],
    color: config.colors.success
  }], ephemeral: true });
};