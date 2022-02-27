import { ContextMenuCommand } from "../../types/command";
import { GuildMember } from "discord.js";
import { create } from "../../modules/tickets";

export default {
  execute: async (interaction, messageId, { success }) => {
    const message = await interaction.channel?.messages.fetch(messageId);
    const member = await interaction.guild?.members.fetch(message?.author.id || "");
    if (message && member) {
      const channel = await create(member, interaction.member as GuildMember, message.content);
      interaction.reply({ content: `${success} Ticket ${channel.toString()} has been created!` });
    }
  },
} as ContextMenuCommand;
