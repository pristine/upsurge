import { type Message, type TextBasedChannel } from "discord.js";

export async function fetchAllMessages(
  channel: TextBasedChannel,
): Promise<Message[]> {
  const messages: Message[] = [];

  // Create message pointer
  let message = await channel.messages
    .fetch({ limit: 1 })
    .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

  while (message) {
    console.log("Fetching");
    await channel.messages
      .fetch({ limit: 100, before: message.id })
      .then((messagePage) => {
        messagePage.forEach((msg) => messages.push(msg));

        // Update our message pointer to be the last message on the page of messages
        message =
          messagePage.size > 0 ? messagePage.at(messagePage.size - 1) : null;
      });
  }

  return messages;
}
