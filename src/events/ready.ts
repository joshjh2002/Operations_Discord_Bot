import { Client } from "discord.js";
import { BotCommand } from "../types";

const event: BotCommand = {
  name: "ready",
  once: true,
  execute: (client: Client) => {
    console.log(`💪 Logged in as ${client.user?.tag}`);
  },
};

export default event;
