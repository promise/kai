module.exports = {
  description: "Delete an auto response",
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

const { CommandInteraction } = require("discord.js"), { mlTraining, emojis } = require("../../../database"), { updateClassifiers } = require("../../../handlers/autoresponse");

module.exports.execute = (interaction = new CommandInteraction, { group, id }) => mlTraining.findOne({ name: group }, (_, model) => {
  if (!model) return interaction.reply({ content: `${emojis.get("error")} This autoresponse group does not exist.`, ephemeral: true });
  if (!model.data.has(id)) return interaction.reply({ content: `${emojis.get("error")} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

  model.data.delete(id);
  model.save().then(updateClassifiers);

  return interaction.reply({ content: `${emojis.get("success")} The autoresponse has been deleted.`, ephemeral: true });
});