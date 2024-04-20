import { EmbedBuilder, SlashCommandBuilder, GuildMember } from "discord.js";
import { SlashCommand } from "../types";
import moment from "moment";

import { colours } from "../config";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("info")
    .setDescription("DM the user who ran the command.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get information about.")
    ) as SlashCommandBuilder,
  execute: async (interaction) => {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    const memberOfGuild = await interaction.guild?.members.fetch(targetUser.id);

    const embed = new EmbedBuilder()
      .setTitle("User Information")
      .addFields(
        {
          name: "Username:",
          value: targetUser.username,
          inline: true,
        },
        {
          name: "User ID:",
          value: targetUser.id,
          inline: true,
        },
        {
          name: "Created At:",
          value:
            moment(targetUser.createdTimestamp).format("DD/MM/YY") ||
            "Not Found",
          inline: true,
        },
        {
          name: "Date Joined:",
          value:
            moment(memberOfGuild?.joinedTimestamp).format("DD/MM/YY") ||
            "Not Found",
          inline: true,
        },
        {
          name: "Roles",
          value:
            memberOfGuild?.roles.cache
              .filter((role) => role.name !== "@everyone")
              .map((role) => `<@&${role.id}>`)
              .join(", ") || "No roles",
        }
      )
      .setTimestamp()
      .setAuthor({
        name: targetUser.username,
        url: targetUser.displayAvatarURL(),
        iconURL: targetUser.displayAvatarURL(),
      })
      .setColor(colours.log);

    interaction.reply({
      embeds: [embed],
    });
  },
  cooldown: 10,
};

export default command;
