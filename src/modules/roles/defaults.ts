import { GuildMember } from "discord.js";
import config from "../../config";

export default function updateDefaults(member: GuildMember, newRoles: Set<string>): void {
  if (member.guild.id !== config.guildId) return;

  if (member.user.bot) {
    newRoles.add(config.roles.bot);
    newRoles.delete(config.roles.user);
  } else {
    newRoles.delete(config.roles.bot);
    newRoles.add(config.roles.user);
  }
}
