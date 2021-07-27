const fs = require("fs"), { join } = require("path"), { emojis } = require("../database"), config = require("../../config"), permissions = require("../commands/slash/_permissions.json"), { permissionLadder, getPermissionLevel } = require("../constants/permissions");

const componentCallbacks = new Map();

module.exports = async client => {
  const commands = await nestCommands("../commands/slash");
  client.guilds.fetch(config.guild).then(guild => guild.commands.set(commands.map(c => { c.defaultPermission = permissions[c.name] ? false : true; return c; })).then(slashCommands => guild.commands.permissions.set({ fullPermissions: slashCommands.map(({ name, id }) => ({ id, permissions: getPermissions(permissions[name]) })) })));

  client.on("interactionCreate", async interaction => {
    if (interaction.isMessageComponent()) {
      if (
        !interaction.customId.includes("public") &&
        interaction.message.interaction &&
        interaction.message.interaction.user.id !== interaction.user.id
      ) interaction.reply({
        content: `${emojis.get("error")} Only ${interaction.message.interaction.user} can interact with this message.`, ephemeral: true
      }); else {
        const callback = componentCallbacks.get(interaction.customId);
        if (callback) callback(interaction);
      }
    }

    if (!interaction.isCommand()) return;

    const
      command = commands.find(c => c.name == interaction.commandName),
      permissionLevel = getPermissionLevel(interaction.member);
    
    if (permissionLevel < permissionLadder[permissions[command.name] || "ALL"]) return interaction.reply({ content: `${emojis.get("command_denied")} You don't have permission to do this.`, ephemeral: true });

    const
      args = getSlashArgs(interaction.options.data),
      path = [
        command.name,
        ...(
          command.description == "Sub-command." ? [
            command.options.find(o => o.name == Object.keys(args)[0]).name,
            ...(
              command.options.find(o => o.name == Object.keys(args)[0]).description == "Sub-command." ? [
                command.options.find(o => o.name == Object.keys(args)[0]).options.find(o => o.name == Object.keys(Object.values(args)[0])[0]).name
              ] : []
            )
          ] : []
        )
      ],
      commandFile = require(`../commands/slash/${path.join("/")}.js`);
    
    commandFile.execute(interaction, getActualSlashArgs(interaction.options.data), { client, componentCallbacks, permissionLevel });
  });
};

function getSlashArgs(options) { // to get the path as well as the args
  const args = {};
  for (const o of options) args[o.name] = o.options ? getSlashArgs(o.options) : o.value;
  return args;
}

function getActualSlashArgs(options) { // sends through to the command files
  if (!options[0]) return {};
  if (options[0].options) return getActualSlashArgs(options[0].options);
  else return getSlashArgs(options);
}

function nestCommands(relativePath, layer = 0) {
  return new Promise(resolve => fs.readdir(join(__dirname, relativePath), async (err, files) => {
    if (err) return console.log(err);
    const arr = [];
    for (const file of files) {
      if (file.endsWith(".js")) {
        const { description = "No description", options = [] } = require(`${relativePath}/${file}`);
        arr.push({ name: file.split(".")[0], description, options, type: 1 });
      } else if (!file.includes(".")) {
        const options = await nestCommands(`${relativePath}/${file}`, layer + 1);
        arr.push({ name: file, description: "Sub-command.", options, type: 2 });
      }
    }
    if (layer == 0) arr.forEach(c => { delete c.type; });
    resolve(arr);
  }));
}

function getPermissions(permission = "ALL") {
  const ranking = permissionLadder[permission] || 3, permissions = [];
  if (ranking != 0) {
    if (ranking <= 3) permissions.push({
      type: "USER",
      id: config.owner,
      permission: true
    });
    if (ranking <= 2) permissions.push({
      type: "ROLE",
      id: config.permissions.admin,
      permission: true
    });
    if (ranking <= 1) permissions.push({
      type: "ROLE",
      id: config.permissions.staff,
      permission: true
    });
  }
  return permissions;
}

module.exports.componentCallbacks = componentCallbacks;