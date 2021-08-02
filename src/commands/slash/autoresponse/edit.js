module.exports = {
  description: "Create an autoresponse",
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
    },
    {
      type: "STRING",
      name: "quickresponse",
      description: "The autoresponse ID, you can find this under `/autoresponse list`"
    },
    {
      type: "NUMBER",
      name: "percentage",
      description: "The percentage of confidence required for the autoresponse to get sent"
    }
  ]
};

const { CommandInteraction } = require("discord.js"), { mlTraining, emojis } = require("../../../database");

module.exports.execute = (interaction = new CommandInteraction, { group, id, quickresponse = null, percentage = null }) => mlTraining.findOne({ name: group }, (_, model) => {
  if (!model) return interaction.reply({ content: `${emojis.get("error")} This autoresponse group does not exist.`, ephemeral: true });
  if (model.data.has(id)) return interaction.reply({ content: `${emojis.get("error")} This autoresponse already exists in the group \`${group}\``, ephemeral: true });

  if (!quickresponse && !percentage) return interaction.reply({ content: `${emojis.get("error")} You must specify either a quickresponse or a percentage in this command`, ephemeral: true });

  if (percentage && percentage > 1) percentage /= 100;

  const data = model.data.get(id);
  if (quickresponse) data.quickresponse = quickresponse;
  if (percentage) data.confidenceRequired = percentage;
  model.save();

  return interaction.reply({ content: `${emojis.get("success")} The autoresponse has been edited.`, ephemeral: true });
});