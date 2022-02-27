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
      required: true,
    },
    {
      type: "STRING",
      name: "training_data",
      description: "Training data you want to add. Separate multiple with ;",
    },
    {
      type: "NUMBER",
      name: "percentage",
      description: "The percentage of confidence required for the autoresponse to get sent",
    },
  ],
  execute: (interaction, { group, id, quick_response: quickResponse, training_data: trainingData, percentage = 100 }: { group: string; id: string; quick_response: string; training_data?: string; percentage?: number; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) return interaction.reply({ content: `${error} This autoresponse group does not exist.`, ephemeral: true });
    if (model.data.has(id)) return interaction.reply({ content: `${error} This autoresponse already exists in the group \`${group}\``, ephemeral: true });

    model.data.set(id, { quickResponse, confidenceRequired: percentage / 100, input: trainingData ? trainingData.split(";") : []});
    model.save().then(updateClassifiers);

    return interaction.reply({ content: `${success} The autoresponse has been created.`, ephemeral: true });
  }),
} as SlashCommand;
