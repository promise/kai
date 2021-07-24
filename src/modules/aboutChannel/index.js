const { Client } = require("discord.js"), contents = require("./content.js"), { reactionroles } = require("../../database"), config = require("../../../config.js");

module.exports = async (client = new Client) => {
  client.on("messageCreate", async message => {
    if (
      message.channel &&
      message.channel.id == config.aboutChannel &&
      message.content == "refresh"
    ) {
      try {
        await message.channel.overwritePermissions([
          {
            id: message.guild.roles.everyone.id,
            deny: [ "VIEW_CHANNEL" ]
          }
        ]);
      } catch(e) {/* something went wrong */}
      try {
        await message.channel.bulkDelete(50);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch(e) {/* something went wrong */}
      const messages = await message.channel.messages.fetch(), navigation = {};
      await Promise.all(messages.map(m => m.delete()));

      let first = true;

      for (const content of contents) {
        if (typeof content == "string") await message.channel.send({
          content: first ? undefined : "** **",
          files: [
            {
              attachment: require("path").join(__dirname, "../../../assets/about-banners", content),
              name: "banner.png"
            }
          ]
        }); else {
          const m = await message.channel.send({ embeds: [ Object.assign({ color: 0x00BF9C }, content.embed) ] });
          if (content.reactionroles) {
            reactionroles.set(m.id, content.reactionroles);
            for (const emoji in content.reactionroles) await m.react(emoji);
          }
          if (content.navigation) navigation[content.navigation] = m.url;
        }
        first = false;
      }
      await message.channel.send({
        content: "** **",
        files: [
          {
            attachment: require("path").join(__dirname, "../../../assets/about-banners/navigation.png"),
            name: "banner.png"
          }
        ]
      });
      await message.channel.send({
        embeds: [{
          description: Object.keys(navigation).map(name => `• [${name}](<${navigation[name]}>)`).join("\n\n"),
          color: 0x00BF9C
        }]
      });
      try {
        await message.channel.overwritePermissions([
          {
            id: message.guild.roles.everyone,
            deny: [ "ADD_REACTIONS", "SEND_MESSAGES", "MANAGE_MESSAGES" ]
          }
        ]);
      } catch(e) {/* something went wrong */}
    }
  });
  client.on("messageReactionAdd", async (reaction, user) => {
    const reactionrole = reactionroles.get(reaction.message.id);
    if (
      reactionrole &&
      !user.bot
    ) {
      const
        member = reaction.message.guild.members.resolve(user),
        role = reactionrole[reaction.emoji.name];
      if (member) {
        if (member.roles.cache.has(role)) member.roles.remove(role);
        else member.roles.add(role);
      }
      reaction.users.remove(user);
    }
  });
};