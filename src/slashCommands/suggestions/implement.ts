import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getRecord, setRecord } from "../../firebase/functions";
import { channels, colours, staff } from "../../config";

/**
 * Implements a suggestion based on the provided suggestion ID.
 * @param interaction - The interaction object representing the command interaction.
 */
export const implementSuggestion = async (
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
