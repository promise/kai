const { Client, GuildMember } = require("discord.js"), config = require("../../config");

// spacers
const name = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", color = 0x18191C;

// processing list to avoid duplicates
const processing = new Set();

module.exports = async (client = new Client) => {
  client.on("roleUpdate", (_, role) => {
    if (role.name == "Spacer") role.edit({ name, color });
  });

  client.on("guildMemberUpdate", async (_, member) => {
    if (!processing.has(member.id)) {
      processing.add(member.id);
      await updateDefaultRoles(member);
      await updateMemberCommonRoles(member);
      await updateMemberSpacers(member);
      processing.delete(member.id);
    }
  });

  console.log("Fetching guild members to adjust roles.");
  client.guilds.cache.get(config.guild).members.fetch().then(async members => {
    console.log("Guild members fetched, processing roles.");
    for (let member of members.array()) {
      if (!processing.has(member.id)) {
        processing.add(member.id);
        await updateDefaultRoles(member);
        await updateMemberCommonRoles(member);
        await updateMemberSpacers(member);
        processing.delete(member.id);
      }
    }
    console.log("Roles processed, job complete.");
  });
};

async function updateDefaultRoles(member = new GuildMember) {
  if (member.guild.id !== config.guild) return;
  
  if (config.userRole) {
    if (!member.roles.cache.has(config.userRole) && !member.user.bot) await member.roles.add(config.userRole, "Missing user role");
    if (member.roles.cache.has(config.userRole) && member.user.bot) await member.roles.remove(config.userRole, "Bot had user role");
  }

  if (config.botRole) {
    if (!member.roles.cache.has(config.botRole) && member.user.bot) await member.roles.add(config.botRole, "Missing bot role");
    if (member.roles.cache.has(config.botRole) && !member.user.bot) await member.roles.remove(config.botRole, "User had bot role");
  }

  return;
}

async function updateMemberCommonRoles(member = new GuildMember) {
  for (const common in config.commonRoles) {
    if (member.roles.cache.find(r => config.commonRoles[common].includes(r.id)) && !member.roles.cache.has(common)) await member.roles.add(common, "Added common role");
    if (!member.roles.cache.find(r => config.commonRoles[common].includes(r.id)) && member.roles.cache.has(common)) await member.roles.remove(common, "Removed common role");
  }
  return;
}

async function updateMemberSpacers(member = new GuildMember) {
  let
    memberRoles = member.roles.cache.filter(r => r.name !== name && r.id !== member.guild.roles.everyone.id).sort((a, b) => b.position - a.position),
    allRoles = member.guild.roles.cache.filter(r => r.id !== member.guild.roles.everyone.id).sort((a, b) => a.position - b.position),
    spacers = [], appropriateSpacer = null, roleBetween = false;
  for (const role of allRoles.array()) {
    if (memberRoles.find(r => r.id === role.id)) {
      if (appropriateSpacer) {
        spacers.push(appropriateSpacer);
        appropriateSpacer = null;
      }
      roleBetween = true;
    } else if (role.name == name) {
      if (roleBetween) appropriateSpacer = role;
      roleBetween = false;
    }
  }

  const newRoles = [ ...memberRoles.map(r => r.id), ...spacers.map(s => s.id) ];

  if (
    JSON.stringify(newRoles.sort()) !==
    JSON.stringify(member.roles.cache.filter(r => r.id !== member.guild.roles.everyone.id).map(r => r.id).sort())
  ) await member.roles.set(newRoles, "Spacer update");
  return;
}

