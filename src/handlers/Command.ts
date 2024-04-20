import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "../types";
import { config } from "dotenv";
config();

module.exports = async (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = [];

  let slashCommandsDir = join(__dirname, "../slashCommands");

  readdirSync(slashCommandsDir).forEach((file) => {
    if (!file.endsWith(".js")) return;
    let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
    slashCommands.push(command.command);
    client.slashCommands.set(command.command.name, command);
  });

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN || ""
  );

  const clean = false;

  if (clean)
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID || "",
          process.env.GUILD_ID || ""
        ),
        {
          body: [],
        }
      )
      .then(() => {
        rest
          .put(
            Routes.applicationGuildCommands(
              process.env.CLIENT_ID || "",
              process.env.GUILD_ID || ""
            ),
            {
              body: slashCommands.map((command) => command.toJSON()),
            }
          )
          .then((data: any) => {
            console.log(`Successfully loaded ${data.length} slash command(s)`);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  else
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID || "",
          process.env.GUILD_ID || ""
        ),
        {
          body: slashCommands.map((command) => command.toJSON()),
        }
      )
      .then((data: any) => {
        console.log(`Successfully loaded ${data.length} slash command(s)`);
      })
      .catch((e) => {
        console.log(e);
      });
};
