import { Guild } from "discord.js";
import { emojis } from "../../database";
import { readdir } from "fs";

export default async function emojiModule(guild: Guild) {
  const currentList = await emojis.get();
  readdir("./assets/emojis", async (err, files) => {
    if (err) throw err;
    for (const fileName of files
      .filter(name => name.includes("."))
      .filter(name => !currentList[name.split(".")[0]])
    ) {
      const [name] = fileName.split(".");
      const newEmoji = await guild.emojis.create(`./assets/emojis/${fileName}`, name);
      await emojis.set(name, newEmoji.toString());
    }
  });
}
