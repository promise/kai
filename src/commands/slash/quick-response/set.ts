import QuickResponse from "../../../database/models/quickResponse";
import { SlashCommand } from "../../../types/command";
import { components } from "../../../handlers/interactions/components";
import config from "../../../config";

export default {
  description: "Set or create a quick response",
  options: [
    {
      type: "STRING",
      name: "name",
      description: `Define the quick response name, for example "help" for \`${config.quickResponsePrefix}help\``,
      required: true,
    },
    {
      type: "STRING",
      name: "body",
      description: "Define the body of the quick response; use ;; for new line",
      required: true,
    },
  ],
  execute: (interaction, { name: _name, body: _body }: { name: string; body: string; }, { error, success }) => {
    const name = _name.toLowerCase();
    const body = _body.replace(/;;/g, "\n");

    components.set(`${interaction.id}:confirm`, i => {
      QuickResponse.findOne({ name }).then(_qr => {
        const qr = _qr || new QuickResponse({ name });
        qr.body = body;
        qr.save();
      });

      i.update({
        content: `${success} The quick response \`${config.quickResponsePrefix + name}\` is now set.`,
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
      content: body,
      embeds: [
        {
          description: `Are you sure you want to set \`${config.quickResponsePrefix + name}\` to this?`,
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
