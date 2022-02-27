import { CacheWithLimitsOptions } from "discord.js";

export interface Config {
  client: {
    token: string;
    caches: CacheWithLimitsOptions;
  };

  databaseUri: string;
  ownerId: string;
  guildId: string;
  aboutChannelId: string;

  roles: {
    admin: string;
    staff: string;
    help: string;
    user: string;
    bot: string;
  };

  apiPort?: number;
  apiRatelimitIpWhitelist: Array<string>;

  colors: {
    success: number;
    error: number;
    warning: number;
    info: number;
  };

  monitor: {
    interval: number;
    logInterval: number;
    list: {
      [botId: string]: {
        name: string;
        endpoint: string;
        categoryId: string;
      };
    };
  };

  quickResponsePrefix: string;

  commonRoles: {
    [roleId: string]: Array<string>;
  };

  tickets: {
    categories: {
      inbox: string;
      replied: string;
    };
    moveTimeout: number;
  };

  autoQuoteTokens: Array<string>;
}
