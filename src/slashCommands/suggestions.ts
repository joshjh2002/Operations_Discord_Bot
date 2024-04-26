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
import { getRecord, setRecord } from "../firebase/functions";

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

const approveSuggestion = async (interaction: ChatInputCommandInteraction) => {
  const suggestionId = interaction.options.getString("id");
  if (!suggestionId) {
    interaction.reply({
      content: "Please provide a valid suggestion ID.",
      ephemeral: true,
    });
    return;
  }

  const suggestion = await getRecord("persistent", "suggestions", suggestionId);

  if (!suggestion) {
    interaction.reply({
      content: "Suggestion not found.",
      ephemeral: true,
    });
    return;
  }

  if (suggestion.status !== 0) {
    interaction.reply({
      content: "This suggestion has already been processed.",
      ephemeral: true,
    });
    return;
  }

  const originalUser = interaction.client.users.cache.get(suggestion.author_id);

  const embed = new EmbedBuilder()
    .setTitle("Suggestion")
    .setAuthor({
      name: originalUser?.username || "Unknown User",
      url: originalUser?.avatarURL() || "",
      iconURL: originalUser?.avatarURL() || "",
    })
    .setDescription(
      `<@${interaction.user.id}> has approved this suggestion.\n**Status**: Approved`
    )
    .addFields([
      { name: "Suggestion:", value: "```" + suggestion.suggestion + "```" },
      {
        name: "Response:",
        value:
          "```" + interaction.options.getString("message") + "```" ||
          "```No response```",
      },
    ])
    .setColor(colours.log)
    .setFooter({
      text: `ID: ${suggestionId}`,
    })
    .setTimestamp();

  setRecord("persistent", "suggestions", suggestionId, {
    ...suggestion,
    status: 1,
    response: interaction.options.getString("message") || "No response",
    approver_id: interaction.user.id,
    timestamp_approved: Date.now(),
  });

  const channel = interaction.client.channels.cache.get(
    channels.suggestions.inProgress
  );

  if (!channel?.isTextBased()) return;

  const originalMessage = await channel.messages.fetch(suggestion.message_id);
  originalMessage.edit({
    embeds: [embed],
  });

  const logChannel = interaction.client.channels.cache.get(channels.log);

  if (!logChannel?.isTextBased()) return;

  logChannel.send({
    content: `<@&${staff}>`,
    embeds: [embed],
  });

  interaction.reply({
    content: "The suggestion has been approved.",
    embeds: [embed],
    ephemeral: true,
  });
};

const denySuggestion = async (interaction: ChatInputCommandInteraction) => {
  const suggestionId = interaction.options.getString("id");
  if (!suggestionId) {
    return interaction.reply({
      content: "You must provide a suggestion ID.",
      ephemeral: true,
    });
  }

  const suggestion = await getRecord("persistent", "suggestions", suggestionId);
  if (!suggestion) {
    return interaction.reply({
      content: "That suggestion does not exist.",
      ephemeral: true,
    });
  }

  setRecord("persistent", "suggestions", suggestionId, {
    ...suggestion,
    status: -1,
    response_denied: interaction.options.getString("message") || "No response",
    denier_id: interaction.user.id,
    timestamp_denied: Date.now(),
    message_id: null,
  });

  const channel = interaction.client.channels.cache.get(
    channels.suggestions.inProgress
  );

  const originalUser = interaction.client.users.cache.get(suggestion.author_id);

  const embed = new EmbedBuilder()
    .setTitle("Suggestion")
    .setAuthor({
      name: originalUser?.username || "Unknown User",
      url: originalUser?.avatarURL() || "",
      iconURL: originalUser?.avatarURL() || "",
    })
    .setDescription(
      `<@${interaction.user.id}> has denied this suggestion.\n**Status**: Denied`
    )
    .addFields([
      { name: "Suggestion:", value: "```" + suggestion.suggestion + "```" },
      {
        name: "Response:",
        value:
          "```" + interaction.options.getString("message") + "```" ||
          "```No response```",
      },
    ])
    .setColor(colours.log)
    .setFooter({
      text: `ID: ${suggestionId}`,
    })
    .setTimestamp();

  if (!channel?.isTextBased()) return;

  const originalMessage = await channel.messages.fetch(suggestion.message_id);

  originalUser?.send({
    content: `Your suggestion has been denied.`,
    embeds: [embed],
  });

  originalMessage.delete();

  const logChannel = interaction.client.channels.cache.get(channels.log);

  if (!logChannel?.isTextBased()) return;

  logChannel.send({
    content: `<@&${staff}>`,
    embeds: [embed],
  });

  interaction.reply({
    content: "The suggestion has been denied.",
    embeds: [embed],
    ephemeral: true,
  });
};

const implementSuggestion = async (
  interaction: ChatInputCommandInteraction
) => {
  const suggestionId = interaction.options.getString("id");
  if (!suggestionId) {
    interaction.reply({
      content: "Please provide a valid suggestion ID.",
      ephemeral: true,
    });
    return;
  }

  const suggestion = await getRecord("persistent", "suggestions", suggestionId);

  if (!suggestion) {
    interaction.reply({
      content: "Suggestion not found.",
      ephemeral: true,
    });
    return;
  }

  if (suggestion.status === 2) {
    interaction.reply({
      content: "This suggestion has already been implemented.",
      ephemeral: true,
    });
    return;
  }

  const originalUser = interaction.client.users.cache.get(suggestion.author_id);

  const embed = new EmbedBuilder()
    .setTitle("Suggestion")
    .setAuthor({
      name: originalUser?.username || "Unknown User",
      url: originalUser?.avatarURL() || "",
      iconURL: originalUser?.avatarURL() || "",
    })
    .setDescription(
      `This suggestion has been implemented.\n**Status**: Implemented`
    )
    .addFields([
      { name: "Suggestion:", value: "```" + suggestion.suggestion + "```" },
      {
        name: "Response:",
        value:
          "```" + interaction.options.getString("message") + "```" ||
          "```No response```",
      },
    ])
    .setColor(colours.log)
    .setFooter({
      text: `ID: ${suggestionId}`,
    })
    .setTimestamp();

  setRecord("persistent", "suggestions", suggestionId, {
    ...suggestion,
    status: 2,
    implementer_response:
      interaction.options.getString("message") || "No response",
    implementer_id: interaction.user.id,
    timestamp_implemented: Date.now(),
  });

  const channel = interaction.client.channels.cache.get(
    channels.suggestions.inProgress
  );

  if (!channel?.isTextBased()) return;

  const originalMessage = await channel.messages.fetch(suggestion.message_id);
  originalMessage.edit({
    embeds: [embed],
  });

  const logChannel = interaction.client.channels.cache.get(channels.log);

  if (!logChannel?.isTextBased()) return;

  logChannel.send({
    content: `<@&${staff}>`,
    embeds: [embed],
  });

  interaction.reply({
    content: "The suggestion has been implemented.",
    embeds: [embed],
    ephemeral: true,
  });
};
