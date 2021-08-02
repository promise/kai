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

const { CommandInteraction } = require("discord.js"), config = require("../../../../config"), { QuickResponse, emojis } = require("../../../database");

module.exports.execute = async (interaction = new CommandInteraction, { name }, { componentCallbacks }) => {
  name = name.toLowerCase();
  const qr = await QuickResponse.find({ name }).then(() => null);

  if (!qr) return interaction.reply({
    content: `${emojis.get("error")} The quick response \`${config.qrPrefix + name}\` does not exist.`, ephemeral: true
  });

  componentCallbacks.set(`${interaction.id}:confirm`, newInteraction => {
    qr.delete();
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
    content: qr.body,
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