import { Client, EmbedBuilder } from "discord.js";
import { channels, colours, reaction_roles } from "./config";

/**
 * Retrieves the role ID associated with the given emoji ID.
 * @param emoji_id The ID of the emoji.
 * @returns The role ID associated with the emoji, or null if no role is found.
 */
export const getRole = (emoji_id: string) => {
  let role_id;
  Object.values(reaction_roles).find((role) => {
    return Object.values(role.roles).find((role) => {
      if (role.role_emoji.id === emoji_id) role_id = role.role_id;
    });
  });

  return role_id || null;
};

/**
 * Logs a message to the log Discord channel.
 * @param client - The Discord client instance.
 * @param title - The title of the log message.
 * @param message - The content of the log message.
 */
export const log = (client: Client, title: string, message: string) => {
  const channel = client.channels.cache.get(channels.log);

  if (!channel?.isTextBased()) return;
  channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(title)
        .setDescription(message)
        .setColor(colours.log),
    ],
  });
};
