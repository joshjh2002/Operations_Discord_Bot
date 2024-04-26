import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../types";
import { reaction_roles } from "../config";
import { setRecord } from "../firebase/functions";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Shows the reaction roles embed.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  execute: async (interaction) => {
    const channel = interaction.channel;

    Object.entries(reaction_roles).forEach(([key, value]) => {
      const embed = new EmbedBuilder()
        .setTitle(value.metadata.name)
        .setColor(value.metadata.color);

      let description = value.metadata.description + "\n";

      Object.entries(value.roles).forEach(([key, value]) => {
        description += `\n<:${value.role_emoji.name}:${value.role_emoji.id}> <@&${value.role_id}>`;
      });

      embed.setDescription(description);

      channel?.send({ embeds: [embed] }).then((message) => {
        setRecord("persistent", "messages", key, {
          channel_id: message?.channel.id,
          message_id: message?.id,
        });

        Object.entries(value.roles).forEach(([key, value]) => {
          message?.react(value.role_emoji.id);
        });
      });
    });

    interaction.reply({
      content: `Done!`,
      ephemeral: true,
    });
  },
  cooldown: 10,
};

export default command;
