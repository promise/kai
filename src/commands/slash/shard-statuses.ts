import { MessageEmbedOptions, TextChannel } from "discord.js";
import { SlashCommand } from "../../types/command";
import config from "../../config";
import { fixedWidthImage } from "../../constants/embeds";
import { statuses } from "../../database";

export default {
  description: "Get all bots' shard statuses",
  execute: async (interaction, _, { minorOutage, majorOutage, degradedPerformance, operational }) => {
    const
      channel = await interaction.client.channels.fetch(interaction.channelId) as TextChannel,
      bots = [
        Object.keys(config.monitor.list).filter(botInfo => config.monitor.list[botInfo].categoryId === channel?.parent?.id),
        Object.keys(config.monitor.list),
      ].find(list => list.length) as Array<string>, // finds first list that has actual bot ids in it
      embeds = await Promise.all((await Promise.all(bots.map(id => interaction.guild?.members.fetch(id)))) // they're probably already cached so no need to optimize this eg. by fetching them all at once
        .filter(bot => bot)
        .map(async bot => {
          if (!bot) return {};
          const status = await statuses.get(bot.id);
          const embed: MessageEmbedOptions = {
            author: {
              name: bot.user.tag,
              iconURL: bot.user.avatarURL() || undefined,
            },
            color: bot.roles.color?.color,
            fields: [],
            image: { url: fixedWidthImage },
          };

          if (!status) embed.description = `${majorOutage} *${bot.user.username} is offline as of <t:${Math.round(Date.now() / 1000)}:R>, or something went wrong when fetching its status.*`;
          else if (!status.guilds) embed.description = `${minorOutage} *${bot.user.username} is currently booting up as of <t:${Math.round(Date.now() / 1000)}:R>, and is online in some servers.*`;
          else {
            if (Object.values(status.shards).find(s => s.loading || s.status !== 0 || (s.ping || 0) > 200)) embed.description = `${degradedPerformance} *${bot.user.username} is online as of <t:${Math.round((status.lastUpdate || Date.now()) / 1000)}:R>, but might be unresponsive or slow for some servers.*`;
            else embed.description = `${operational} *${bot.user.username} is online as of <t:${Math.round((status.lastUpdate || Date.now()) / 1000)}:R>.*`;

            // statuses
            const uniqueStatuses = Object.values(status.shards).map(s => s.status).filter((a, i, self) => self.indexOf(a) === i).sort((a, b) => a - b);
            embed.fields?.push({
              name: "Shard Statuses",
              value: uniqueStatuses.map(i => `**${["Ready", "Connecting", "Reconnecting", "Idle", "Nearly", "Disconnected", "Waiting for guilds", "Identifying", "Resuming"][i]}:** ${Object.keys(status.shards).filter(s => status.shards[s].status === i).join(", ")}`).join("\n"),
              inline: true,
            });

            // pings
            const pings = Object.values(status.shards).map(s => s.ping || 0).sort((a, b) => b - a);
            if (pings[0]) {
              embed.fields?.push({
                name: "Ping & Uptime",
                value: [
                  `**Average:** \`${Math.round(pings.reduce((a, b) => a + b) / pings.length)}ms\``,
                  `**95th Percentile:** \`${pings[Math.floor(pings.length * 0.05)]}ms\``,
                  `**99th Percentile:** \`${pings[Math.floor(pings.length * 0.01)]}ms\``,
                ].join("\n"),
                inline: true,
              });
            }
          }
          return embed;
        }));

    interaction.reply({ embeds });
  },
} as SlashCommand;

/*
 * // new shard status for countr v13
 * import { GuildMember, MessageEmbedOptions } from "discord.js";
 * import { SlashCommand } from "../../@types/command";
 * import { bytesToHumanReadableFormat } from "../../utils/human";
 * import config from "../../config";
 * import { fixedWidthImage } from "../../constants/embeds";
 * import { msToTime } from "../../utils/time";
 * import { statuses } from "../../database";
 *
 * const discordStatus = ["Ready", "Connecting", "Reconnecting", "Idle", "Nearly", "Disconnected", "Waiting for guilds", "Identifying", "Resuming"];
 *
 * export default {
 *   description: "Get all bots' shard statuses",
 *   execute: async (interaction, _, { minorOutage, majorOutage, degradedPerformance, operational }) => {
 *     const bots = Object.keys(config.monitor.list).filter(id => interaction.channel?.type !== "DM" && config.monitor.list[id].categoryId === interaction.channel?.parentId) || Object.keys(config.monitor.list);
 *     interaction.reply({
 *       embeds: await Promise.all(bots.map(async id => {
 *         const bot = await interaction.guild?.members.fetch(id) as GuildMember;
 *         const embed: MessageEmbedOptions = {
 *           author: {
 *             name: bot.user.tag,
 *             iconURL: bot.user.displayAvatarURL(),
 *           },
 *           color: bot.roles.color?.color,
 *           fields: [],
 *           image: { url: fixedWidthImage },
 *         };
 *
 *         const status = await statuses.get(id);
 *         if (!status) embed.description = `${majorOutage} *${bot.user.username} is offline as of <t:${Math.round(Date.now() / 1000)}:R>, or something went wrong when fetching its status.*`;
 *         else if (!status.clusters.length) embed.description = `${minorOutage} *${bot.user.username} is currently booting up as of <t:${Math.round(Date.now() / 1000)}:R>, and is online in some servers.*`;
 *         else {
 *           if (status.clusters.every(cluster => cluster.status === 0)) embed.description = `${operational} *${bot.user.username} is online as of <t:${Math.round((status.lastUpdate || Date.now()) / 1000)}:R>.*`;
 *           else embed.description = `${degradedPerformance} *${bot.user.username} is online as of <t:${Math.round((status.lastUpdate || Date.now()) / 1000)}:R>, but might be unresponsive or slow for some servers.*`;
 *
 *           if (status.clusters.every(cluster => cluster.shards.length !== 1)) {
 *             embed.fields?.push(...status.clusters.map(({ cluster, ping, status, guilds, users, memory, loading, uptime, update }) => ({
 *               name: `Cluster ${cluster.id} (${cluster.shards[0]}-${cluster.shards[cluster.shards.length - 1]})`,
 *               value: [
 *                 `${loading ? degradedPerformance : [operational, minorOutage, degradedPerformance, minorOutage, minorOutage, majorOutage, majorOutage, majorOutage, degradedPerformance][status]} **${discordStatus[status]}** ${loading ? "*(loading)*" : ""}`,
 *                 ...[
 *                   `**Ping:** \`${ping}ms\``,
 *                   `**Guilds:** \`${guilds}\``,
 *                   `**Users:** \`${users}\``,
 *                   `**Memory:** \`${bytesToHumanReadableFormat(memory)}\``,
 *                   `**Uptime:** \`${msToTime(uptime)}\``,
 *                   `**Last update:** <t:${Math.floor(update / 1000)}:R>`,
 *                 ].map(line => `> ${line}`),
 *               ].join("\n"),
 *               inline: true,
 *             })));
 *           }
 *
 *           const shards = status.clusters.map(cluster => cluster.shards).flat();
 *           const uniqueStatuses = Array.from(new Set(shards.map(shard => shard.status)));
 *           embed.fields?.push({
 *             name: "Shard Statuses",
 *             value: uniqueStatuses.map(i => `**${discordStatus[i]}:** ${Object.values(shards).filter(shard => shard.status === i).join(", ")}`).join("\n"),
 *           });
 *         }
 *
 *         return embed;
 *       })),
 *     });
 *   },
 * } as SlashCommand;
 */
