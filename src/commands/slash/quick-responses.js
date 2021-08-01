module.exports = {
  description: "Get a list of quick responses you can use"
};

const { Interaction } = require("discord.js"), config = require("../../../config"), { quickresponses, emojis } = require("../../database");

module.exports.execute = (interaction = new Interaction, _, { componentCallbacks }) => {
  if (!quickresponses.raw().length) return interaction.reply({
    embeds: [{
      title: "No quickresponses are available",
      description: "There are no quick response available as of right now, create one with `/quick-response set`",
      color: config.colors.error
    }],
    ephemeral: true
  });

  const
    responses = quickresponses.raw().sort((a, b) => a.ID > b.ID ? 1 : -1),
    blank = emojis.get("blank"),
    selected = emojis.get("selected"),
    embeds = responses.map(({ ID }, i) => ({
      fields: [{
        name: "Selected", value: responses.map(({ ID: name }, j) => `${i == j ? selected : blank}\`${config.qrPrefix + name}\``).slice(Math.max(0, Math.min(i - 4, responses.length - 10)), Math.min(responses.length - 1, i - (Math.min(0, i - 4) - 5))).join("\n"), inline: true
      }, {
        name: config.qrPrefix + ID, value: quickresponses.get(ID), inline: true
      }],
      color: config.colors.success
    }));
  
  let i = 0;
  componentCallbacks.set(`${interaction.id}:prev`, newInteraction => {
    i -= 1;
    if (i < 0) i = responses.length - 1;
    newInteraction.update(createMessage(embeds, i, interaction.id));
  });
  componentCallbacks.set(`${interaction.id}:next`, newInteraction => {
    i += 1;
    if (i >= responses.length) i = 0;
    newInteraction.update(createMessage(embeds, i, interaction.id));
  });
  interaction.reply(createMessage(embeds, i, interaction.id));
};

function createMessage(embeds, i, id) {
  return {
    content: `Viewing info of quick-response #${i + 1} out of ${embeds.length} total.\n**Tip:** You can reply to someone's message with a quick response using Discord's Reply functionality.`,
    embeds: [ embeds[i] ],
    components: [{
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          style: "SECONDARY",
          emoji: {
            id: null,
            name: "◀"
          },
          custom_id: `${id}:prev`
        },
        {
          type: "BUTTON",
          style: "SECONDARY",
          emoji: {
            id: null,
            name: "▶"
          },
          custom_id: `${id}:next`
        }
      ]
    }],
    ephemeral: true
  };
}
