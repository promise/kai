import TrainingModel, { TrainingModelData } from "../../../database/models/trainingModel";
import { SlashCommand } from "../../../types/command";

export default {
  description: "Clean up an autoresponse's training data, or the entire group",
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
    },
  ],
  execute: (interaction, { group, id }: { group: string; id?: string; }, { error, success }) => TrainingModel.findOne({ name: group }).then(model => {
    if (!model) {
      return interaction.reply({
        content: `${error} This autoresponse group does not exist.`,
        ephemeral: true,
      });
    }

    if (id && !model.data.has(id)) {
      return interaction.reply({
        content: `${error} This autoresponse does not exist in the group \`${group}\``,
        ephemeral: true,
      });
    }

    (id ? [id] : Array.from(model.data.keys())).forEach(id => {
      const data = model.data.get(id) as TrainingModelData;
      const dupes = data.input.filter(s => s.includes(";"));
      for (const group of dupes.map(s => s.split(";"))) data.input.push(...group);
      data.input = data.input.map(s => s.toLowerCase()).filter((s, i, a) => a.indexOf(s) === i).filter(s => !dupes.includes(s));
    });
    model.save();

    return interaction.reply({ content: `${success} Cleaned up!`, ephemeral: true });
  }),
} as SlashCommand;
