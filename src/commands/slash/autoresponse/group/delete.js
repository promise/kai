module.exports = {
  description: "Create an autoresponse group",
  options: [
    {
      type: "STRING",
      name: "group",
      description: "The autoresponse group name, you can find this under `/autoresponse list`",
      required: true
    }
  ]
};

const { CommandInteraction } = require("discord.js"), { mlTraining, emojis } = require("../../../../database");

module.exports.execute = (interaction = new CommandInteraction, { group }) => mlTraining.findOne({ name: group }, (_, model) => {
  if (!model) return interaction.reply({ content: `${emojis.get("error")} This autoresponse group does not exist.`, ephemeral: true });

  model.delete();

  return interaction.reply({ content: `${emojis.get("success")} The autoresponse group has been deleted.`, ephemeral: true });
});