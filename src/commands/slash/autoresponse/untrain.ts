import { SlashCommand } from "../../../types/command";
import TrainingModel from "../../../database/models/trainingModel";
import { updateClassifiers } from "../../../utils/textClassification";

export default {
  description: "Remove a string from autoresponse training",
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
      description: "The string you want to remove from training, for example \"I need help\". Separate multiple with ;",
      required: true,
    },
  ],
  execute: (interaction, { group, id, string }: { group: string; id: string; string: string; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) return interaction.reply({ content: `${error} This autoresponse group does not exist.`, ephemeral: true });

    const data = model.data.get(id);
    if (!data) return interaction.reply({ content: `${error} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

    string.split(";").forEach(s => data.input.splice(data.input.indexOf(s), 1));
    model.save().then(updateClassifiers);

    return interaction.reply({ content: `${success} The training data has been removed`, ephemeral: true });
  }),
} as SlashCommand;
