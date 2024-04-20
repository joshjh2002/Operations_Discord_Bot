import { Client } from "discord.js";
import { BotCommand } from "../types";
import { getDocument } from "../firebase/functions";

const event: BotCommand = {
  name: "ready",
  once: true,
  execute: (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    getDocument("persistent", "messages").then((data) => {
      if (!data) return;

      Object.entries(data).forEach(([key, value]) => {
        const channel = client.channels.cache.get(value.channel_id);
        if (channel?.isTextBased()) {
          channel.messages.fetch(value.message_id);
        }
      });
    });
  },
};

export default event;
