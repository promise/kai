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
      description: "The autoresponse ID, you can find this under `/autoresponse list`",
      required: true
    },
    {
      type: "STRING",
      name: "training_data",
      description: "Training data you want to add. Separate multiple with ;"
    }
  ]
};

const { CommandInteraction } = require("discord.js"), { mlTraining, emojis } = require("../../../database"), { updateClassifiers } = require("../../../handlers/autoresponse");

module.exports.execute = (interaction = new CommandInteraction, { group, id, quickresponse, training_data = null }) => mlTraining.findOne({ name: group }, (_, model) => {
  if (!model) return interaction.reply({ content: `${emojis.get("error")} This autoresponse group does not exist.`, ephemeral: true });
  if (model.data.has(id)) return interaction.reply({ content: `${emojis.get("error")} This autoresponse already exists in the group \`${group}\``, ephemeral: true });

  model.data.set(id, { quickresponse });
  if (training_data) model.data.get(id).input.push(...training_data.split(";"));
  model.save().then(updateClassifiers);

  return interaction.reply({ content: `${emojis.get("success")} The autoresponse has been created.`, ephemeral: true });
});