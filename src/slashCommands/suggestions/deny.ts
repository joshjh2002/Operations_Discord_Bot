import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getRecord, setRecord } from "../../firebase/functions";
import { channels, colours, staff } from "../../config";

/**
 * Denies a suggestion.
 * @param interaction - The interaction object representing the command interaction.
 */
export const denySuggestion = async (
  interaction: ChatInputCommandInteraction
) => {
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
