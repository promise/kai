const { Message } = require("discord.js"), fs = require("fs"), { emojis } = require("../database"), { permissionLadder, getPermissionLevel } = require("../constants/permissions");

module.exports = async (message = new Message) => {
  let
    content = message.content.split(" ").slice(1),
    commandOrAlias = content.shift().toLowerCase(),
    commandName = aliases.get(commandOrAlias) || commandOrAlias;
  content = content.join(" ");
  
  const static = statics.find(s => s.triggers.includes(commandName));
  if (!static && !commands.has(commandName)) return message.react(emojis.get("command_not_found"));

  if (static) return message.reply({ content: static.message, allowedMentions: { repliedUser: false }, failIfNotExists: false });

  const
    commandFile = commands.get(commandName),
    permissionLevel = getPermissionLevel(message.member || message.author);
  if (permissionLevel < permissionLadder[commandFile.permission || "ALL"]) return message.react(emojis.get("command_denied"));

  const args = (content.match(/"[^"]+"|[^ ]+/g) || []).map(arg => arg.startsWith("\"") && arg.endsWith("\"") ? arg.slice(1).slice(0, -1) : arg);
  if (!commandFile.checkArgs(args, permissionLevel)) return message.react(emojis.get("command_invalid_arguments"));

  return commandFile.execute(message, args, { content, permissionLevel });
};

// loading commands
const commands = new Map(), aliases = new Map(), statics = require("../commands/_static.json");
fs.readdir("./src/commands/", (err, files) => {
  if (err) return console.log(err);
  for (const file of files) if (file.endsWith(".js")) loadCommand(file.replace(".js", ""));
});

const loadCommand = fileName => {
  const commandFile = require(`../commands/${fileName}.js`);
  commands.set(fileName, commandFile);
  if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, fileName);
};

module.exports.reloadCommand = command => {
  delete require.cache[require.resolve(`../commands/${command}.js`)];
  loadCommand(command);
};

module.exports.reloadStaticCommands = () => {
  delete require.cache[require.resolve("../commands/_static.json")];
  const newStatics = require("../commands/_static.json");
  statics.length = 0; // remove everything from the variable
  statics.push(...newStatics); // add new data to same variable
};