import { Config } from "./types/config";
import { config } from "dotenv";
config();

export default {
  client: {
    token: process.env.BOT_TOKEN,
    caches: {
      GuildBanManager: 0,
      GuildEmojiManager: 50,
      GuildInviteManager: 0,
      GuildMemberManager: 100_000,
      GuildStickerManager: 0,
      MessageManager: 50,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: 1, // bot only
      VoiceStateManager: 0,
    },
  },

  databaseUri: process.env.DATABASE_URI,
  ownerId: process.env.OWNER_ID || "110090225929191424",
  guildId: process.env.GUILD_ID || "449576301997588490",
  aboutChannelId: process.env.ABOUT_CHANNEL_ID || "823928810477977661",

  roles: {
    admin: "449577708100517888",
    staff: "449577579611947009",
    help: "759329966042906634",
    user: "619982804435861554",
    bot: "647484663736303626",
  },

  apiPort: parseInt(process.env.API_PORT || ""),
  apiRatelimitIpWhitelist: ["127.0.0.1", ...process.env.API_RATELIMIT_IP_WHITELIST?.split(",") || []],

  colors: {
    success: 0x1AA6B7,
    error: 0xFF414D,
    warning: 0xF56A79,
    info: 0xD9ECF2,
  },

  monitor: {
    interval: 5000,
    logInterval: 300000,
    list: {
      "467377486141980682": {
        name: "Countr",
        endpoint: "http://localhost:11131",
        categoryId: "467068684905742337",
      },
      "625031581094117381": {
        name: "Countr Premium",
        endpoint: "http://localhost:11132",
        categoryId: "598229124024369152",
      },
      "747110939001880656": {
        name: "The Impostor",
        endpoint: "http://localhost:11151",
        categoryId: "757331504102637669",
      },
    },
  },

  quickResponsePrefix: ".",

  commonRoles: {
    "662049690438598666": [
      "496237757216325633",
      "510555278580645892",
      "510935895885611010",
      "638989701730140161",
      "545584317481353228",
      "510936252019638282",
      "513820998362202122",
    ],
    "947538891307618344": [
      "940335643660263444",
      "940335570427727912",
      "940335478379544596",
      "940339456379072524",
    ],
  },

  tickets: {
    categories: {
      inbox: "723862970014236722",
      replied: "781387129510952960",
    },
    moveTimeout: 60000,
  },

  autoQuoteTokens: process.env.AUTOQUOTE_TOKENS?.split(",") || [],
} as Config;
