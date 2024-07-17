import { type Message } from "discord.js";
import { type Event } from "../event";
import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import { log } from "../log";

function generateRandomBetweenInclusive(
  lowerBound: number,
  upperBound: number,
): number {
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
}

const event: Event = {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    try {
      const guild = message.guild;
      if (!guild) return;

      if (message.author.bot) return;

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
        include: {
          MessageCountAutomation: true,
          MessageDropAutomation: true,
        },
      });
      if (!service) {
        return;
      }

      const member = message.member;
      if (!member) return;

      const guildId = guild.id;
      const userId = member.id;
      const channelId = message.channelId;
      const messageId = message.id;

      let user = await db.user.findUnique({
        where: {
          id_serviceId_serviceType: {
            id: userId,
            serviceId: guildId,
            serviceType: "discord",
          },
        },
      });
      if (!user) return;

      // add this message to our database as we want to keep track of ALL sent message
      await db.userMessage.create({
        data: {
          id: messageId,
          User: {
            connect: {
              id_serviceId_serviceType: {
                id: userId,
                serviceId: guildId,
                serviceType: "discord",
              },
            },
          },
          Channel: {
            connectOrCreate: {
              where: {
                id_serviceId_serviceType: {
                  id: channelId,
                  serviceId: guildId,
                  serviceType: "discord",
                },
              },
              create: {
                id: channelId,
                Service: {
                  connect: {
                    id_type: {
                      id: guildId,
                      type: "discord",
                    },
                  },
                },
              },
            },
          },
          createdAt: message.createdAt,
        },
      });

      if (!service.userRoles.some((role) => member.roles.cache.has(role)))
        return;

      // message drop automation
      if (service.MessageDropAutomation?.enabled) {
        let messageDropAutomation = await db.messageDropAutomation.findUnique({
          where: {
            serviceId_serviceType: {
              serviceId: service.id,
              serviceType: service.type,
            },
          },
        });

        if (messageDropAutomation?.goal === -1) {
          messageDropAutomation = await db.messageDropAutomation.update({
            where: {
              serviceId_serviceType: {
                serviceId: service.id,
                serviceType: service.type,
              },
            },
            data: {
              goal: generateRandomBetweenInclusive(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                messageDropAutomation.lowerBounds,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                messageDropAutomation.upperBounds,
              ),
            },
          });
        }

        await db.messageDropAutomation.update({
          where: {
            serviceId_serviceType: {
              serviceId: service.id,
              serviceType: service.type,
            },
          },
          data: {
            currentCount: { increment: 1 },
          },
        });

        //   if (
        //     (messageDropAutomation?.currentCount ?? 0) >=
        //     (messageDropAutomation?.goal ?? -1)
        //   ) {

        //   }
      }

      // only count if message count automation is enabled
      if (
        service.MessageCountAutomation?.enabled &&
        channelId === service.mainChannel
      ) {
        if (
          !user.lastCurrentMessage ||
          (new Date().getTime() - user.lastCurrentMessage.getTime()) / 1000 >=
            service.MessageCountAutomation.spamDelay
        ) {
          user = await db.user.update({
            where: {
              id_serviceId_serviceType: {
                serviceId: service.id,
                id: userId,
                serviceType: service.type,
              },
            },
            data: {
              currentMessageCount: { increment: 1 },
              lastCurrentMessage: new Date(),
            },
          });
        }

        // update message count goal if not present
        if (user.messageCountGoal === -1) {
          user = await db.user.update({
            where: {
              id_serviceId_serviceType: {
                id: userId,
                serviceId: guildId,
                serviceType: "discord",
              },
            },
            data: {
              messageCountGoal: generateRandomBetweenInclusive(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                service.MessageCountAutomation.lowerBounds,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                service.MessageCountAutomation.upperBounds,
              ),
            },
          });
        }

        // if user hits message goal, then give the user a point
        if (user.currentMessageCount >= user.messageCountGoal) {
          await db.$transaction([
            db.user.update({
              where: {
                id_serviceId_serviceType: {
                  serviceId: service.id,
                  id: userId,
                  serviceType: service.type,
                },
              },
              data: {
                points: { increment: 1 },
                totalPoints: { increment: 1 },
                currentMessageCount: 0,
                messageCountGoal: generateRandomBetweenInclusive(
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  service.MessageCountAutomation.lowerBounds,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  service.MessageCountAutomation.upperBounds,
                ),
              },
            }),
            db.pointActivity.create({
              data: {
                id: uuidv4(),
                points: 1,
                reason: "system",
                type: "add",
                serviceId: service.id,
                serviceType: service.type,
                userServiceType: service.type,
                userId,
                userServiceId: service.id,
              },
            }),
            db.messageCount.create({
              data: {
                id: uuidv4(),
                userId: user.id,
                userServiceId: service.id,
                messageCountAutomationId: service.MessageCountAutomation.id,
                userServiceType: "discord",
              },
            }),
          ]);

          void log({
            guildId: guild.id,
            focus: "automations",
            content:
              `${message.author.toString()} has been rewarded a point by ` +
              "`" +
              "messageCountAutomation" +
              "`" +
              `.`,
            action: "pointsGive",
            actionSource: "automation",
            data: {
              targetUserId: message.author.id,
            },
          });

          await message.channel.send(
            `**${message.author.toString()}**, thank you for being active! You've been rewarded a point!`,
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
