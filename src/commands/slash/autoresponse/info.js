module.exports = {
  description: "Get information about an auto response",
  options: [
    {
      type: "STRING",
      name: "group",
      description: "The autoresponse group name, you can find this under `/autoresponse list`",
      required: true
    },
    {
      type: "STRING",
      name: "id",
      description: "The autoresponse ID, you can find this under `/autoresponse list`",
      required: true
    }
  ]
};

const { CommandInteraction } = require("discord.js"), { mlTraining, emojis } = require("../../../database");
const config = require("../../../../config");

module.exports.execute = (interaction = new CommandInteraction, { group, id }) => mlTraining.findOne({ name: group }, (_, model) => {
  if (!model) return interaction.reply({ content: `${emojis.get("error")} This autoresponse group does not exist.`, ephemeral: true });
  if (!model.data.has(id)) return interaction.reply({ content: `${emojis.get("error")} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

  const data = model.data.get(id);

  return interaction.reply({ embeds: [{
    title: `${group}: ${id}`,
    fields: [
      { name: "Quick-response", value: `\`${config.qrPrefix + data.quickresponse}\``, inline: true },
      { name: "Confidence", value: `${data.confidenceRequired * 100}% required`, inline: true },
      { name: `Training data (${data.input.length})`, value: data.input.length ? `\`\`\`js\n${JSON.stringify([...data.input], null, 2)}\`\`\`` : "*No data*" },
    ],
    color: config.colors.success
  }], ephemeral: true });
});