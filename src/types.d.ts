import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonInteraction,
  CacheType,
} from "discord.js";

export interface SlashCommand {
  command: SlashCommandBuilder<CacheType>;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => void;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => void;
  button?: (interaction: ButtonInteraction<CacheType>) => void;
  cooldown?: number; // in seconds
}

interface GuildOptions {
  prefix: string;
}

export type GuildOption = keyof GuildOptions;
export interface BotCommand {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
    buttons: Collection<string, Button>;
  }
}
