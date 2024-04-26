import { Client, EmbedBuilder } from "discord.js";
import { channels, colours, reaction_roles } from "./config";

export const getRole = (emoji_id: string) => {
  let role_id;
  Object.values(reaction_roles).find((role) => {
    return Object.values(role.roles).find((role) => {
      if (role.role_emoji.id === emoji_id) role_id = role.role_id;
    });
  });

  return role_id || null;
};

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
