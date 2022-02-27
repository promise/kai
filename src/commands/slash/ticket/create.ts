import { GuildMember } from "discord.js";
import { SlashCommand } from "../../../types/command";
import { create } from "../../../modules/tickets";

export default {
  description: "Set or create a quick response",
  options: [
    {
      type: "USER",
      name: "member",
      description: "The member you want to create the ticket for",
      required: true,
    },
    {
      type: "STRING",
      name: "description",
      description: "The issue description, if you'd like to add this",
    },
  ],
  execute: async (interaction, { member: memberId, description }: { member: string; description: string; }, { success }) => {
    const member = await interaction.guild?.members.fetch(memberId);
    if (member) {
      const channel = await create(member, interaction.member as GuildMember, description);
      interaction.reply({ content: `${success} Ticket ${channel.toString()} has been created!` });
    }
  },
} as SlashCommand;
