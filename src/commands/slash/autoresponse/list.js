module.exports = {
  description: "List all autoresponse groups with their autoresponses",
  options: []
};

const { CommandInteraction } = require("discord.js"), config = require("../../../../config"), { TrainingModel, emojis } = require("../../../database");

module.exports.execute = (interaction = new CommandInteraction) => TrainingModel.find().then(models => interaction.reply({
  content: models.length ? null : `${emojis.get("error")} No autoresponse groups found`,
  embeds: models.map(m => ({
    title: `Group: ${m.name} (${m.data.size})`,
    description: [...m.data.keys()].map(id => `\`${id}\``).join(", ") || "*Empty*",
    color: config.colors.success
  })),
  ephemeral: true
}));