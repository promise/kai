const fs = require("fs"), { emojis } = require("../database");

module.exports = async client => {
  let guild = client.guilds.resolve(await emojis.get("guild"));

  if (!guild) {
    console.log("Could not find emoji server, creating a new server for emojis");
    guild = await client.guilds.create("EMOJI SERVER");
    await emojis.unsetAll();
    await emojis.set("guild", guild.id);
  } else guild = await guild.fetch();

  fs.readdir("./assets/emojis", async (err, files) => {
    if (err) return console.log(err);
    for (const fileName of files
      .filter(f => f.includes("."))
      .filter(f => !emojis.get(f.split(".")[0]))
    ) {
      const name = fileName.split(".")[0], newEmoji = await guild.emojis.create(`./assets/emojis/${fileName}`, name);
      emojis.set(name, `<${fileName.endsWith(".gif") ? "a" : ""}:${newEmoji.name}:${newEmoji.id}>`);
      console.log(`Created emoji ${fileName}`);
    }
  });
};