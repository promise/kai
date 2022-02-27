import QuickResponse from "../../../database/models/quickResponse";
import { SlashCommand } from "../../../types/command";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";

export default {
  description: "Delete a quick response",
  options: [
    {
      type: "STRING",
      name: "name",
      description: `The quick response name, for example "help" for \`${config.quickResponsePrefix}help\``,
      required: true,
    },
  ],
  execute: async (interaction, { name: _name }: { name: string; }, { error, success }) => {
    const name = _name.toLowerCase();

    const qr = await QuickResponse.findOne({ name });

    if (!qr) {
      return interaction.reply({
        content: `${error} The quick response \`${config.quickResponsePrefix + name}\` does not exist.`,
        ephemeral: true,
      });
    }

    components.set(`${interaction.id}:confirm`, i => {
      qr.delete();
      i.update({
        content: `${success} The quick response \`${config.quickResponsePrefix + name}\` has been deleted.`,
        embeds: [],
        components: [],
      });
    });

    components.set(`${interaction.id}:cancel`, i => i.update({
      content: `${error} Cancelled.`,
      embeds: [],
      components: [],
    }));

    interaction.reply({
      content: qr.body,
      embeds: [
        {
          description: "Are you sure you want to delete this quick response?",
          color: config.colors.warning,
        },
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              style: "SUCCESS",
              label: "Confirm",
              customId: `${interaction.id}:confirm`,
            },
            {
              type: "BUTTON",
              style: "DANGER",
              label: "Cancel",
              customId: `${interaction.id}:cancel`,
            },
          ],
        },
      ],
    });
  },
} as SlashCommand;
