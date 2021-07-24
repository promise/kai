const
  Discord = require("discord.js"),
  fs = require("fs"),
  config = require("../config"),
  emojiServerHandler = require("./handlers/emojiServer"),
  slashCommandsHandler = require("./handlers/slashCommands"),
  normalCommandsHandler = require("./handlers/commands"),
  client = new Discord.Client({
    messageCacheLifetime: 60,
    messageSweepInterval: 60,
    allowedMentions: { repliedUser: false },
    partials: [ "USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION" ],
    presence: {
      status: "online",
      activities: [{
        name: "🦋",
        type: "WATCHING"
      }]
    },
    intents: [ "GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES" ]
  });

client.on("ready", async () => {
  console.log(`Ready as ${client.user.tag}!`);

  if (config.client.id !== client.user.id) console.log("WARNING: Your client ID in the config does not match the bot's actual ID. If you want to use OAuth2 then you will need to change your client ID in the config.js file.");

  await emojiServerHandler(client);
  slashCommandsHandler(client);

  // load and run modules
  fs.readdir("./src/modules", (err, files) => err ? console.log(err) : files.filter(file => file.endsWith(".js")).forEach(file => require(`./modules/${file}`)(client)));
});

client.on("messageCreate", message => {
  if (
    message.author.bot ||
    message.type !== "DEFAULT"
  ) return;

  if (message.content.match(`^<@!?${client.user.id}> `)) return normalCommandsHandler(message);
  else if (message.content.match(`^<@!?${client.user.id}>`)) return message.reply({
    content: `I am an open-sourced & private Discord bot by <@${config.owner}>. Also, butterflies are cute.`,
    components: [{
      type: "ACTION_ROW",
      components: [{
        type: "BUTTON",
        label: "Source Code",
        style: "LINK",
        url: require("../package.json").homepage
      }]
    }]
  });
});

client.login(config.client.token);