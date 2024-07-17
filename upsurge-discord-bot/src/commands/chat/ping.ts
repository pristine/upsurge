import { SlashCommand } from "slashasaurus";

export default new SlashCommand(
  {
    name: "ping",
    description: "Pings the bot to make sure everything is working",
    options: [],
  },
  {
    run: (interaction) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        interaction.reply({
          content: `Pong!`,
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
);
