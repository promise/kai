import { SlashCommand } from "../../../../types/command";
import TrainingModel from "../../../../database/models/trainingModel";

export default {
  description: "Create an autoresponse group",
  options: [
    {
      type: "STRING",
      name: "group",
      description: "The autoresponse group name, you can find this under `/autoresponse list`",
      required: true,
    },
  ],
  execute: (interaction, { group }: { group: string; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (model) {
      return interaction.reply({
        content: `${error} This autoresponse group already exists.`,
        ephemeral: true,
      });
    }

    new TrainingModel({ name: group }).save();
    return interaction.reply({ content: `${success} The autoresponse group has been created.`, ephemeral: true });
  }),
} as SlashCommand;
