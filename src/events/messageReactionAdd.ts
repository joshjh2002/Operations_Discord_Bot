import { User, MessageReaction } from "discord.js";
import { BotCommand } from "../types";
import { getRole, log } from "../helpers";

const event: BotCommand = {
  name: "messageReactionAdd",
  execute: async (reaction: MessageReaction, user: User) => {
    if (user.bot) return;

    let member = await reaction.message.guild?.members.fetch(user.id);

    let role_id = getRole(reaction.emoji.id as string);

    if (!role_id) return;

    member?.roles.add(role_id);

    log(
      reaction.client,
      `Role Added`,
      `<@${user.id}> has been given the role: <@&${role_id}>`
    );
  },
};

export default event;
