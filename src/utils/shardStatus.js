const config = require("../../config"), fetch = require("node-fetch"), statuses = new Map(), { botMonitor } = require("../database");

setInterval(async () => {
  for (const bot in config.botMonitors) {
    const status = statuses.get(bot) || { lastUpdate: 1 }, newStatus = await fetch(config.botMonitors[bot].endpoint).then(res => res.json()).catch(() => null);
    if (!(status?.lastUpdate == newStatus?.lastUpdate)) {
      statuses.set(bot, newStatus);
      botMonitor.push(bot, newStatus || {});
    }
  }
}, config.monitorInterval);

module.exports = statuses;