const config = require("../../config"), statuses = require("../utils/shardStatus"), { BotLog } = require("../database"), app = require("../utils/express"), { makeBadge } = require("badge-maker");

module.exports = () => {
  app.get("/badge/:id/status.svg", (req, res) => {
    if (!config.botMonitors[req.params.id]) return res.status(404).send("Bot not found");

    const
      format = {
        label: "status",
        message: null,
        labelColor: "grey",
        color: null,
        style: "flat-square"
      },
      status = statuses.get(req.params.id);

    if (!status) {
      format.message = "offline";
      format.color = "red";
    } else if (!status.guilds) {
      format.message = "booting";
      format.color = "orange";
    } else if (Object.values(status.shards).find(s => s.loading || s.status !== 0)) {
      format.message = "loading";
      format.color = "yellow";
    } else if (Object.values(status.shards).find(s => (s.ping || 0) > 200)) {
      format.message = "reconnecting"; // not really but eh
      format.color = "green";
    } else {
      format.message = "online";
      format.color = "brightgreen";
    }

    res.header("Cache-Control", "no-store").type("svg").send(makeBadge(format));
  });

  app.get("/badge/:id/uptime.svg", async (req, res) => {
    if (!config.botMonitors[req.params.id]) return res.status(404).send("Bot not found");

    const
      logs = (await BotLog.find({ bot: req.params.id, timestamp: { $gte: Date.now() - 86400000 } })).map(({ status: { shards = { "0": { status: 1 } } } }) => Object.values(shards).map(shard => shard.status ? false : true).map(status => status ? 1 : 0).reduce((a, b) => a + b) / Object.values(shards).length),
      uptime = (logs.reduce((a, b) => a + b) / logs.length * 100).toFixed(1);

    let color = "brightgreen";
    if (uptime < 99.9) color = "green";
    if (uptime < 95.0) color = "yellow";
    if (uptime < 90.0) color = "orange";
    if (uptime < 75.0) color = "red";
    
    res.header("Cache-Control", "no-store").type("svg").send(makeBadge({
      label: "uptime 7d",
      message: uptime + "%",
      labelColor: "grey",
      color,
      style: "flat-square"
    }));
  });
};