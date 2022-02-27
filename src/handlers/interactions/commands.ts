import { ApplicationCommandSubCommand, ApplicationCommandSubGroup, CommandInteraction, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { SlashArgRecord, SlashCommand } from "../../types/command";
import { getPermissionLevel, ladder } from "../../constants/permissions";
import commandPermissions from "../../commands/slash/_permissions";
import { emojis } from "../../database";

// eslint-disable-next-line complexity
export default async function commandHandler(interaction: CommandInteraction): Promise<void> {
  if (!interaction.guild) return;
  const command = interaction.guild.commands.cache.find(c => c.name === interaction.commandName);

  if (command) {
    const member = interaction.member && interaction.member instanceof GuildMember ? interaction.member : await interaction.guild?.members.fetch(interaction.user.id);
    const permissionLevel = member ? getPermissionLevel(member) : 0;

    if (permissionLevel < ladder[commandPermissions[command.name] || "ALL"]) {
      return interaction.reply({
        content: "⛔ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const path = [command.name];

    const subCommandOrGroup = command.options.find(o => ["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(o.type) && o.name === interaction.options.data[0].name) as ApplicationCommandSubCommand | ApplicationCommandSubGroup;
    if (subCommandOrGroup) {
      path.push(subCommandOrGroup.name);
      if (subCommandOrGroup.type === "SUB_COMMAND_GROUP") {
        const subCommands = subCommandOrGroup.options as Array<ApplicationCommandSubCommand>;
        const subCommand = subCommands.find(o => o.name === interaction.options.data[0]?.options?.[0].name);
        if (subCommand) path.push(subCommand.name);
      }
    }

    const commandFile = (await import(`../../commands/slash/${path.join("/")}`)).default as SlashCommand;

    commandFile.execute(interaction, getSlashArgs(interaction.options.data), await emojis.get());
  }
}

function getSlashArgs(options: CommandInteractionOptionResolver["data"]): SlashArgRecord {
  if (!options[0]) return {};
  if (options[0].options) return getSlashArgs(options[0].options);

  const args: SlashArgRecord = {};
  for (const o of options) args[o.name] = o.value;
  return args;

}
