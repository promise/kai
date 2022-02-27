import { Format, makeBadge } from "badge-maker";
import BotLog from "../database/models/botLog";
import { Module } from "../types/module";
import { app } from "../utils/express";
import config from "../config";
import { statuses } from "../database";

export default (() => {
  app.get("/badge/:id/status.svg", async (req, res) => {
    if (!config.monitor.list[req.params.id]) return res.sendStatus(501);

    const format: Format = {
      label: "status",
      labelColor: "grey",
      style: "flat-square",
      message: "online",
      color: "brightgreen",
    };

    const status = await statuses.get(req.params.id);

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
    }

    res.header("Cache-Control", "no-store").type("svg").send(makeBadge(format));
  });

  app.get("/badge/:id/uptime.svg", async (req, res) => {
    if (!config.monitor.list[req.params.id]) return res.sendStatus(501);

    const logs = (await BotLog.find({ bot: req.params.id, timestamp: { $gte: Date.now() - 86400000 }})).map(({ status: { shards = { 0: { status: 1 }}}}) => Object.values(shards).map(shard => !shard.status).map(status => (status ? 1 : 0) as number).reduce((a, b) => a + b, 0) / Object.values(shards).length);
    const uptime = logs.reduce((a, b) => a + b, 0) / logs.length * 100;
    const uptimeFixed = uptime.toFixed(2);

    const format: Format = {
      label: "uptime 7d",
      labelColor: "grey",
      style: "flat-square",
      message: `${uptimeFixed}%`,
      color: "brightgreen",
    };

    if (uptimeFixed !== (100).toFixed(2)) format.color = "green";
    if (uptime < 95.0) format.color = "yellow";
    if (uptime < 90.0) format.color = "orange";
    if (uptime < 75.0) format.color = "red";

    res.header("Cache-Control", "no-store").type("svg").send(makeBadge(format));
  });
}) as Module;
