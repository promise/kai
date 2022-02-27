import { GuildMember, Role } from "discord.js";

export const name = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬   ​", color = 0x18191C;

export default function updateSpacers(member: GuildMember, newRoles: Set<string>): void {
  newRoles.forEach(r => {
    if (member.guild.roles.resolve(r)?.name === name) newRoles.delete(r); // remove spacers so we can calculate new ones
  });

  const memberRoles = Array.from(newRoles)
    .map(r => member.guild.roles.resolve(r))
    .filter(r => r && r.id !== member.guild.roles.everyone.id);

  const allRoles = member.guild.roles.cache.filter(r => r.id !== member.guild.roles.everyone.id).sort((a, b) => a.position - b.position);

  let appropriateSpacer: Role | null = null, roleBetween = false;
  for (const role of Array.from(allRoles.values())) {
    if (memberRoles.find(r => r?.id === role.id)) {
      if (appropriateSpacer) {
        newRoles.add(appropriateSpacer.id);
        appropriateSpacer = null;
      }
      roleBetween = true;
    } else if (role.name === name) {
      if (roleBetween) appropriateSpacer = role;
      roleBetween = false;
    }
  }
}
