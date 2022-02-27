import { SlashCommand } from "../../../types/command";
import TrainingModel from "../../../database/models/trainingModel";
import config from "../../../config";

export default {
  description: "List all autoresponse groups with their autoresponses",
  options: [],
  execute: (interaction, _, { error }) => TrainingModel.find().then(models => interaction.reply({
    content: models.length ? null : `${error} No autoresponse groups found`,
    embeds: models.map(m => ({
      title: `Group: ${m.name} (${m.data.size})`,
      description: Array.from(m.data.keys()).map(id => `\`${id}\``).join(", ") || "*Empty*",
      color: config.colors.success,
    })),
    ephemeral: true,
  })),
} as SlashCommand;
