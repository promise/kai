import { ContextMenuInteraction, GuildMember } from "discord.js";
import { getPermissionLevel, ladder } from "../../constants/permissions";
import { ContextMenuCommand } from "../../types/command";
import { emojis } from "../../database";
import messagePermissions from "../../commands/message/_permissions";
import userPermissions from "../../commands/user/_permissions";

export default async function contextMenuHandler(interaction: ContextMenuInteraction): Promise<void> {
  if (!interaction.guild) return;
  const command = interaction.guild.commands.cache.find(c => c.name === interaction.commandName);

  if (command) {
    const member = interaction.member && interaction.member instanceof GuildMember ? interaction.member : await interaction.guild?.members.fetch(interaction.user.id);
    const permissionLevel = member ? getPermissionLevel(member) : 0;

    if (permissionLevel < ladder[(interaction.targetType === "USER" ? userPermissions : messagePermissions)[command.name] || "ALL"]) {
      return interaction.reply({
        content: "⛔ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const commandFile = (await import(`../../commands/${interaction.targetType === "USER" ? "user" : "message"}/${command.name}`)).default as ContextMenuCommand;

    commandFile.execute(interaction, interaction.targetId, await emojis.get());
  }
}
