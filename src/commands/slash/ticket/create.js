module.exports = {
  description: "Set or create a quick response",
  options: [
    {
      type: "USER",
      name: "member",
      description: "The member you want to create the ticket for",
      required: true
    },
    {
      type: "STRING",
      name: "description",
      description: "The issue description, if you'd like to add this"
    }
  ]
};

const { CommandInteraction } = require("discord.js"), { create } = require("../../../modules/tickets"), { emojis } = require("../../../database");

module.exports.execute = async (interaction = new CommandInteraction, { member, description }) => {
  member = await interaction.guild.members.fetch(member);
  const channel = await create(member, interaction.member, description);
  interaction.reply({ content: `${emojis.get("success")} Ticket ${channel} has been created!`, ephemeral: true });
};