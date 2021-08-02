module.exports = {
  description: "Remove a string from autoresponse training",
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
      name: "string",
      description: "The string you want to remove from training, for example \"I need help\". Separate multiple with ;",
      required: true
    }
  ]
};

const { CommandInteraction } = require("discord.js"), { mlTraining, emojis } = require("../../../database"), { updateClassifiers } = require("../../../handlers/autoresponse");

module.exports.execute = (interaction = new CommandInteraction, { group, id, string }) => mlTraining.findOne({ name: group }, (_, model) => {
  if (!model) return interaction.reply({ content: `${emojis.get("error")} This autoresponse group does not exist.`, ephemeral: true });
  if (!model.data.has(id)) return interaction.reply({ content: `${emojis.get("error")} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

  for (const s of string.split(";")) model.data.get(id).input.pull(s);
  model.save().then(updateClassifiers);

  return interaction.reply({ content: `${emojis.get("success")} The autoresponse has been added to training.`, ephemeral: true });
});