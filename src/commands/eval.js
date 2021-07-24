module.exports = {
  description: "Run JavaScript code",
  usage: {
    "<code ...>": "The JS code you want to run"
  },
  permission: "OWNER",
  checkArgs: args => args.length > 0
};

const { Message } = require("discord.js"), { emojis } = require("../database");

module.exports.execute = async ({ channel } = new Message, _, { content }) => {
  let m;
  try {
    let evaled = eval(content);
    if (evaled instanceof Promise) {
      let start = Date.now();
      m = channel.send(`${emojis.get("blank")} Running...`);
      await Promise.all([ m, evaled ]).then(([ botMsg, output ]) => {
        if (typeof output != "string") output = require("util").inspect(output);
        botMsg.edit(`${emojis.get("success")} Evaluated successfully (\`${Date.now() - start}ms\`).\n\`\`\`js\n${output}\`\`\``);
      });
    } else {
      if (typeof evaled != "string") evaled = require("util").inspect(evaled);
      channel.send(`${emojis.get("success")} Evaluated successfully.\n\`\`\`js\n${evaled}\`\`\``);
    }
  } catch(e) {
    let err;
    if (typeof e == "string") err = e.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else err = e;
    let content = `${emojis.get("error")} JavaScript failed.\n\`\`\`fix\n${err}\`\`\``;
    if (m) (await m).edit(content); else channel.send(content);
  }
};