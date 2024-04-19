import { EmbedBuilder, SlashCommandBuilder, GuildMember } from "discord.js";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("info")
    .setDescription("DM the user who ran the command."),
  execute: async (interaction) => {
    const memberOfGuild = await interaction.guild?.members.fetch(
      interaction.user.id
    );

    const embed = new EmbedBuilder()
      .setTitle("User Information")
      .addFields(
        {
          name: "Username",
          value: interaction.user.username,
        },
        {
          name: "User ID",
          value: interaction.user.id,
        },
        {
          name: "Created At",
          value: interaction.user.createdAt.toString() || "Not Found",
        },
        {
          name: "Date Joined",
          value: memberOfGuild?.joinedAt?.toString() || "Not Found",
        }
      )
      .setTimestamp();

    interaction.reply({
      content: `Here is your information:`,
      embeds: [embed],
      ephemeral: true,
    });
  },
  cooldown: 10,
};

export default command;
