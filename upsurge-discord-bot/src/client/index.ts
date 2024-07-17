import { IntentsBitField } from "discord.js";
import { SlashasaurusClient } from "slashasaurus";

const client = new SlashasaurusClient(
  {
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.GuildMessageReactions,
    ],
  },
  {},
);

export default client;
