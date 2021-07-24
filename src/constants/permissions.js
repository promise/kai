const config = require("../../config");

module.exports.permissionLadder = {
  "ALL": 0,
  "STAFF": 1,
  "ADMIN": 2,
  "OWNER": 3,
  "NONE": 4
};

module.exports.getPermissionLevel = (member = new (require("discord.js").GuildMember)) => {
  if (config.owner == member.id) return 3;
  if (!member.roles) return 0;
  if (member.roles.cache.has(config.permissions.admin)) return 2;
  if (member.roles.cache.has(config.permissions.staff)) return 1;
  return 0;
};