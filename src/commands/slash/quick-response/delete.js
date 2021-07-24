module.exports = {
  description: "Delete a quick response",
  options: [
    {
      type: "STRING",
      name: "name",
      description: `The quick response name, for example "help" for \`${require("../../../../config").qrPrefix}help\``,
      required: true
    }
  ]
};

const { Interaction } = require("discord.js"), config = require("../../../../config"), { quickresponses, emojis } = require("../../../database");

module.exports.execute = (interaction = new Interaction, { name }, { componentCallbacks }) => {
  name = name.toLowerCase();
  const body = quickresponses.get(name);

  if (!body) return interaction.reply({
    content: `${emojis.get("error")} The quick response \`${config.qrPrefix + name}\` does not exist.`, ephemeral: true
  });

  componentCallbacks.set(`${interaction.id}:confirm`, newInteraction => {
    quickresponses.unset(name);
    newInteraction.update({
      content: `${emojis.get("success")} The quick response \`${config.qrPrefix + name}\` has been deleted.`,
      embeds: [], components: []
    });
  });
  componentCallbacks.set(`${interaction.id}:cancel`, newInteraction => newInteraction.update({
    content: `${emojis.get("error")} Cancelled.`,
    embeds: [], components: []
  }));

  interaction.reply({
    content: body,
    embeds: [{
      description: "Are you sure you want to delete this quick response?",
      color: config.colors.warning
    }],
    components: [{
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          style: "SUCCESS",
          label: "Confirm",
          custom_id: `${interaction.id}:confirm`
        },
        {
          type: "BUTTON",
          style: "DANGER",
          label: "Cancel",
          custom_id: `${interaction.id}:cancel`
        }
      ]
    }]
  });
};