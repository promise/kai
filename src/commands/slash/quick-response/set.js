module.exports = {
  description: "Set or create a quick response",
  options: [
    {
      type: "STRING",
      name: "name",
      description: `Define the quick response name, for example "help" for \`${require("../../../../config").qrPrefix}help\``,
      required: true
    },
    {
      type: "STRING",
      name: "body",
      description: "Define the body of the quick response; use ;; for new line",
      required: true
    }
  ]
};

const { CommandInteraction } = require("discord.js"), config = require("../../../../config"), { QuickResponse, emojis } = require("../../../database");

module.exports.execute = (interaction = new CommandInteraction, { name, body }, { componentCallbacks }) => {
  name = name.toLowerCase();
  body = body.split(";;").join("\n");

  componentCallbacks.set(`${interaction.id}:confirm`, newInteraction => {
    QuickResponse.findOne({ name }, (_, qr) => {
      if (!qr) qr = new QuickResponse({ name });
      qr.body = body;
      qr.save();
    });

    newInteraction.update({
      content: `${emojis.get("success")} The quick response \`${config.qrPrefix + name}\` is now set.`,
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
      description: `Are you sure you want to set \`${config.qrPrefix + name}\` to this?`,
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