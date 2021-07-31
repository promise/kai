const { Message, ButtonInteraction } = require("discord.js"), selfhelp = require("../constants/selfhelp.js"), { Classifier } = require("ml-classify-text"), fs = require("fs"), { join } = require("path"), { componentCallbacks } = require("./interactions.js");
const config = require("../../config.js");
const { emojis } = require("../database/index.js");

const classifiers = new Map(), datas = new Map();
fs.readdir(join(__dirname, "../constants/autoresponseData"), (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    const
      classifier = new Classifier({
        nGramMin: 2,
        nGramMax: 2
      }), data = require("../constants/autoresponseData/" + file);
    for (const label in data) classifier.train(data[label].input, label);
    classifiers.set(file.split(".")[0], classifier);
    datas.set(file.split(".")[0], data);
  });
});

module.exports = (message = new Message) => {
  if (message.content.startsWith(config.qrPrefix)) return;

  const help = selfhelp.find(h => h.channels.includes(message.channel?.id));
  if (help && help.autoresponses && classifiers.has(help.autoresponses)) {
    const classifier = classifiers.get(help.autoresponses);
    const predictions = classifier.predict(message.cleanContent);

    console.log(predictions);

    if (predictions.length) {
      const data = datas.get(help.autoresponses);
      const prediction = predictions.sort((a, b) => b.confidence - a.confidence).find(p => p.confidence >= data[p.label].confidenceRequired);
      
      if (prediction) {
        message.reply({
          content: data[prediction.label].output().split("\n").map(line => `> ${line}`).join("\n"),
          components: [{
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                style: "SECONDARY",
                label: `${prediction.label}: ${Math.floor(prediction.confidence * 100)}% confidence, ${data[prediction.label].confidenceRequired * 100}% required`,
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

componentCallbacks.set("autoresponse:accept", (interaction = new ButtonInteraction) => check(interaction, () => interaction.update({ content: `${emojis.get("success")} *Accepted as an answer by ${interaction.user}*\n` + interaction.message.content, components: [] })));
componentCallbacks.set("autoresponse:delete", (interaction = new ButtonInteraction) => check(interaction, () => interaction.message.delete()));

function check(interaction = new ButtonInteraction, callback = new Function) {
  if (!interaction.member.roles.cache.find(r => [
    config.permissions.staff,
    config.hereToHelpRole
  ].includes(r.id))) return interaction.reply({ content: `${emojis.get("error")} To improve accuracy, only <@&${config.permissions.staff}> and <@&${config.hereToHelpRole}>-members can accept or delete predictions.`, ephemeral: true });
  else return callback();
}