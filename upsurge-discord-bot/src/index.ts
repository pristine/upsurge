import "dotenv/config";
import path from "path";
import fs from "fs";
import { type Event } from "./event";
import client from "./client";
import { updateGuildsJob } from "./cronjobs";
import "./jobs";
const eventsPath: string = path.join(__dirname, "events");
const eventFiles: string[] = fs
  .readdirSync(eventsPath)
  .filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath: string = path.join(eventsPath, file);
  void import(filePath).then((def: { default: Event }) => {
    const event = def.default;
    if (event.once) {
      client.once(event.name, async (...args: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await event.execute(...args);
      });
    } else {
      console.log(event.name);
      client.on(event.name, async (...args: any[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await event.execute(...args);
      });
    }
  });
}

client.once("ready", async () => {
  console.log(`Client ready and logged in as ${client.user?.tag}`);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-non-null-assertion
  client.registerCommandsFrom(
    path.join(__dirname, "commands"),
    true,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.TOKEN!,
  );

  // updateChannelMessagesJob.start();

  if (process.env.NODE_ENV !== "development") {
    updateGuildsJob.start();
  }

  // const guild = await client.guilds.fetch("1023756465288253511");
  // const channel = await guild.channels.fetch("1046338806552481803");

  // console.log("Here");
  // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const messages = await fetchAllMessages(channel as TextBasedChannel);

  // console.log(messages.length);
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
client.login(process.env.TOKEN);
