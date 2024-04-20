import { User, MessageReaction } from "discord.js";
import { BotCommand } from "../types";
import { getRole, log } from "../helpers";

const event: BotCommand = {
  name: "messageReactionRemove",
  execute: async (reaction: MessageReaction, user: User) => {
    if (user.bot) return;

    let member = await reaction.message.guild?.members.fetch(user.id);

    let role_id = getRole(reaction.emoji.id as string);

    if (!role_id) return;

    member?.roles.remove(role_id);

    log(
      reaction.client,
      `Role Removed`,
      `<@${user.id}> has lost the role: <@&${role_id}>`
    );
  },
};

export default event;
