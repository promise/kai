import { ContextMenuCommand } from "../../types/command";
import { GuildMember } from "discord.js";
import { create } from "../../modules/tickets";

export default {
  execute: async (interaction, memberId, { success }) => {
    const member = await interaction.guild?.members.fetch(memberId);
    if (member) {
      const channel = await create(member, interaction.member as GuildMember, "Ticket via user dropdown");
      interaction.reply({ content: `${success} Ticket ${channel.toString()} has been created!` });
    }
  },
} as ContextMenuCommand;
