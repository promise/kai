import { SlashCommand } from "../../../types/command";
import TrainingModel from "../../../database/models/trainingModel";
import { updateClassifiers } from "../../../utils/textClassification";

export default {
  description: "Train an autoresponse with more training data",
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
      name: "string",
      description: "The string you want to train with, for example \"I need help\". Separate multiple with ;",
      required: true,
    },
  ],
  execute: (interaction, { group, id, string }: { group: string; id: string; string: string; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) return interaction.reply({ content: `${error} This autoresponse group does not exist.`, ephemeral: true });

    const data = model.data.get(id);
    if (!data) return interaction.reply({ content: `${error} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

    data.input.push(...string.split(";"));
    model.save().then(updateClassifiers);

    return interaction.reply({ content: `${success} The training data has been added`, ephemeral: true });
  }),
} as SlashCommand;
