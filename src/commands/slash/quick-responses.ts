import { InteractionReplyOptions, MessageEmbedOptions } from "discord.js";
import QuickResponse from "../../database/models/quickResponse";
import { SlashCommand } from "../../types/command";
import { components } from "../../handlers/interactions/components";
import config from "../../config";

export default {
  description: "Get a list of quick responses you can use",
  execute: (interaction, _, { blank, selected }) => QuickResponse.find().then(responses => {
    if (!responses.length) {
      return interaction.reply({
        embeds: [
          {
            title: "No quickresponses are available",
            description: "There are no quick response available as of right now, create one with `/quick-response set`",
            color: config.colors.error,
          },
        ],
        ephemeral: true,
      });
    }

    const embeds: Array<MessageEmbedOptions> = responses.sort((a, b) => a.name > b.name ? 1 : -1).map((qr, i, all) => ({
      fields: [
        {
          name: "Selected",
          value: all.map(({ name }, j) => `${i === j ? selected : blank}\`${config.quickResponsePrefix + name}\``).slice(Math.max(0, Math.min(i - 4, responses.length - 9)), Math.min(responses.length, i - (Math.min(0, i - 4) - 5))).join("\n"),
          inline: true,
        },
        {
          name: config.quickResponsePrefix + qr.name,
          value: qr.body,
          inline: true,
        },
      ],
      color: config.colors.success,
    }));

    let index = 0;
    components.set(`${interaction.id}:prev`, i => {
      index -= 1;
      if (index < 0) index = responses.length - 1;
      i.update(createMessage(embeds, index, interaction.id));
    });
    components.set(`${interaction.id}:next`, i => {
      index += 1;
      if (index >= responses.length) index = 0;
      i.update(createMessage(embeds, index, interaction.id));
    });
    interaction.reply(createMessage(embeds, index, interaction.id));
  }),
} as SlashCommand;

function createMessage(embeds: Array<MessageEmbedOptions>, index: number, id: string): InteractionReplyOptions {
  return {
    content: `Viewing info of quick-response #${index + 1} out of ${embeds.length} total.\n**Tip:** You can reply to someone's message with a quick response using Discord's Reply functionality.`,
    embeds: [embeds[index]],
    components: [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            style: "SECONDARY",
            emoji: {
              id: null,
              name: "◀",
            },
            customId: `${id}:prev`,
          },
          {
            type: "BUTTON",
            style: "SECONDARY",
            emoji: {
              id: null,
              name: "▶",
            },
            customId: `${id}:next`,
          },
        ],
      },
    ],
    ephemeral: true,
  };
}
