const { Message, ButtonInteraction } = require("discord.js"), selfhelp = require("../constants/selfhelp.js"), { Classifier } = require("ml-classify-text"), { componentCallbacks } = require("./interactions.js"), config = require("../../config.js"), { emojis, QuickResponse, TrainingModel } = require("../database");

const classifiers = new Map(), models = new Map();
updateClassifiers();

module.exports = async (message = new Message) => {
  if (message.content.startsWith(config.qrPrefix)) return;

  const help = selfhelp.find(h => h.channels.includes(message.channel?.id));
  if (help && help.ml_model && classifiers.has(help.ml_model)) {
    const classifier = classifiers.get(help.ml_model);
    const predictions = classifier.predict(message.cleanContent);

    if (predictions.length) {
      const data = models.get(help.ml_model);
      const prediction = predictions.sort((a, b) => b.confidence - a.confidence).find(p => p.confidence >= data.get(p.label).confidenceRequired);

      if (prediction) {
        const { quickresponse, confidenceRequired } = data.get(prediction.label);
        message.reply({
          content: (await QuickResponse.findOne({ name: quickresponse })).body.split("\n").map(line => `> ${line}`).join("\n"),
          components: [{
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                style: "SECONDARY",
                label: `${help.ml_model}:${prediction.label} • ${Math.floor(prediction.confidence * 100)}% confidence, ${confidenceRequired * 100}% required`,
                disabled: true,
                customId: "null"
              },
              {
                type: "BUTTON",
                style: "SUCCESS",
                emoji: {
                  id: null,
                  name: "✔"
                },
                customId: "autoresponse:accept"
              },
              {
                type: "BUTTON",
                style: "DANGER",
                emoji: {
                  id: null,
                  name: "🗑"
                },
                customId: "autoresponse:delete"
              }
            ]
          }],
          allowedMentions: { repliedUser: true }
        });
      }
    }
  }
};

componentCallbacks.set("autoresponse:accept", (interaction = new ButtonInteraction) => check(interaction, async () => {
  interaction.update({ content: `${emojis.get("success")} *Accepted as an answer by <@${interaction.user.id}>*\n` + interaction.message.content, components: [] });
  
  const message = await interaction.message.fetch(), reference = await interaction.message.fetchReference();
  const [ model, id ] = message.components[0].components[0].label.split(" • ")[0].split(":");

  TrainingModel.findOne({ name: model }).then(model => {
    if (model.data.has(id) && !model.data.get(id).input.includes(reference.cleanContent)) {
      model.data.get(id).input.push(reference.cleanContent);
      model.save().then(() => module.exports.updateClassifiers());
    }
  }).catch(); 
}));

componentCallbacks.set("autoresponse:delete", (interaction = new ButtonInteraction) => check(interaction, () => interaction.message.delete()));

function check(interaction = new ButtonInteraction, callback = new Function) {
  if (!interaction.member.roles.cache.find(r => [
    config.permissions.staff,
    config.permissions.helper
  ].includes(r.id))) return interaction.reply({ content: `${emojis.get("error")} To improve accuracy, only <@&${config.permissions.staff}> and <@&${config.permissions.helper}>-members can accept or delete predictions.`, ephemeral: true });
  else return callback();
}

function updateClassifiers() {
  TrainingModel.find().then(training_models => training_models.forEach(model => {
    const classifier = new Classifier({
      nGramMin: 2,
      nGramMax: 4
    });

    model.data.forEach(({ input }, id) => classifier.train(input, id));

    console.log(`Retrained model \`${model.name}\``);

    classifiers.set(model.name, classifier);
    models.set(model.name, model.data);
  }));
}

module.exports.updateClassifiers = updateClassifiers;
