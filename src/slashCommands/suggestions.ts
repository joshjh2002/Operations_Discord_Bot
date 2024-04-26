import {
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { SlashCommand } from "../types";
import { colours, channels, staff } from "../config";
import { v4 as uuidv4 } from "uuid";
import { setRecord } from "../firebase/functions";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Suggestion Management."),
  execute: async (interaction) => {
    const button = new ButtonBuilder()
      .setCustomId("suggestions")
      .setLabel("Make a Suggestion")
      .setStyle(ButtonStyle.Primary);

    const component = new ActionRowBuilder<ButtonBuilder>().addComponents(
      button
    );

    const embed = new EmbedBuilder()
      .setTitle("Suggestions")
      .setDescription("Make a suggestion by clicking the button below.")
      .setColor(colours.default);

    interaction.reply({
      embeds: [embed],
      components: [component],
    });
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
    });
  },
  cooldown: 10,
};

export default command;
