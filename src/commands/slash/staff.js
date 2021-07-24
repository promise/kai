module.exports = {
  description: "Get a list of the current staff members on the server",
  options: [
    {
      type: "STRING",
      name: "sort",
      description: "Sort the members in different ways (Default is Member status)",
      choices: [
        { name: "Member status", value: "status" },
        { name: "Staff ranking", value: "ladder" }
      ]
    },
    {
      type: "STRING",
      name: "show",
      description: "Filter who to show (Default is Available)",
      choices: [
        { name: "Available", value: "available" },
        { name: "All", value: "all" }
      ]
    }
  ]
};

const { Interaction } = require("discord.js"), config = require("../../../config"), { getPermissionLevel } = require("../../constants/permissions"), selfhelp = require("../../constants/selfhelp");

const statuses = {
  online: {
    color: 0x3BA55C,
    name: "Online"
  },
  idle: {
    color: 0xFAA61A,
    name: "Idle"
  },
  dnd: {
    color: 0xF04747,
    name: "Do Not Disturb"
  },
  offline: {
    color: 0x747F8D,
    name: "Offline"
  }
};

const roles = [ "457839018198171648", config.permissions.admin, config.permissions.staff ];

module.exports.execute = (interaction = new Interaction, { sort = "status", show = "available" }) => interaction.guild.members.fetch().then(async members => {
  let staff = members.filter(m => getPermissionLevel(m));
  if (show == "available") staff = staff.filter(m => m.presence && m.presence.status == "online");

  if (!staff.size) {
    const help = selfhelp.find(h => h.channels.includes(interaction.channelId));
    return interaction.reply({
      embeds: [{
        title: "No staff members are currently available",
        description: [
          `If you need assistance on ${help ? help.service : "one of our bots, project or other services"} then please check out our documentation while you wait for a staff member to come online.`,
          help ? Object.keys(help.links).map(l => `• **${l}:** ${help.links[l]}`).join("\n") : null,
          "Please know our staff members are helping you for free and we can't promise that one of us will be online 24/7 to help you. We are all humans, we all have human lives away from our computer screen and we hope you can understand and respect this. Thank you."
        ].filter(s => s).join("\n\n"),
        color: statuses.offline.color
      }]
    });
  }

  let embeds = [];
  if (sort == "status") embeds = staff.map(s => s.presence ? s.presence.status : "offline").filter((status, i, arr) => arr.indexOf(status) == i).sort((a, b) => Object.keys(statuses).indexOf(a) - Object.keys(statuses).indexOf(b)).map(status => ({
    title: statuses[status].name,
    description: staff.filter(m => (m.presence ? m.presence.status : "offline") == status).map(m => `${m} ${m.user.tag} (${m.user.id})`).join("\n"),
    color: statuses[status].color
  })); else if (sort == "ladder") embeds = staff.map(s => s.roles.cache.sort((a, b) => b.position - a.position).find(r => roles.includes(r.id))).filter(r => r).map(r => r.id).filter((role, i, arr) => arr.indexOf(role) == i).sort((a, b) => roles.indexOf(a) - roles.indexOf(b)).map(id => interaction.guild.roles.cache.get(id)).map(role => ({
    title: role.name,
    description: staff.filter(m => m.roles.cache.sort((a, b) => b.position - a.position).find(r => roles.includes(r.id)).id == role.id).map(m => `${m} ${m.user.tag} (${m.user.id})`).join("\n"),
    color: role.color
  }));

  return interaction.reply({ embeds });
});