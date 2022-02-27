import { GuildMember, User } from "discord.js";
import { PermissionLevel } from "../types/permissions";
import config from "../config";

export const ladder: Record<PermissionLevel, number> = {
  OWNER: 4,
  ADMIN: 3,
  STAFF: 2,
  HELP: 1,
  ALL: 0,
};

export function getPermissionLevel(user: GuildMember | User): number {
  if (config.ownerId === user.id) return ladder.OWNER;
  const member = user instanceof GuildMember ? user : user.client.guilds.resolve(config.guildId)?.members.resolve(user.id);
  if (member) {
    if (member.roles.resolve(config.roles.admin)) return ladder.ADMIN;
    if (member.roles.resolve(config.roles.staff)) return ladder.STAFF;
    if (member.roles.resolve(config.roles.help)) return ladder.HELP;
  }
  return ladder.ALL;
}
