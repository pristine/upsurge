/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Queue from "bee-queue";
import client from "../client";
import { fetchAllMessages } from "../util/channel";
import { db } from "../db";

interface UpdateChannelMessagesArgs {
  channelId: string;
  guildId: string;
}

const queue = new Queue<UpdateChannelMessagesArgs>("updateChannel", {
  redis: {
    host: process.env.REDISHOST,
    port: process.env.REDISPORT,
    db: 0,
    password: process.env.REDISPASSWORD,
  },
});

async function updateChannelMessages(
  data: UpdateChannelMessagesArgs,
): Promise<void> {
  console.log(`Updating channel: ${data.channelId}`);

  const guild = await client.guilds.fetch(data.guildId);
  const channel = await guild.channels.fetch(data.channelId);

  if (!channel) return;
  if (!channel.isTextBased()) return;

  try {
    const messages = await fetchAllMessages(channel);

    const filteredMessages = messages.filter((message) => !message.author.bot);

    const users = filteredMessages.map((message) => message.author);
    const uniqueUsers = Array.from(new Set(users.map((user) => user.id))).map(
      (id) => users.find((user) => user.id === id),
    );

    const uniqueUserGuild = uniqueUsers
      .map((user) => guild.members.cache.get(user!.id))
      .filter((user) => user !== undefined);

    await db.user.createMany({
      data: uniqueUserGuild.map((member) => ({
        id: member!.id,
        serviceId: guild.id,
        serviceType: "discord",
        username: member!.user.username,
        nickname: member!.user.displayName,
        profilePicUrl: member!.avatarURL(),
        roles: member!.roles.cache.map((role) => role.id),
        joinDate: member!.joinedAt ?? new Date(),
      })),
      skipDuplicates: true,
    });

    await db.userMessage.createMany({
      data: filteredMessages.map((message) => ({
        id: message.id,
        userId: message.author.id,
        userServiceId: guild.id,
        userServiceType: "discord",
        channelId: channel.id,
        channelServiceId: guild.id,
        channelServiceType: "discord",
      })),
      skipDuplicates: true,
    });

    // await db.channel.update({
    //   where: {
    //     id_serviceId_serviceType: {
    //       id: channel.id,
    //       serviceId: guild.id,
    //       serviceType: "discord",
    //     },
    //   },
    //   data: {
    //     lastFetched: new Date(),
    //   },
    // });
  } catch (e) {
    console.log(e);
  }

  await db.channel.update({
    where: {
      id_serviceId_serviceType: {
        id: channel.id,
        serviceId: guild.id,
        serviceType: "discord",
      },
    },
    data: {
      isAwaitingFetch: false,
      lastFetched: new Date(),
    },
  });

  console.log(`Finished updating channel message: ${data.channelId}`);
}

queue.process(10, async function (job: any, done: any) {
  const { data } = job;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await updateChannelMessages(data);

  return done();
});

const queueUpdateChannelMessages = async (
  data: UpdateChannelMessagesArgs,
): Promise<Queue.Job<UpdateChannelMessagesArgs>> => {
  await db.channel.upsert({
    where: {
      id_serviceId_serviceType: {
        id: data.channelId,
        serviceId: data.guildId,
        serviceType: "discord",
      },
    },
    create: {
      id: data.channelId,
      serviceId: data.guildId,
      serviceType: "discord",
      isAwaitingFetch: true,
    },
    update: {
      isAwaitingFetch: true,
    },
  });

  const job = queue.createJob(data).retries(1);
  return await job.save();
};

export { queueUpdateChannelMessages, updateChannelMessages };
