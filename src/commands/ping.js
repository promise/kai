module.exports = {
  description: "Get the bot's ping",
  checkArgs: args => args.length == 0
};

const { Message } = require("discord.js"), { emojis } = require("../database"), { msToTime } = require("../constants/time");

module.exports.execute = async ({ channel, createdTimestamp, client } = new Message) => {
  const connection = emojis.get("connection"), m = await channel.send(`${connection} Testing connection...`);
  return m.edit(`${connection} Server latency is \`${m.createdTimestamp - createdTimestamp}ms\`, API latency is \`${Math.round(client.ws.ping)}ms\` and my uptime is \`${msToTime(client.uptime)}\``);
};