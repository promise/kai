const config = require("../../config"), fetch = require("node-fetch"), statuses = new Map(), { BotLog } = require("../database");

setInterval(async () => {
  for (const bot in config.botMonitors) {
    const newStatus = await fetch(config.botMonitors[bot].endpoint).then(res => res.json()).catch(() => null);
    statuses.set(bot, newStatus);
  }
}, config.monitorInterval);

setInterval(() => {
  for (const [bot, status] of statuses) (new BotLog({ bot, status })).save();
}, config.logInterval);

module.exports = statuses;