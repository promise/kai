import updateSpacers, { color, name } from "./spacers";
import { GuildMember } from "discord.js";
import { Module } from "../../types/module";
import config from "../../config";
import { inspect } from "util";
import { kaiLogger } from "../../utils/logger/kai";
import updateCommons from "./commons";
import updateDefaults from "./defaults";

const processingUsers = new Set();

export default (async client => {
  client.on("guildMemberUpdate", (_, member) => updateRoles(member));
  client.on("guildMemberAdd", member => updateRoles(member));

  // spacer role name and color
  client.on("roleUpdate", (_, role) => {
    if (role.name === "Spacer") role.edit({ name, color });
  });

  // process all members on startup
  const members = await client.guilds.resolve(config.guildId)?.members.fetch();
  if (members) for (const member of Array.from(members.values())) await updateRoles(member);
}) as Module;

async function updateRoles(member: GuildMember) {
  if (processingUsers.has(member.id)) return;
  processingUsers.add(member.id);
  const newRoles = new Set(member.roles.cache.map(r => r.id));

  try {
    updateDefaults(member, newRoles);
    updateCommons(member, newRoles);
    updateSpacers(member, newRoles);
    if (
      JSON.stringify(Array.from(newRoles).sort()) !==
      JSON.stringify(member.roles.cache.map(r => r.id).sort())
    ) await member.roles.set(Array.from(newRoles));
    processingUsers.delete(member.id);
  } catch (e) {
    kaiLogger.warn(`Failed to update roles for ${member.id}: ${inspect(e)} ${inspect(newRoles)}`);
  }
}
