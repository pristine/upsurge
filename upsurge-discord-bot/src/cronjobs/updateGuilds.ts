import { CronJob } from "cron";
import client from "../client";
import { db } from "../db";

async function updateGuilds(): Promise<void> {
  console.log("Updating all guilds");

  const guilds = await client.guilds.fetch();

  const services = await db.service.findMany({
    where: {
      type: "discord",
    },
  });

  const servicesToRemove: string[] = [];
  services.forEach((service) => {
    if (!guilds.has(service.id)) {
      servicesToRemove.push(service.id);
    }
  });

  if (servicesToRemove.length) {
    await db.service.updateMany({
      where: {
        OR: servicesToRemove.map((serviceId) => ({
          id: serviceId,
          type: "discord",
        })),
      },
      data: {
        connected: false,
      },
    });
  }

  for (const [, oauthGuild] of guilds) {
    try {
      const guild = await oauthGuild.fetch();

      const service = services.find((service) => service.id === guild.id);
      if (!service) {
        continue;
      }

      await db.service.update({
        where: {
          id_type: {
            type: "discord",
            id: guild.id,
          },
        },
        data: {
          connected: true,
        },
      });

      const members = await guild.members.fetch();

      const existingUsers = await db.user.findMany({
        where: {
          serviceId: guild.id,
          serviceType: "discord",
          id: {
            in: members.map((member) => member.user.id),
          },
        },
      });

      const existingUserIds = new Set(existingUsers.map((user) => user.id));

      const newMembers = members.filter(
        (member) => !existingUserIds.has(member.user.id),
      );

      const existingMembers = members.filter((member) =>
        existingUserIds.has(member.user.id),
      );

      await db.$transaction([
        db.user.createMany({
          data: newMembers.map((member) => ({
            id: member.user.id,
            username: member.user.username,
            nickname: member.user.displayName,
            profilePicUrl: member.user.avatarURL(),
            joinDate: member.joinedAt ?? new Date(),
            roles: member.roles.cache.map((role) => role.id),
            serviceId: guild.id,
            serviceType: "discord",
          })),
          skipDuplicates: true,
        }),
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        ...existingMembers.map((member) =>
          // eslint-disable-next-line @typescript-eslint/return-await
          db.user.update({
            where: {
              id_serviceId_serviceType: {
                id: member.user.id,
                serviceId: guild.id,
                serviceType: "discord",
              },
            },
            data: {
              roles: member.roles.cache.map((role) => role.id),
              username: member.user.username,
              nickname: member.user.displayName,
              profilePicUrl: member.user.avatarURL(),
            },
          }),
        ),
      ]);
    } catch (e) {
      console.log(e);
    }
  }

  console.log("Finished updating all guilds");
}

const job = new CronJob(
  "0 */5 * * * *",
  updateGuilds, // onTick
  null, // onComplete
  false, // start
  "America/Los_Angeles",
);

export default job;
