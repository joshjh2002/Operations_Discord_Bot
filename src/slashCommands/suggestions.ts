import {
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

import { SlashCommand } from "../types";
import { colours, channels, staff } from "../config";
import { v4 as uuidv4 } from "uuid";
import { setRecord } from "../firebase/functions";
import { approveSuggestion } from "./suggestions/approve";
import { denySuggestion } from "./suggestions/deny";
import { implementSuggestion } from "./suggestions/implement";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Suggestions Admin.")
    .addSubcommand((subcommand) =>
      subcommand.setName("embed").setDescription("Send suggestions embed.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("approve")
        .setDescription("Approve a suggestion.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the suggestion.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to send to the user.")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("deny")
        .setDescription("Deny a suggestion.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the suggestion.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to send to the user.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("implement")
        .setDescription("Implement a suggestion.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the suggestion.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to send to the user.")
            .setRequired(false)
        )
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  execute: async (interaction) => {
    if (interaction.options.getSubcommand() === "embed") sendEmbed(interaction);
    else if (interaction.options.getSubcommand() === "approve")
      approveSuggestion(interaction);
    else if (interaction.options.getSubcommand() === "deny")
      denySuggestion(interaction);
    else if (interaction.options.getSubcommand() === "implement")
      implementSuggestion(interaction);
  },
  button: async (interaction) => {
    const modal = new ModalBuilder()
      .setCustomId("suggestions")
      .setTitle("Suggestion");

    const suggestionInput = new TextInputBuilder()
      .setCustomId("suggestionInput")
      .setLabel("What is your suggestion?")
      .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      suggestionInput
    );

    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },
  modal: async (interaction) => {
    const suggestion = interaction.fields.getTextInputValue("suggestionInput");

    const suggestionId = uuidv4();

    const embed = new EmbedBuilder()
      .setTitle("Suggestion")
      .setAuthor({
        name: interaction.user.username,
        url: interaction.user.avatarURL(),
        iconURL: interaction.user.avatarURL(),
      })
      .setDescription(
        `<@${interaction.user.id}> has made a suggestion.\n**Status**: Pending`
      )
      .addFields([{ name: "Suggestion:", value: "```" + suggestion + "```" }])
      .setColor(colours.default)
      .setFooter({
        text: `ID: ${suggestionId}`,
      })
      .setTimestamp();

    await interaction.reply({
      content: "Your suggestion has been submitted.",
      embeds: [embed],
      ephemeral: true,
    });

    const channel = interaction.client.channels.cache.get(
      channels.suggestions.inProgress
    );

    if (!channel?.isTextBased()) return;
    let message = await channel.send({
      embeds: [embed],
    });

    const logChannel = interaction.client.channels.cache.get(channels.log);

    if (!logChannel?.isTextBased()) return;
    logChannel.send({
      content: `<@&${staff}>`,
      embeds: [embed],
    });

    setRecord("persistent", "suggestions", suggestionId, {
      author_id: interaction.user.id,
      suggestion: suggestion,
      status: 0,
      message_id: message.id,
      timestamp_submitted: Date.now(),
    });
  },
  cooldown: 10,
};

export default command;

const sendEmbed = async (interaction: ChatInputCommandInteraction) => {
  const button = new ButtonBuilder()
    .setCustomId("suggestions")
    .setLabel("Make a Suggestion")
    .setStyle(ButtonStyle.Primary);

  const component = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  const embed = new EmbedBuilder()
    .setTitle("Suggestions")
    .setDescription("Make a suggestion by clicking the button below.")
    .setColor(colours.default);

  interaction.reply({
    embeds: [embed],
    components: [component],
  });
};
