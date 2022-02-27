import { SlashCommand } from "../../../types/command";
import TrainingModel from "../../../database/models/trainingModel";
import { updateClassifiers } from "../../../utils/textClassification";

export default {
  description: "Delete an auto response",
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
  execute: (interaction, { group, id }: { group: string; id: string; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) return interaction.reply({ content: `${error} This autoresponse group does not exist.`, ephemeral: true });
    if (!model.data.has(id)) return interaction.reply({ content: `${error} This autoresponse does not exist in the group \`${group}\``, ephemeral: true });

    model.data.delete(id);
    model.save().then(updateClassifiers);

    return interaction.reply({ content: `${success} The autoresponse has been deleted.`, ephemeral: true });
  }),
} as SlashCommand;
