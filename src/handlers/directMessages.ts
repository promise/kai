import { Message } from "discord.js";

export const directMessageCallbacks = new Map<string, (message: Message) => Promise<void>>();

export default async function handleDirectMessages(message: Message) {
  const callback = directMessageCallbacks.get(message.author.id);
  if (callback) {
    directMessageCallbacks.delete(message.author.id);
    await callback(message);
  }
}
