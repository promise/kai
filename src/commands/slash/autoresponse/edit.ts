import { SlashCommand } from "../../../types/command";
import TrainingModel from "../../../database/models/trainingModel";
import { updateClassifiers } from "../../../utils/textClassification";

export default {
  description: "Create an autoresponse",
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
    {
      type: "STRING",
      name: "quick_response",
      description: "The autoresponse ID, you can find this under `/autoresponse list`",
    },
    {
      type: "NUMBER",
      name: "percentage",
      description: "The percentage of confidence required for the autoresponse to get sent",
    },
  ],
  execute: (interaction, { group, id, quick_response: quickResponse, percentage }: { group: string; id: string; quick_response?: string; percentage?: number; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) return interaction.reply({ content: `${error} This autoresponse group does not exist.`, ephemeral: true });

    const data = model.data.get(id);
    if (!data) return interaction.reply({ content: `${error} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

    if (!quickResponse && !percentage) return interaction.reply({ content: `${error} You must specify either a quickresponse or a percentage in this command`, ephemeral: true });

    if (quickResponse) data.quickResponse = quickResponse;
    if (percentage) data.confidenceRequired = percentage;
    model.save().then(updateClassifiers);

    return interaction.reply({ content: `${success} The autoresponse has been edited.`, ephemeral: true });
  }),
} as SlashCommand;
