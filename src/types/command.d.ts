import { ApplicationCommandOptionChoice, ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction, CommandInteractionOption, ContextMenuInteraction, Message } from "discord.js";

type Command = {
  // expandable
};

export type SlashArgRecord = {
  [key: string]: CommandInteractionOption["value"]
};

export type Autocomplete = (query: string | number, interaction: AutocompleteInteraction) => Promise<Array<ApplicationCommandOptionChoice>>;

export type SlashCommand = Command & {
  description: string;
  options?: Array<ApplicationCommandOptionData>;
  autocompletes?: {
    [optionName: string]: Autocomplete;
  };
  execute(interaction: CommandInteraction, args: SlashArgRecord, emojis: Record<string, string>): void;
};

export type ContextMenuCommand = Command & {
  execute(interaction: ContextMenuInteraction, target: string, emojis: Record<string, string>): void;
}

export type MentionCommand = Command & {
  execute(message: Message, args: Array<string>, emojis: Record<string, string>): void;
  aliases?: Array<string>;
  minArguments?: number;
};
