import { Client, GatewayIntentBits, Collection } from "discord.js";

const {
  Guilds,
  MessageContent,
  GuildMessages,
  GuildMembers,
  GuildMessageReactions,
} = GatewayIntentBits;

const client = new Client({
  intents: [
    Guilds,
    MessageContent,
    GuildMessages,
    GuildMembers,
    GuildMessageReactions,
  ],
});

import { SlashCommand } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
config();

client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, "./handlers");
readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js")) return;
  require(`${handlersDir}/${handler}`)(client);
});

client.login(process.env.DISCORD_TOKEN);

import { colours, roles } from "./config";
import { setDocument } from "./firebase/functions";

setDocument("config", "colours", colours);
setDocument("config", "roles", roles);
