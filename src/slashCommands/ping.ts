import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping"),
  execute: (interaction) => {
    interaction.reply({
      content: `Ping: ${interaction.client.ws.ping}`,
    });
  },
  cooldown: 10,
};

export default command;
