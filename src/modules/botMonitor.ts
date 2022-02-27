import BotLog from "../database/models/botLog";
import { Module } from "../types/module";
import config from "../config";
import { inspect } from "util";
import { kaiLogger } from "../utils/logger/kai";
import { statuses } from "../database";
import superagent from "superagent";

export default (() => {
  setInterval(async () => {
    for (const bot in config.monitor.list) {
      try {
        const res = await superagent.get(config.monitor.list[bot].endpoint);
        const json = JSON.parse(res.body);
        statuses.set(bot, json);
      } catch (e) {
        kaiLogger.warn(`Could not log status of ${bot}: ${inspect(e)}`);
        statuses.set(bot, {
          shards: {},
          guilds: 0,
          cachedUsers: 0,
          users: 0,
          lastUpdate: Date.now(),
        });
      }
    }
  }, config.monitor.interval);

  setInterval(async () => {
    for (const [bot, status] of Object.entries(await statuses.get())) {
      const log = new BotLog({ bot, status });
      await log.save();
    }
  }, config.monitor.logInterval);
}) as Module;
