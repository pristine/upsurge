/**
 *
 *
 *  NOT IN USE
 *
 */
import { db } from "../db";
import client from "../client";
import { CronJob } from "cron";
import { ChannelType } from "discord.js";

async function updateChannelMessages(): Promise<void> {
  console.log("Updating channel messages");
  const guilds = client.guilds.cache.values();

  for (const guild of guilds) {
    // only update active services
    const service = await db.service.findUnique({
      where: {
        id_type: {
          id: guild.id,
          type: "discord",
        },
        Company: {
          mainServiceId: guild.id,
          mainServiceType: "discord",
        },
      },
    });
    if (!service) continue;

    const channels = await guild.channels.fetch();

    const filteredChannels = channels.filter(
      (channel) =>
        channel &&
        channel.isTextBased() &&
        channel.type === ChannelType.GuildText &&
        guild.members.me?.permissionsIn(channel).has("ReadMessageHistory") &&
        guild.members.me?.permissionsIn(channel).has("ViewChannel"),
    );

    console.log(
      `Filetered channels length: ${
        Array.from(filteredChannels.values()).length
      }`,
    );

    for (const channel of filteredChannels.values()) {
      if (!channel) continue;

      const dbChannel = await db.channel.upsert({
        where: {
          id_serviceId_serviceType: {
            id: channel.id,
            serviceId: guild.id,
            serviceType: "discord",
          },
        },
        create: {
          id: channel.id,
          Service: {
            connect: {
              id_type: {
                id: guild.id,
                type: "discord",
              },
            },
          },
        },
        update: {},
      });

      console.log(channel.name);

      // if never updated or 30 minutes
      if (
        (!dbChannel.lastFetched ||
          (dbChannel.lastFetched &&
            (new Date().getTime() - new Date(dbChannel.lastFetched).getTime()) /
              1000 /
              60 >=
              30)) &&
        !dbChannel.isAwaitingFetch
      ) {
        // await queueUpdateChannelMessages({
        //   channelId: channel.id,
        //   guildId: guild.id,
        // });
      }
    }
  }
  console.log("Finished updating channel messages");
}

const job = new CronJob(
  "*/30 * * * * *",
  updateChannelMessages, // onTick
  null, // onComplete
  false, // start
  "America/Los_Angeles",
);

export default job;
