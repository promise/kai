import { Status as DiscordStatus } from "discord.js";

export interface Status {
  shards: {
    [botId: string]: {
      status: DiscordStatus;
      guilds: number;
      cachedUsers: number;
      users: number;
      ping: number;
      loading: boolean;
    }
  };
  guilds: number;
  cachedUsers: number;
  users: number;
  lastUpdate: number;
}

/*
 * // new format for countr v13
 * export interface Status {
 *   clusters: Array<{
 *     cluster: {
 *       id: number;
 *       shards: Array<number>;
 *     };
 *     shards: Array<{
 *       id: number;
 *       ping: number;
 *       status: DiscordStatus;
 *     }>;
 *     ping: number;
 *     status: DiscordStatus;
 *     guilds: number;
 *     users: number;
 *     memory: number;
 *     loading: boolean;
 *     uptime: number;
 *     update: number;
 *   }>;
 *   totalShards: number;
 *   totalGuilds: number;
 *   totalUsers: number;
 *   totalMemory: number;
 *   lastUpdate: number;
 * }
 */
