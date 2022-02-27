import { GuildMember } from "discord.js";
import config from "../../config";

export default function updateCommons(member: GuildMember, newRoles: Set<string>): void {
  for (const [role, roles] of Object.entries(config.commonRoles)) {
    if (Array.from(newRoles).find(r => roles.includes(r))) newRoles.add(role);
    else newRoles.delete(role);
  }
}
