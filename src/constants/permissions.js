const config = require("../../config");

module.exports.permissionLadder = {
  "ALL": 0,
  "HELPER": 1,
  "STAFF": 2,
  "ADMIN": 3,
  "OWNER": 4,
  "NONE": 5
};

module.exports.getPermissionLevel = (member = new (require("discord.js").GuildMember)) => {
  if (config.owner == member.id) return 4;
  if (!member.roles) return 0;
  if (member.roles.cache.has(config.permissions.admin)) return 3;
  if (member.roles.cache.has(config.permissions.staff)) return 2;
  if (member.roles.cache.has(config.permissions.helper)) return 1;
  return 0;
};