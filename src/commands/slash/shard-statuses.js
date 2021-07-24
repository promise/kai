module.exports = {
  description: "Get all bots' shard statuses"
};

const { Interaction } = require("discord.js"), config = require("../../../config"), { fixed_width_image } = require("../../constants/embeds"), { emojis } = require("../../database"), statuses = require("../../utils/shardStatus");

module.exports.execute = async (interaction = new Interaction) => {
  const
    channel = await interaction.client.channels.fetch(interaction.channelId),
    bots = [
      Object.keys(config.botMonitors).filter(botInfo => config.botMonitors[botInfo].category == channel?.parent?.id),
      Object.keys(config.botMonitors)
    ].find(list => list.length), // finds first list that has actual bot ids in it
    embeds = (await Promise.all(bots.map(async id => await interaction.guild.members.fetch(id)))) // they're probably already cached so no need to optimize this eg. by fetching them all at once
      .filter(bot => bot)
      .map(bot => ({ bot, status: statuses.get(bot.id) }))
      .map(({ bot, status }) => {
        const embed = {
          author: {
            name: bot.user.tag,
            iconURL: bot.user.avatarURL()
          },
          color: bot.roles.color.color,
          fields: [],
          image: { url: fixed_width_image }
        };

        if (!status) embed.description = `${emojis.get("major_outage")} *${bot.user.username} is offline as of <t:${Math.round(Date.now() / 1000)}:R>, or something went wrong when fetching its status.*`;
        else {
          if (!status.guilds) embed.description = `${emojis.get("minor_outage")} *${bot.user.username} is currently booting up as of <t:${Math.round(Date.now() / 1000)}:R>, and is online in some servers.*`;
          else {
            if (Object.values(status.shards).find(s => s.loading || s.status !== 0 || (s.ping || 0) > 200)) embed.description = `${emojis.get("degraded_performance")} *${bot.user.username} is online as of <t:${Math.round((status.lastUpdate || Date.now()) / 1000)}:R>, but might be unresponsive or slow for some servers.*`;
            else embed.description = `${emojis.get("operational")} *${bot.user.username} is online as of <t:${Math.round((status.lastUpdate || Date.now()) / 1000)}:R>.*`;

            // statuses
            const uniqueStatuses = Object.values(status.shards).map(s => s.status).filter((a, i, self) => self.indexOf(a) === i).sort((a, b) => a - b);
            embed.fields.push({
              name: "Shard Statuses",
              value: uniqueStatuses.map(i => `**${[
                "Ready", "Connecting", "Reconnecting", "Idle", "Nearly", "Disconnected", "Waiting for guilds", "Identifying", "Resuming"
              ][i]}:** ${Object.keys(status.shards).filter(s => status.shards[s].status == i).join(", ")}`).join("\n"),
              inline: true
            });

            // pings
            const pings = Object.values(status.shards).map(s => s.ping || 0).sort((a, b) => b - a);
            if (pings[0]) embed.fields.push({
              name: "Ping & Uptime",
              value: [
                `**Average:** \`${Math.round(pings.reduce((a, b) => a + b) / pings.length)}ms\``,
                `**95th Percentile:** \`${pings[Math.floor(pings.length * 0.05)]}ms\``,
                `**99th Percentile:** \`${pings[Math.floor(pings.length * 0.01)]}ms\``
              ].join("\n"),
              inline: true
            });
          }
        }
        return embed;
      });
  
  interaction.reply({ embeds });
};