import { SlashCommand } from "../../../../types/command";
import TrainingModel from "../../../../database/models/trainingModel";

export default {
  description: "Delete an autoresponse group",
  options: [
    {
      type: "STRING",
      name: "group",
      description: "The autoresponse group name, you can find this under `/autoresponse list`",
      required: true,
    },
  ],
  execute: (interaction, { group }: { group: string; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) {
      return interaction.reply({
        content: `${error} This autoresponse group does not exist.`,
        ephemeral: true,
      });
    }

    model.delete();
    return interaction.reply({
      content: `${success} The autoresponse group has been deleted.`,
      ephemeral: true,
    });
  }),
} as SlashCommand;
