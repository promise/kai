import { ButtonInteraction, Message, MessageButton } from "discord.js";
import { classifiers, models, updateClassifiers } from "../utils/textClassification";
import Prediction from "../utils/textClassification/module/prediction";
import QuickResponse from "../database/models/quickResponse";
import TrainingModel from "../database/models/trainingModel";
import { components } from "./interactions/components";
import config from "../config";
import { emojis } from "../database";
import selfhelp from "../constants/selfhelp";

export default async function handleAutoResponses(message: Message) {
  const help = selfhelp.find(h => h.channels.includes(message.channelId));
  const classifier = classifiers.get(help?.machineLearningModelId || "");
  const modelData = models.get(help?.machineLearningModelId || "");
  if (help?.machineLearningModelId && classifier && modelData) {
    const predictions = classifier.predict(message.cleanContent);
    const exact = Array.from(modelData.entries()).find(([, data]) => data.input.map(i => i.toLowerCase()).includes(message.cleanContent.toLowerCase()))?.[0];
    if (exact) predictions.push(new Prediction({ label: exact, confidence: 1 }));

    if (predictions.length) {
      const prediction = predictions.sort((a, b) => {
        if (a.confidence === b.confidence) return 0;
        return a.confidence > b.confidence ? -1 : 1;
      }).find(p => p.confidence >= (modelData.get(p.label)?.confidenceRequired || 1));

      if (prediction) {
        const { quickResponse, confidenceRequired } = modelData.get(prediction.label) || { confidenceRequired: 0 };
        const { body } = await QuickResponse.findOne({ name: quickResponse }) || {};
        if (body) {
          message.reply({
            content: body.split("\n").map(l => `> ${l}`).join("\n"),
            components: [
              {
                type: "ACTION_ROW",
                components: [
                  {
                    type: "BUTTON",
                    style: "SECONDARY",
                    label: `${help.machineLearningModelId}:${prediction.label} • ${Math.floor(prediction.confidence * 100)}% confidence, ${confidenceRequired * 100}% required`,
                    disabled: true,
                    customId: "disabled",
                  },
                  {
                    type: "BUTTON",
                    style: "SUCCESS",
                    emoji: {
                      id: null,
                      name: "✔",
                    },
                    customId: "autoresponse:accept",
                  },
                  {
                    type: "BUTTON",
                    style: "DANGER",
                    emoji: {
                      id: null,
                      name: "🗑",
                    },
                    customId: "autoresponse:reject",
                  },
                ],
              },
            ],
          });
        }
      }
    }
  }
}

components.set("autoresponse:accept", {
  allowedUsers: null,
  callback: interaction => check(interaction as ButtonInteraction, async () => {
    interaction.update({ content: `${await emojis.get("success")} *Accepted as an answer by ${interaction.user}*\n${interaction.message.content}`, components: []});

    const _ = interaction.message as Message;
    const message = await _.fetch();
    const reference = await _.fetchReference();

    const component = message.components[0].components[0] as MessageButton;
    const [model, id] = (component.label || "").split(" • ")[0].split(":");

    TrainingModel.findOne({ name: model }).then(model => {
      if (model?.data.has(id) && !model.data.get(id)?.input.includes(reference.cleanContent)) {
        model.data.get(id)?.input.push(reference.cleanContent);
        model.save().then(() => updateClassifiers());
      }
    }).catch();
  }),
});

components.set("autoresponse:reject", {
  allowedUsers: null,
  callback: interaction => check(interaction as ButtonInteraction, () => {
    const message = interaction.message as Message;
    message.delete();
  }),
});

function check(interaction: ButtonInteraction, callback: () => void) {
  const roles = (Array.isArray(interaction.member?.roles) ? interaction.member?.roles : Array.from(interaction.member?.roles?.cache.map(r => r.id) || [])) || [];
  if (roles.find(r => [
    config.roles.admin,
    config.roles.staff,
    config.roles.help,
  ].includes(r))) return callback();

  return emojis.get("error").then(error => interaction.reply({
    content: `${error} To improve accuracy, only <@&${config.roles.staff}> and <@&${config.roles.help}>-members can accept or reject predictions.`,
    ephemeral: true,
  }));
}
