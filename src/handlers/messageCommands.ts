import { getPermissionLevel, ladder } from "../constants/permissions";
import { MentionCommand } from "../types/command";
import { Message } from "discord.js";
import { emojis } from "../database";
import { join } from "path";
import { kaiLogger } from "../utils/logger/kai";
import permissions from "../commands/mention/_permissions";
import { readdir } from "fs";

export default async function handleMessageCommands(message: Message) {
  const args = message.content.split(" ").slice(1);
  const commandOrAlias = (args.shift() || "").toLowerCase();
  const commandName = aliases.get(commandOrAlias) || commandOrAlias;

  const command = commands.get(commandName);

  const emojiList = await emojis.get();
  if (!command) return void message.react(emojiList.commandNotFound).catch();

  message.guild?.members.fetch(message.author).then(member => {
    const permissionLevel = getPermissionLevel(member);
    if (permissionLevel < ladder[permissions[commandName] || "ALL"]) return void message.react(emojiList.commandDenied).catch();

    if (args.length < (command.minArguments || 0)) return void message.react(emojiList.commandInvalidArguments).catch();

    return void command.execute(message, args, emojiList);
  });
}

// loading commands
const commands = new Map<string, MentionCommand>(), aliases = new Map<string, string>();
readdir(join(__dirname, "../commands/mention"), (err, files) => {
  for (const file of files) if (file.endsWith(".js") && !file.startsWith("_")) loadCommand(file.replace(".js", ""));
  if (err || !files) return kaiLogger.error(err);
});

const loadCommand = async (command: string): Promise<void> => {
  const commandFile: MentionCommand = (await import(`../commands/mention/${command}`)).default;

  commands.set(command, commandFile);
  if (commandFile.aliases) for (const alias of commandFile.aliases) aliases.set(alias, command);
};

export const reloadCommand = (command: string): void => {
  delete require.cache[require.resolve(`../commands/mention/${command}`)];
  loadCommand(command);
};
