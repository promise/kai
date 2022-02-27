import { SlashCommand } from "../../../types/command";
import TrainingModel from "../../../database/models/trainingModel";
import config from "../../../config";

export default {
  description: "Get information about an auto response",
  options: [
    {
      type: "STRING",
      name: "group",
      description: "The autoresponse group name, you can find this under `/autoresponse list`",
      required: true,
    },
    {
      type: "STRING",
      name: "id",
      description: "The autoresponse ID, you can find this under `/autoresponse list`",
      required: true,
    },
  ],
  execute: (interaction, { group, id }: { group: string; id: string; }, { error }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) return interaction.reply({ content: `${error} This autoresponse group does not exist.`, ephemeral: true });

    const data = model.data.get(id);
    if (!data) return interaction.reply({ content: `${error} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

    return interaction.reply({
      embeds: [
        {
          title: `${group}: ${id}`,
          fields: [
            { name: "Quick-response", value: `\`${config.quickResponsePrefix + data.quickResponse}\``, inline: true },
            { name: "Confidence", value: `${data.confidenceRequired * 100}% required`, inline: true },
          ],
          color: config.colors.success,
        },
      ],
      ephemeral: true,
      files: [
        {
          name: `training_data_${group}:${id}.json`,
          attachment: Buffer.from(JSON.stringify(data.input, null, 2)),
        },
      ],
    });
  }),
} as SlashCommand;
